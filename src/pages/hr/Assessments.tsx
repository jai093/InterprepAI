
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/ui/dialog";
import NewAssessmentDialog from "@/components/hr/assessment/NewAssessmentDialog";

export default function HrAssessmentsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Button className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-2 px-4 py-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Assessment
        </Button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow text-gray-500 min-h-[150px] flex items-center justify-center">
        {/* Assessment listing will go here in the next step */}
        No assessments yet. Click "Create Assessment" to get started.
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full p-0">
          <NewAssessmentDialog onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
