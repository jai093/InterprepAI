import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, User as UserIcon, Copy as CopyIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NewAssessmentDialog from "@/components/hr/assessment/NewAssessmentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

type Assessment = {
  id: string;
  title: string;
  created_at: string;
  questions: string[]; // fix type here: use string[] (or any[] if structure varies a lot)
  description: string;
};

function getAssessmentLink(assessmentId: string, candidateId: string) {
  return `${window.location.origin}/candidate-interview/${candidateId}?a=${assessmentId}`;
}

export default function HrAssessmentsPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // Change to any[] while fetching, will cast later
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { user } = useAuth();
  const [candidateDialog, setCandidateDialog] = useState<{show: boolean, assessmentId?: string}>({show: false});
  const [candidateId, setCandidateId] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateResolvedId, setCandidateResolvedId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  // Normalizes Supabase result to the Assessment type
  function normalizeAssessment(raw: any): Assessment {
    return {
      id: raw.id,
      title: raw.title,
      created_at: raw.created_at,
      description: raw.description,
      questions: Array.isArray(raw.questions)
        ? raw.questions
        : typeof raw.questions === "string"
          ? (() => {
              try { return JSON.parse(raw.questions); } catch { return []; }
            })()
          : [],
    };
  }

  useEffect(() => {
    async function fetchAssessments() {
      if (!user) return;
      setLoading(true);

      // Force Supabase to treat .select() result as any[]
      const { data, error } = await supabase
        .from("assessments")
        .select("*") as unknown as { data: any[]; error: any };

      if (!error && Array.isArray(data)) {
        // No recursive inference now
        const assessed: Assessment[] = data.map(normalizeAssessment);
        setAssessments(assessed);
      } else {
        setAssessments([]);
      }
      setLoading(false);
    }
    fetchAssessments();
  }, [user, open]);

  const handleCopyLink = (assessmentId: string, candidateId: string) => {
    const url = getAssessmentLink(assessmentId, candidateId);
    navigator.clipboard.writeText(url);
    toast({
      title: "Assessment link copied!",
      description: url,
    });
  };

  async function resolveCandidateId(email: string) {
    setResolving(true);
    setCandidateResolvedId(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    setResolving(false);
    if (error || !data) {
      toast({
        variant: "destructive",
        title: "No user found with this email.",
        description: "Double-check user exists and email is correct.",
      });
      return;
    }
    setCandidateResolvedId(data.id);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Button
          className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-2 px-4 py-2"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Assessment
        </Button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow text-gray-500 min-h-[150px] flex flex-col items-center justify-center">
        {loading ? (
          <div>Loading assessments...</div>
        ) : assessments.length === 0 ? (
          <span>No assessments yet. Click "Create Assessment" to get started.</span>
        ) : (
          <div className="w-full">
            <ul className="space-y-4">
              {assessments.map((a) => (
                <li key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <div className="text-lg font-semibold text-indigo-900">{a.title}</div>
                    <div className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex gap-1"
                      onClick={() => setCandidateDialog({show: true, assessmentId: a.id})}
                      title="Share to candidate"
                    >
                      <UserIcon className="w-4 h-4" />
                      Share to Candidate
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full p-0">
          <NewAssessmentDialog onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Candidate Link Share Dialog */}
      <Dialog open={candidateDialog.show} onOpenChange={(v) => setCandidateDialog({show: v})}>
        <DialogContent className="max-w-md w-full flex flex-col gap-1">
          <div className="mb-2 font-semibold text-lg flex items-center gap-2"><UserIcon className="w-5 h-5" /> Share Assessment Link</div>
          <div className="text-gray-500 mb-2">
            Enter the candidate's email address (registered) to generate a unique interview link. 
          </div>
          <form
            className="flex flex-col gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!candidateEmail) return;
              await resolveCandidateId(candidateEmail);
            }}
          >
            <input
              type="email"
              className="border p-2 rounded"
              value={candidateEmail}
              onChange={e => { setCandidateEmail(e.target.value); setCandidateResolvedId(null); }}
              placeholder="candidate@email.com"
              required
            />
            <Button type="submit" disabled={resolving} size="sm" className="self-start">{resolving ? "Searching..." : "Find Candidate"}</Button>
          </form>
          {candidateResolvedId && candidateDialog.assessmentId && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-green-700 text-sm mb-1">User found. Share this link:</div>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  className="w-full border border-gray-200 rounded px-2 py-1 bg-gray-50 text-xs"
                  value={getAssessmentLink(candidateDialog.assessmentId, candidateResolvedId)}
                />
                <Button
                  size="icon"
                  variant="default"
                  onClick={() => handleCopyLink(candidateDialog.assessmentId!, candidateResolvedId)}
                  title="Copy assessment link"
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
