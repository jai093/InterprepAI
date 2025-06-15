
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const levelOptions = ["Junior", "Mid", "Senior", "Lead"];

export default function StepRoleDetails({ value, onNext }:
  { value: any; onNext: (vals: { title: string; level: string }) => void }) {
  const [title, setTitle] = useState(value.title || "");
  const [level, setLevel] = useState(value.level || "Junior");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">What is the role you’re hiring for?</h2>
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="e.g. Software Engineer"
        className="mb-4"
      />
      <div className="mb-6 flex gap-2">
        {levelOptions.map(opt => (
          <Button
            key={opt}
            variant={level === opt ? "default" : "outline"}
            onClick={() => setLevel(opt)}
            size="sm"
          >
            {opt}
          </Button>
        ))}
      </div>
      <Button disabled={!title} className="w-full" onClick={() => onNext({ title, level })}>Next</Button>
    </div>
  );
}
