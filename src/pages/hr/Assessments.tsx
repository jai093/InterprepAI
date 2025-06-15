
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NewAssessmentDialog from "@/components/hr/assessment/NewAssessmentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

type Assessment = {
  id: string;
  title: string;
  created_at: string;
  questions: any[];
  description: string;
};

function getAssessmentLink(id: string) {
  // You can adjust this URL to match the candidate's interview page route if needed
  return `${window.location.origin}/candidate-interview/${id}`;
}

export default function HrAssessmentsPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAssessments() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setAssessments(data as Assessment[]);
      setLoading(false);
    }
    fetchAssessments();
  }, [user, open]);

  const handleCopyLink = (id: string) => {
    const url = getAssessmentLink(id);
    navigator.clipboard.writeText(url);
    toast({
      title: "Assessment link copied!",
      description: url,
    });
  };

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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex gap-1"
                      onClick={() => handleCopyLink(a.id)}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                    </Button>
                    {/* In future: add "Invite" button or "View Submissions" here */}
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
    </div>
  );
}
