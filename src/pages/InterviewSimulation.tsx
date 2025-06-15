import { useState } from "react";
import Header from "@/components/Header";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewPrestart from "@/components/InterviewPrestart";
import InterviewSession from "@/components/InterviewSession";
import FeedbackReport from "@/components/FeedbackReport";

type Step = "setup" | "prestart" | "interview" | "feedback";

interface FullInterviewConfig {
  type: string;
  jobRole: string;
  duration: number;
  difficulty: string;
}

const InterviewSimulation = () => {
  // Step management
  const [step, setStep] = useState<Step>("setup");
  const [config, setConfig] = useState<FullInterviewConfig | null>(null);
  const [feedback, setFeedback] = useState<any>(null);

  // Begin interview with config
  const handleStart = (interviewConfig: InterviewConfig) => {
    const fullConfig = {
      type: interviewConfig.type,
      jobRole: interviewConfig.jobRole,
      duration: 20, // Default duration
      difficulty: interviewConfig.difficultyLevel || "medium",
    };
    setConfig(fullConfig);
    setStep("prestart"); // Show camera preview first
  };

  // Proceed from prestart to live interview
  const handleBeginInterview = () => setStep("interview");

  // Updated: get blobs from feedback and pass to FeedbackReport
  const handleComplete = (report: any) => {
    setFeedback(report);
    setStep("feedback");
  };

  // Restart to setup
  const handleEndInterview = () => {
    setStep("setup");
    setConfig(null);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center">
      <Header />
      <main className="w-full flex-1 flex flex-col items-center justify-center px-2 py-4 md:px-6 md:py-10">
        {step === "setup" && <InterviewSetup onStart={handleStart} />}
        {step === "prestart" && config && (
          <InterviewPrestart
            config={config}
            onStart={handleBeginInterview}
            onBack={() => setStep("setup")}
          />
        )}
        {step === "interview" && config && (
          <InterviewSession config={config} onEnd={handleComplete} />
        )}
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
