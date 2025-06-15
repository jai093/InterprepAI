
import React, { useState } from "react";
import StepRoleDetails from "./steps/StepRoleDetails";
import StepAssessmentType from "./steps/StepAssessmentType";
import StepSkills from "./steps/StepSkills";
import StepQuestions from "./steps/StepQuestions";
import StepInterviewer from "./steps/StepInterviewer";
import StepComplete from "./steps/StepComplete";

type Step = 0 | 1 | 2 | 3 | 4 | 5;
const stepNames = [
  "Role Details",
  "Assessment Type",
  "Skills",
  "Questions",
  "Interviewer Settings",
  "Complete"
];

export type NewAssessment = {
  title: string;
  level: string;
  type: "ai" | "custom";
  skills: string[];
  questions: string[];
  language: string;
  accent: string;
};

export default function AssessmentStepper({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [assessment, setAssessment] = useState<Partial<NewAssessment>>({
    type: "ai",
    skills: [],
    questions: [],
    language: "English",
    accent: "Neutral"
  });

  // Step handlers (each can update relevant data)
  function setField<K extends keyof NewAssessment>(key: K, value: NewAssessment[K]) {
    setAssessment((old) => ({ ...old, [key]: value }));
  }

  // Simulate AI generating questions
  async function handleGenerateQuestions(skills: string[]) {
    // For now: placeholder logic, later could route to backend
    return skills.map((s, i) => `Tell us about your experience with ${s}.`);
  }

  // Save to Supabase (would use recruiter context/user)
  async function saveAssessment() {
    const body = {
      title: assessment.title!,
      description: `Role: ${assessment.level}`,
      questions: assessment.questions!,
      // TODO: recruiter_id (from context), for now fake uuid
      recruiter_id: "", // will be filled by backend, or add as prop in integration
    };
    // Insert assessment into Supabase (integration in future step)
    // On success...
    setStep(5);
  }

  // Steps content
  const steps = [
    <StepRoleDetails key="role"
      value={assessment}
      onNext={({ title, level }) => { setField("title", title); setField("level", level); setStep(1); }}
    />,
    <StepAssessmentType key="type"
      value={assessment}
      onNext={(type) => { setField("type", type); setStep(2); }}
      onBack={() => setStep(0)}
    />,
    <StepSkills key="skills"
      value={assessment}
      onNext={async (skills) => {
        setField("skills", skills);
        const questions = await handleGenerateQuestions(skills);
        setField("questions", questions);
        setStep(3);
      }}
      onBack={() => setStep(1)}
    />,
    <StepQuestions key="questions"
      value={assessment}
      onNext={(questions) => { setField("questions", questions); setStep(4); }}
      onBack={() => setStep(2)}
    />,
    <StepInterviewer key="interviewer"
      value={assessment}
      onNext={({ language, accent }) => { setField("language", language); setField("accent", accent); saveAssessment(); }}
      onBack={() => setStep(3)}
    />,
    <StepComplete key="complete"
      value={assessment}
      onClose={onDone}
    />
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {stepNames.map((name, idx) => (
          <div key={name} className="flex items-center">
            <div className={`rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold 
              ${idx === step ? "bg-indigo-700 text-white" : idx < step ? "bg-indigo-300 text-white" : "bg-gray-300 text-gray-700"}`}>
              {idx + 1}
            </div>
            {idx < stepNames.length - 1 && (
              <div className={`w-8 h-1 mx-1 ${idx < step ? "bg-indigo-300" : "bg-gray-300"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="min-h-[280px]">
        {steps[step]}
      </div>
    </div>
  );
}
