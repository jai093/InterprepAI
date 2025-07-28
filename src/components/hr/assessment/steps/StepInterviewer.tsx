
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const LANGUAGE_OPTIONS = ["English"];
const ACCENT_OPTIONS = ["Neutral", "Indian", "American", "British"];

export default function StepInterviewer({ value, onNext, onBack }: {
  value: any;
  onNext: (vals: { language: string; accent: string }) => void;
  onBack: () => void;
}) {
  const [language, setLanguage] = useState(value.language || "English");
  const [accent, setAccent] = useState(value.accent || "Neutral");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select Interview Settings</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Language</label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full" />
          <SelectContent>
            {LANGUAGE_OPTIONS.map(l => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-6">
        <label className="block mb-1 font-medium">Accent</label>
        <Select value={accent} onValueChange={setAccent}>
          <SelectTrigger className="w-full" />
          <SelectContent>
            {ACCENT_OPTIONS.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={() => onNext({ language, accent })}>Create Assessment</Button>
      </div>
    </div>
  );
}
