
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Download } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string | null;
  email: string | null;
  resume_url: string | null;
  score: number | null;
  status: string | null;
  feedback: string | null;
  avatar_url: string | null;
}

export function HrCandidateTable({ recruiterId }: { recruiterId: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidates() {
      setLoading(true);
      const { data, error } = await supabase
        .from("shortlistings")
        .select("id, user_id, user_profile:profiles(full_name,email,resume_url,avatar_url), user_score, status, feedback")
        .eq("recruiter_id", recruiterId)
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setCandidates([]);
      } else {
        setCandidates(
          (data || []).map((item: any) => ({
            id: item.user_id,
            full_name: item.user_profile?.full_name,
            email: item.user_profile?.email,
            resume_url: item.user_profile?.resume_url,
            avatar_url: item.user_profile?.avatar_url,
            score: item.user_score,
            status: item.status,
            feedback: item.feedback,
          }))
        );
      }
      setLoading(false);
    }
    if (recruiterId) {
      fetchCandidates();
    }
  }, [recruiterId]);

  // Simulate invite send for the design
  const sendInvite = async (candidateId: string) => {
    const { data, error } = await supabase
      .from("interview_invites")
      .insert([
        {
          recruiter_id: recruiterId,
          user_id: candidateId,
          invite_link: `${window.location.origin}/candidate-interview/${candidateId}?r=${recruiterId}`,
        },
      ])
      .select();
    if (error) {
      toast({ title: "Could not send invite", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invite sent!", description: "Interview link sent to candidate." });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg md:text-xl font-bold">Shortlisted Candidates</h2>
        <span className="text-xs text-gray-500">{candidates.length} found</span>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[80px]">Score</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Resume</TableHead>
                <TableHead className="min-w-[100px]">Invite</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  No candidates yet.
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {candidate.avatar_url ? (
                        <img src={candidate.avatar_url} alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full border flex-shrink-0" />
                      ) : (
                        <span className="inline-block w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-sm md:text-lg font-bold flex-shrink-0">
                          {(candidate.full_name || candidate.email || "?")[0]}
                        </span>
                      )}
                      <span className="truncate text-sm md:text-base">{candidate.full_name || "Candidate"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm md:text-base truncate max-w-[200px]">{candidate.email}</TableCell>
                  <TableCell className="text-sm md:text-base">{candidate.score ?? "-"}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      candidate.status === "invited"
                        ? "bg-indigo-100 text-indigo-800"
                        : candidate.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {candidate.status || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {candidate.resume_url ? (
                      <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center gap-1 text-sm">
                        <Download className="w-4 h-4" /> <span className="hidden md:inline">Resume</span>
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button className="bg-indigo-700 hover:bg-indigo-800 text-xs py-1 px-2 md:px-3" onClick={() => sendInvite(candidate.id)}>
                      <Mail className="w-4 h-4 md:mr-1" /> <span className="hidden md:inline">Invite</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
