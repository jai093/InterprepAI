
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function StepQuestions({ value, onNext, onBack }:
  { value: any; onNext: (questions: string[]) => void; onBack: () => void }) {
  const [qs, setQs] = useState<string[]>(value.questions || []);

  function handleEdit(idx: number, val: string) {
    setQs(qs => qs.map((q, i) => (i === idx ? val : q)));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Candidate will be asked:</h2>
      <div className="space-y-4 mb-2">
        {qs.map((q, idx) => (
          <div key={idx}>
            <Textarea className="w-full" value={q} onChange={e => handleEdit(idx, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={() => onNext(qs)}>Next</Button>
      </div>
    </div>
  );
}
