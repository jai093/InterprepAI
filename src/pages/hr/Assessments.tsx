
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, User as UserIcon, Copy as CopyIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NewAssessmentDialog from "@/components/hr/assessment/NewAssessmentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Assessment = {
  id: string;
  title: string;
  created_at: string;
  questions: string[];
  description: string;
};

function getAssessmentLink(assessmentId: string, candidateId: string) {
  return `${window.location.origin}/candidate-interview/${candidateId}?a=${assessmentId}`;
}

// Simple toast function to avoid type complexity
const showToast = (title: string, description?: string, variant?: 'default' | 'destructive') => {
  // Simple console log for now to avoid type issues
  console.log(`Toast: ${title}`, description);
  
  // You can implement a simple toast UI here if needed
  const toastElement = document.createElement('div');
  toastElement.className = `fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${
    variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
  }`;
  toastElement.textContent = `${title}${description ? `: ${description}` : ''}`;
  document.body.appendChild(toastElement);
  
  setTimeout(() => {
    if (document.body.contains(toastElement)) {
      document.body.removeChild(toastElement);
    }
  }, 3000);
};

export default function HrAssessmentsPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { user } = useAuth();
  const [candidateDialog, setCandidateDialog] = useState<{show: boolean, assessmentId?: string}>({show: false});
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateResolvedId, setCandidateResolvedId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  // Simplified normalizeAssessment function with explicit typing
  function normalizeAssessment(raw: any): Assessment {
    let questions: string[] = [];
    
    if (raw.questions) {
      if (Array.isArray(raw.questions)) {
        questions = raw.questions;
      } else if (typeof raw.questions === "string") {
        try {
          const parsed = JSON.parse(raw.questions);
          if (Array.isArray(parsed)) {
            questions = parsed;
          }
        } catch {
          // ignore parsing errors
        }
      }
    }

    return {
      id: raw.id,
      title: raw.title,
      created_at: raw.created_at,
      description: raw.description || "",
      questions: questions,
    };
  }

  useEffect(() => {
    async function fetchAssessments() {
      if (!user) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("*");

        if (error) throw error;

        if (data && Array.isArray(data)) {
          const normalizedAssessments = (data as any[]).map((item: any) => normalizeAssessment(item));
          setAssessments(normalizedAssessments);
        } else {
          setAssessments([]);
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
        setAssessments([]);
      }
      setLoading(false);
    }
    fetchAssessments();
  }, [user, open]);

  const handleCopyLink = (assessmentId: string, candidateId: string) => {
    const url = getAssessmentLink(assessmentId, candidateId);
    navigator.clipboard.writeText(url);
    showToast("Assessment link copied!", url);
  };

  async function resolveCandidateId(email: string) {
    setResolving(true);
    setCandidateResolvedId(null);
    
    try {
      // Bypass TypeScript inference completely by treating supabase as any
      const client: any = supabase;
      const response = await client.from("profiles").select("id").eq("email", email).maybeSingle();
        
      if (response.error) {
        throw response.error;
      }
      
      if (!response.data) {
        showToast("No user found with this email.", "Double-check user exists and email is correct.", "destructive");
        return;
      }
      
      setCandidateResolvedId(response.data.id);
    } catch (error) {
      console.error("Error resolving candidate:", error);
      showToast("Error finding candidate", "Please try again.", "destructive");
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Assessments</h1>
        <Button
          className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base w-full sm:w-auto"
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
              {(assessments as Assessment[]).map((a: Assessment) => (
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
