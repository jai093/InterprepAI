import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewSession from "@/components/InterviewSession";
import FeedbackReport from "@/components/FeedbackReport";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Define the expected config type to match what InterviewSession expects
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

  // For ElevenLabs Widget
  const [showWidget, setShowWidget] = useState(false);

  // Correct type for handler, InterviewConfig as param
  const handleStart = (interviewConfig: InterviewConfig) => {
    // Map InterviewConfig to FullInterviewConfig
    setConfig({
      type: interviewConfig.type,
      jobRole: interviewConfig.jobRole,
      duration: 20, // Default duration
      difficulty: interviewConfig.difficultyLevel || "medium",
    });
    setStep("interview");
  };

  // Interview complete handler
  const handleComplete = (report: any) => {
    setFeedback(report);
    setStep("feedback");
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center">
      <Header />
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Step: Setup */}
        {step === "setup" && (
          <>
            <InterviewSetup onStart={handleStart} />
            {/* AI Interviewer (ElevenLabs widget launcher) */}
            <div className="mt-10 w-full max-w-md text-center">
              <button
                type="button"
                className="px-8 py-4 text-lg bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition"
                onClick={() => setShowWidget(true)}
              >
                Start Interview (AI Agent)
              </button>
              {/* The widget is only shown when showWidget is true */}
              <div
                id="interviewWidget"
                style={{
                  display: showWidget ? "block" : "none",
                  marginTop: 32,
                }}
              >
                <elevenlabs-convai
                  agent-id="YflyhSHD0Yqq3poIbnan"
                  terms-content={`#### Terms and Conditions\n\nBy clicking "Agree", and each time I interact with this AI agent, I consent to the recording, storage, and analysis of my conversations by InterPrepAI and its third-party providers including ElevenLabs and OpenAI. If you do not wish to have your conversations recorded, please do not use this service.`}
                  local-storage-key="terms_accepted"
                ></elevenlabs-convai>
              </div>
              {/* Ensure widget script is loaded only when widget is displayed */}
              {showWidget && (
                <script
                  src="https://unpkg.com/@elevenlabs/convai-widget-embed"
                  async
                  type="text/javascript"
                ></script>
              )}
            </div>
          </>
        )}

        {/* Step: Interview */}
        {step === "interview" && config && (
          <InterviewSession
            config={config}
            onEnd={handleComplete}
          />
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
