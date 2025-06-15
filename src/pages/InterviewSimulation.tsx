import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewPrestart from "@/components/InterviewPrestart";
import InterviewSession from "@/components/InterviewSession";
import FeedbackReport from "@/components/FeedbackReport";
import InterviewWidget from "@/components/InterviewWidget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Added "prestart" step!
type Step = "setup" | "prestart" | "interview" | "feedback";

interface FullInterviewConfig {
  type: string;
  jobRole: string;
  duration: number;
  difficulty: string;
}

const InterviewSimulation = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Step management -- now includes 'prestart'!
  const [step, setStep] = useState<Step>("setup");
  const [config, setConfig] = useState<FullInterviewConfig | null>(null);
  const [feedback, setFeedback] = useState<any>(null);

  // Handler: Begin interview with config
  const handleStart = (interviewConfig: InterviewConfig) => {
    const fullConfig = {
      type: interviewConfig.type,
      jobRole: interviewConfig.jobRole,
      duration: 20, // Default duration
      difficulty: interviewConfig.difficultyLevel || "medium",
    };
    setConfig(fullConfig);
    setStep("prestart"); // go to preview step (not to interview directly!)
  };

  // --- NEW: proceed to interview after circular button ---
  const handleBeginInterview = () => setStep("interview");

  // Handler: Conclude interview
  const handleComplete = (report: any) => {
    setFeedback(report);
    setStep("feedback");
  };

  // Handler: End interview widget and return to setup
  const handleEndInterview = () => {
    setStep("setup");
    setConfig(null);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center">
      <Header />
      <main className="w-full flex-1 flex flex-col items-center justify-center px-2 py-4 md:px-6 md:py-10">
        {/* Step: Setup */}
        {step === "setup" && (
          <>
            <InterviewSetup onStart={handleStart} />
          </>
        )}

        {/* Step: Prestart preview -- camera and start! */}
        {step === "prestart" && config && (
          <div className="flex flex-col md:flex-row w-full items-center justify-center md:justify-between gap-6 max-w-6xl">
            <InterviewPrestart
              config={config}
              onStart={handleBeginInterview}
              onBack={() => setStep("setup")}
            />
          </div>
        )}

        {/* Step: Interview - the actual session */}
        {step === "interview" && config && (
          <div className="flex flex-col md:flex-row w-full items-center justify-center md:justify-between gap-6 max-w-6xl">
            <InterviewWidget
              interviewConfig={config}
              onEndInterview={handleEndInterview}
              showCamera={true}
            />
          </div>
        )}

        {/* Feedback, unchanged */}
        {step === "feedback" && feedback && (
          <FeedbackReport interviewData={feedback} onRestart={() => setStep("setup")} />
        )}
      </main>
    </div>
  );
};

export default InterviewSimulation;
