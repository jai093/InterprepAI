
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StepSkills({ value, onNext, onBack }:
  { value: any; onNext: (skills: string[]) => void; onBack: () => void }) {
  const [input, setInput] = useState("");
  const [skills, setSkills] = useState<string[]>(value.skills || []);

  function addSkill(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || skills.length >= 3) return;
    setSkills(skills => [...skills, input.trim()]);
    setInput("");
  }
  function removeSkill(s: string) {
    setSkills(skills => skills.filter(x => x !== s));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Competency Focus: List up to 3 skills</h2>
      <form onSubmit={addSkill} className="flex gap-2 mb-4">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. NodeJS, Team Management"
        />
        <Button type="submit" disabled={!input.trim() || skills.length >= 3}>Add</Button>
      </form>
      <div className="flex gap-2 mb-5">
        {skills.map(skill => (
          <span key={skill} className="bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full flex items-center">
            {skill}
            <button className="ml-2 text-xs text-red-600" onClick={() => removeSkill(skill)}>✕</button>
          </span>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button disabled={skills.length === 0} onClick={() => onNext(skills)}>Next</Button>
      </div>
    </div>
  );
}
