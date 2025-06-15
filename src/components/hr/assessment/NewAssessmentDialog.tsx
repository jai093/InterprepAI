
import React from "react";
import AssessmentStepper from "./AssessmentStepper";
import { DialogTitle } from "@/components/ui/dialog";

export default function NewAssessmentDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6">
      <DialogTitle>Create New Assessment</DialogTitle>
      <AssessmentStepper onDone={onClose} />
    </div>
  );
}
