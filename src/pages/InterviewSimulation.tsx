
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeedbackReport from "@/components/FeedbackReport";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewSession from "@/components/InterviewSession";

const InterviewSimulation = () => {
  const { toast } = useToast();
  
  // States for different interview stages
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [feedbackData, setFeedbackData] = useState(null);
  
  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setStage("interview");
    toast({
      title: "Interview Started",
      description: "Your camera and microphone are now active.",
    });
  };
  
  const handleEndInterview = (feedbackData: any) => {
    setFeedbackData(feedbackData);
    setStage("feedback");
    toast({
      title: "Interview Completed",
      description: "Generating your feedback report...",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {stage === "setup" && <InterviewSetup onStart={handleStartInterview} />}
          
          {stage === "interview" && interviewConfig && (
            <InterviewSession config={interviewConfig} onEnd={handleEndInterview} />
          )}
          
          {stage === "feedback" && feedbackData && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
                <p className="text-gray-600">Review your performance and areas for improvement</p>
              </div>
              <FeedbackReport interviewData={feedbackData} />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InterviewSimulation;
