
import React, { useState } from "react";
import AssessmentStepper from "./AssessmentStepper";

export default function NewAssessmentDialog({ onClose }: { onClose: () => void }) {
  // We'll handle navigation inside stepper and call onClose at the end
  return (
    <div className="p-6">
      <AssessmentStepper onDone={onClose} />
    </div>
  );
}
