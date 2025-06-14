
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewSession from "@/components/InterviewSession";
import FeedbackReport from "@/components/FeedbackReport";
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

  // For ElevenLabs Widget & AI Avatar animation
  const [aiInProgress, setAIInProgress] = useState(false);
  const aiAvatarRef = useRef<HTMLDivElement | null>(null);

  // Correct type for handler, InterviewConfig as param
  const handleStart = (interviewConfig: InterviewConfig) => {
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

  // Dynamically start ElevenLabs after button click
  const handleStartAIAgent = () => {
    setAIInProgress(true);

    // Custom animated avatar displays (handled by state above)

    // Dynamically create <elevenlabs-convai> widget (off-screen)
    if (!document.getElementById("active-elevenlabs-widget")) {
      const widget = document.createElement("elevenlabs-convai");
      widget.setAttribute("agent-id", "YflyhSHD0Yqq3poIbnan");
      widget.setAttribute("terms-content", `#### Terms and Conditions

By clicking "Agree", and each time I interact with this AI agent, I consent to the recording, storage, and analysis of my conversations by InterPrepAI and its third-party providers including ElevenLabs and OpenAI. If you do not wish to have your conversations recorded, please do not use this service.`);
      widget.setAttribute("local-storage-key", "terms_accepted");
      widget.style.position = "absolute";
      widget.style.left = "-9999px";
      widget.style.width = "1px";
      widget.style.height = "1px";
      widget.id = "active-elevenlabs-widget";
      document.body.appendChild(widget);

      // Ensure the widget's custom element is ready before calling startConversation
      setTimeout(() => {
        if (
          widget &&
          typeof (widget as any).startConversation === "function"
        ) {
          (widget as any).startConversation();
        }
      }, 1000);
    }
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

              {/* Centered animated avatar/message when interview is in progress */}
              {aiInProgress && (
                <div
                  ref={aiAvatarRef}
                  id="ai-animation"
                  className="flex flex-col items-center gap-4 animate-fade-in min-h-[260px]"
                >
                  {/* Optional: animate the img or use lottie/svg */}
                  <img
                    src="/placeholder.svg"
                    width={200}
                    height={200}
                    alt="AI Avatar Talking"
                    className="rounded-full mx-auto pulse shadow-lg"
                  />
                  <p className="text-xl font-semibold mt-2 text-slate-700">
                    Interview in progress...
                  </p>
                  <p className="text-sm text-muted">
                    The AI Interviewer is listening and speaking.
                  </p>
                </div>
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

