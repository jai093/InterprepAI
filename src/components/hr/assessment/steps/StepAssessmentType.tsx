
import React from "react";
import { Button } from "@/components/ui/button";

export default function StepAssessmentType({ value, onNext, onBack }:
  { value: any; onNext: (type: "ai" | "custom") => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Choose Assessment Type</h2>
      <div className="flex flex-col gap-3 mb-5">
        <Button className={`w-full py-5 bg-indigo-700`} onClick={() => onNext("ai")}>
          <span className="font-bold text-lg">AI Assisted (recommended)</span><br />
          <span className="text-xs text-indigo-100">Auto-generate competency-based questions</span>
        </Button>
        <Button className="w-full py-5 opacity-60 cursor-not-allowed" disabled>
          <span className="font-bold text-lg">Customized Question Set</span><br />
          <span className="text-xs">Coming soon</span>
        </Button>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button variant="ghost" onClick={() => onNext("ai")}>Next</Button>
      </div>
    </div>
  );
}
