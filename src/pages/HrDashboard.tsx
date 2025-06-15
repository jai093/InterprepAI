
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Shortlisting {
  id: string;
  user_id: string;
  user_score: number;
  feedback: string | null;
  status: string;
  created_at: string;
  recruiter_id: string;
  user_profile?: {
    full_name: string | null;
    resume_url: string | null;
    languages: string | null;
    skills: string | null;
    avatar_url: string | null;
  };
}

export default function HrDashboard() {
  const { user } = useAuth();
  const [shortlistings, setShortlistings] = useState<Shortlisting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortlist = async () => {
      // Get the recruiter's shortlistings (joined with candidate profile)
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("shortlistings")
        .select("*, user_profile:profiles(full_name,resume_url,languages,skills,avatar_url)")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setShortlistings([]);
      } else {
        setShortlistings(data || []);
      }
      setLoading(false);
    };

    fetchShortlist();
  }, [user?.id]);

  // HR can send an invite (automated AI link for now)
  const sendInvite = async (candidateId: string) => {
    // Create unique link for the candidate
    const { data, error } = await supabase
      .from("interview_invites")
      .insert([
        {
          recruiter_id: user?.id,
          user_id: candidateId,
          invite_link: `${window.location.origin}/candidate-interview/${candidateId}?r=${user?.id}`,
        }
      ])
      .select();

    if (error) {
      toast({ title: "Could not send invite", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invite sent!", description: "Interview link is ready for the candidate." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">HR Dashboard (Shortlisted Candidates)</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-5">
          {shortlistings.length === 0 && (
            <div className="text-gray-500 text-center">No shortlisted candidates yet.</div>
          )}
          {shortlistings.map((item) => (
            <div key={item.id} className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-4">
                {item.user_profile?.avatar_url && (
                  <img src={item.user_profile.avatar_url} alt="avatar" className="w-14 h-14 rounded-full border" />
                )}
                <div>
                  <div className="font-semibold text-lg">{item.user_profile?.full_name || "Candidate"}</div>
                  <div className="text-sm text-gray-500">Score: <span className="font-bold">{item.user_score}</span></div>
                  <div className="text-xs text-gray-400 mt-1">{item.user_profile?.skills}</div>
                </div>
              </div>
              <div className="mt-3 md:mt-0 flex flex-col gap-2">
                {item.user_profile?.resume_url && (
                  <a
                    href={item.user_profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline text-sm"
                  >
                    View Resume
                  </a>
                )}
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition mt-2"
                  onClick={() => sendInvite(item.user_id)}
                >
                  Send Interview Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
