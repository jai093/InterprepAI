
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

// Interface for the config from InterviewSetup
interface InterviewConfig {
  type: string;
  jobRole: string;
}

const InterviewSimulation = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // States for different interview stages
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const [interviewConfig, setInterviewConfig] = useState<FullInterviewConfig | null>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleStartInterview = (config: InterviewConfig) => {
    // Make sure we have all required fields for the interview config
    const fullConfig: FullInterviewConfig = {
      ...config,
      duration: 15, // Default to 15 minutes
      difficulty: 'Medium', // Default to Medium difficulty
    };
    
    setInterviewConfig(fullConfig);
    setStage("interview");
    toast({
      title: "Interview Started",
      description: `Starting a ${config.type} interview for ${config.jobRole} role.`,
    });
  };
  
  const handleEndInterview = (feedbackData: any) => {
    setFeedbackData(feedbackData);
    setStage("feedback");
    toast({
      title: "Interview Complete",
      description: "Your interview session has ended. View your feedback report.",
    });
  };
  
  const handleSaveFeedback = async () => {
    if (!user || !feedbackData) return;
    
    setIsSaving(true);
    
    try {
      // Save interview feedback to database
      // Updated to use the correct table name and field names from the database schema
      const { error } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          type: interviewConfig?.type || '',
          role: interviewConfig?.jobRole || '',
          feedback: JSON.stringify(feedbackData),
          score: feedbackData.overallScore || 0,
          voice_analysis: feedbackData.audioAnalysis || {},
          facial_analysis: feedbackData.facialAnalysis || {},
          body_analysis: feedbackData.bodyLanguageAnalysis || {},
          video_url: feedbackData.recordingUrl || '',
          date: new Date().toISOString(),
          duration: String(feedbackData.duration || 0),
          transcript: JSON.stringify(feedbackData.responses || [])
        });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Feedback Saved",
        description: "Your interview feedback has been saved to your account.",
      });
      
      // Invalidate dashboard data to refresh it
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save feedback. Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRestart = () => {
    setStage("setup");
    setInterviewConfig(null);
    setFeedbackData(null);
  };
  
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Interview Simulation</h1>
          <p className="text-gray-600 mt-1">
            Practice your interview skills with our AI-powered simulation
          </p>
        </div>

        {stage === "setup" && (
          <InterviewSetup onStart={handleStartInterview} />
        )}
        
        {stage === "interview" && interviewConfig && (
          <InterviewSession 
            config={interviewConfig} 
            onEnd={handleEndInterview} 
          />
        )}
        
        {stage === "feedback" && feedbackData && interviewConfig && (
          <FeedbackReport 
            interviewData={{
              ...feedbackData,
              date: new Date(feedbackData.date).toLocaleDateString(),
              duration: `${Math.floor(feedbackData.duration / 60)}:${(feedbackData.duration % 60).toString().padStart(2, '0')}`,
            }} 
            onSave={handleSaveFeedback}
            onRestart={handleRestart}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewSimulation;
