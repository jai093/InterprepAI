
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, User as UserIcon, Copy as CopyIcon, FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NewAssessmentDialog from "@/components/hr/assessment/NewAssessmentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { HrSidebar } from "@/components/hr/HrSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <HrSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-indigo-900">Assessments</h1>
              <SidebarTrigger />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-2">Assessments</h1>
                  <p className="text-gray-600 text-sm md:text-base">Create and manage interview assessments</p>
                </div>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-4 py-2 w-full sm:w-auto"
                  onClick={() => setOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create Assessment
                </Button>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Loading assessments...</span>
                  </div>
                ) : assessments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first assessment</p>
                    <Button
                      onClick={() => setOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Assessment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {assessment.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {assessment.description || "No description"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Created: {new Date(assessment.created_at).toLocaleDateString()}</span>
                            <span>{assessment.questions.length} questions</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setCandidateDialog({show: true, assessmentId: assessment.id})}
                          >
                            <UserIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Share to Candidate</span>
                            <span className="sm:hidden">Share</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full mx-4">
          <NewAssessmentDialog onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Candidate Link Share Dialog */}
      <Dialog open={candidateDialog.show} onOpenChange={(v) => setCandidateDialog({show: v})}>
        <DialogContent className="max-w-md w-full mx-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Share Assessment Link</h2>
            </div>
            <p className="text-sm text-gray-600">
              Enter the candidate's email address to generate a unique interview link.
            </p>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!candidateEmail) return;
                await resolveCandidateId(candidateEmail);
              }}
            >
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={candidateEmail}
                onChange={e => { setCandidateEmail(e.target.value); setCandidateResolvedId(null); }}
                placeholder="candidate@email.com"
                required
              />
              <Button 
                type="submit" 
                disabled={resolving} 
                className="w-full sm:w-auto"
              >
                {resolving ? "Searching..." : "Find Candidate"}
              </Button>
            </form>
            {candidateResolvedId && candidateDialog.assessmentId && (
              <div className="space-y-3 mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">✓ User found. Share this link:</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-md bg-gray-50"
                    value={getAssessmentLink(candidateDialog.assessmentId, candidateResolvedId)}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCopyLink(candidateDialog.assessmentId!, candidateResolvedId)}
                    className="px-3"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
