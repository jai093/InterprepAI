import React, { useState } from "react";
import StepRoleDetails from "./steps/StepRoleDetails";
import StepAssessmentType from "./steps/StepAssessmentType";
import StepSkills from "./steps/StepSkills";
import StepQuestions from "./steps/StepQuestions";
import StepInterviewer from "./steps/StepInterviewer";
import StepComplete from "./steps/StepComplete";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

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

  const { user } = useAuth();

  function setField<K extends keyof NewAssessment>(key: K, value: NewAssessment[K]) {
    setAssessment((old) => ({ ...old, [key]: value }));
  }

  // STRONGLY prefer using supabase.functions.invoke for edge functions
  async function handleGenerateQuestions(skills: string[]) {
    const role = assessment.title || "Software Engineer";
    const language = assessment.language || "English";
    const level = assessment.level || "Mid";
    try {
      const { data, error } = await supabase.functions.invoke("generate-gemini-questions", {
        body: {
          role,
          language,
          skills,
          level,
        }
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "AI question generation failed",
          description: error.message || "Falling back to generic questions.",
        });
        // Log error details for diagnostics
        console.log("Gemini error object from supabase.functions.invoke:", error);
        return skills.map((s) => `Tell us about your experience with ${s}.`);
      }
      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Gemini function error",
          description: data.error,
        });
        // Log error diagnostic
        console.log("Gemini response data.error:", data.error);
        return skills.map((s) => `Tell us about your experience with ${s}.`);
      }
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
      // fallback if Gemini returns no usable questions
      toast({
        variant: "destructive",
        title: "Gemini returned no questions",
        description: "Fallback to generic skill questions.",
      });
      return skills.map((s) => `Tell us about your experience with ${s}.`);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gemini API Error",
        description: "Unable to generate questions. Using fallback.",
      });
      // Log JS error diagnostic
      console.error("Gemini JS exception:", err);
      return skills.map((s) => `Tell us about your experience with ${s}.`);
    }
  }

  async function saveAssessment() {
    if (!user) return;
    const body = {
      title: assessment.title!,
      description: `Role: ${assessment.level}`,
      questions: assessment.questions!,
      recruiter_id: user.id,
    };
    const { error } = await supabase.from("assessments").insert([body]);
    if (!error) setStep(5);
    // You may want to handle error UI/toast here for production
  }

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
