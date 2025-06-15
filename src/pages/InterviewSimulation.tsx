
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewSession from "@/components/InterviewSession";
import FeedbackReport from "@/components/FeedbackReport";
import InterviewWidget from "@/components/InterviewWidget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

  // Handler: Begin interview with config
  const handleStart = (interviewConfig: InterviewConfig) => {
    const fullConfig = {
      type: interviewConfig.type,
      jobRole: interviewConfig.jobRole,
      duration: 20, // Default duration
      difficulty: interviewConfig.difficultyLevel || "medium",
    };
    setConfig(fullConfig);
    setStep("interview");
  };

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
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Step: Setup */}
        {step === "setup" && (
          <>
            <InterviewSetup onStart={handleStart} />
            
            {/* AI Interviewer Widget - Show after setup for voice interview */}
            <div className="mt-8 w-full max-w-4xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Voice Interview</h2>
                <p className="text-gray-600">Ready to start your voice interview? Your camera and settings look good!</p>
              </div>
              <InterviewWidget 
                onEndInterview={handleEndInterview}
                showCamera={true}
                interviewConfig={config || {
                  type: "behavioral",
                  jobRole: "Software Engineer", 
                  duration: 20,
                  difficulty: "medium"
                }}
              />
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
