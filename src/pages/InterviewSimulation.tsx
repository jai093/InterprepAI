import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewSession from "@/components/InterviewSession";
import FeedbackReport from "@/components/FeedbackReport";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import AnimatedAIWidget from "@/components/AnimatedAIWidget";

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

  // Step management
  const [step, setStep] = useState<"setup" | "interview" | "feedback">("setup");
  const [config, setConfig] = useState<FullInterviewConfig | null>(null);
  const [feedback, setFeedback] = useState<any>(null);

  // Animated AI Widget (shown after "Start AI Interview")
  const [aiInProgress, setAIInProgress] = useState(false);

  // Handler: Begin interview with config
  const handleStart = (interviewConfig: InterviewConfig) => {
    setConfig({
      type: interviewConfig.type,
      jobRole: interviewConfig.jobRole,
      duration: 20, // Default duration
      difficulty: interviewConfig.difficultyLevel || "medium",
    });
    setStep("interview");
  };

  // Handler: Conclude interview
  const handleComplete = (report: any) => {
    setFeedback(report);
    setStep("feedback");
    setAIInProgress(false);
  };

  // Start custom AI Widget (instead of ElevenLabs)
  const handleStartAIAgent = () => {
    setAIInProgress(true);
    // Former ElevenLabs widget is no longer mounted.
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center">
      <Header />
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Step: Setup */}
        {step === "setup" && (
          <>
            <InterviewSetup onStart={handleStart} />
            {/* AI Interviewer (Custom Widget launcher) */}
            <div className="mt-10 w-full max-w-md text-center relative">
              {!aiInProgress && (
                <button
                  id="start-interview-btn"
                  type="button"
                  className="px-8 py-4 text-lg bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition hover-scale shadow-md"
                  onClick={handleStartAIAgent}
                >
                  Start Interview (AI Agent)
                </button>
              )}

              {/* Animated AI Widget */}
              {aiInProgress && (
                <AnimatedAIWidget
                  isSpeaking={true}
                  message="The AI Interviewer is talking to you!"
                  onClose={() => setAIInProgress(false)}
                />
              )}
            </div>
          </>
        )}

        {/* Step: Interview */}
        {step === "interview" && config && (
          <InterviewSession config={config} onEnd={handleComplete} />
        )}

        {/* Step: Feedback */}
        {step === "feedback" && feedback && (
          <FeedbackReport
            interviewData={feedback}
            onRestart={() => setStep("setup")}
          />
        )}
      </main>
    </div>
  );
};

export default InterviewSimulation;
