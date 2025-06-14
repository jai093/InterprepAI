
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InterviewSetup from "@/components/InterviewSetup";
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

// Interface for config from InterviewSetup
interface InterviewConfig {
  type: string;
  jobRole: string;
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

  // Function to "start" interview simulation
  const handleStart = (interviewConfig: FullInterviewConfig) => {
    setConfig(interviewConfig);
    setStep("interview");
  };

  // Complete simulation and show feedback
  const handleComplete = (report: any) => {
    setFeedback(report);
    setStep("feedback");
  };

  // ---- UI ----
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center">
      <Header />
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Show Interview Simulation Steps */}
        {step === "setup" && (
          <>
            <InterviewSetup
              onStart={handleStart}
            />
            {/* Add the ElevenLabs launcher below, as per user request */}
            <div className="mt-10 w-full max-w-md text-center">
              <button
                type="button"
                className="px-8 py-4 text-lg bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition"
                onClick={() => setShowWidget(true)}
              >
                Start Interview (AI Agent)
              </button>
              {/* Widget container is hidden until button pressed */}
              <div
                id="interviewWidget"
                style={{ display: showWidget ? "block" : "none", marginTop: 32 }}
              >
                <elevenlabs-convai
                  agent-id="YflyhSHD0Yqq3poIbnan"
                  terms-content={`#### Terms and Conditions\n\nBy clicking "Agree", and each time I interact with this AI agent, I consent to the recording, storage, and analysis of my conversations by InterPrepAI and its third-party providers including ElevenLabs and OpenAI. If you do not wish to have your conversations recorded, please do not use this service.`}
                  local-storage-key="terms_accepted"
                ></elevenlabs-convai>
              </div>
              {/* Load widget script only when widget is displayed */}
              {showWidget && (
                <script
                  src="https://unpkg.com/@elevenlabs/convai-widget-embed"
                  async
                  type="text/javascript"
                />
              )}
            </div>
          </>
        )}

        {step === "interview" && config && (
          <InterviewSession
            config={config}
            user={user}
            onInterviewComplete={handleComplete}
          />
        )}

        {step === "feedback" && feedback && (
          <FeedbackReport feedback={feedback} onBack={() => setStep("setup")} />
        )}
      </main>
    </div>
  );
};

export default InterviewSimulation;
