import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeedbackReport from "@/components/FeedbackReport";
import InterviewSetup, { InterviewConfig } from "@/components/InterviewSetup";
import InterviewSession from "@/components/InterviewSession";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const InterviewSimulation = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // States for different interview stages
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setStage("interview");
    toast({
      title: "Interview Started",
      description: "Your camera and microphone are now active.",
    });
  };
  
  const handleEndInterview = async (feedbackData: any) => {
    setFeedbackData(feedbackData);
    setStage("feedback");
    
    if (user) {
      setIsSaving(true);
      try {
        console.log('Saving interview data:', {
          user_id: user.id,
          type: interviewConfig?.type || 'General',
          jobRole: interviewConfig?.jobRole || 'General',
          feedback: feedbackData
        });
        
        // Check feedback data structure and use appropriate fields
        const score = feedbackData.overallScore || 0;
        
        // Make sure we have valid objects for all analysis data
        const voiceAnalysis = feedbackData.voiceAnalysis || {};
        const facialAnalysis = feedbackData.facialAnalysis || {};
        const bodyAnalysis = feedbackData.bodyAnalysis || {};
        const responsesAnalysis = feedbackData.responsesAnalysis || {};
        
        // Save interview data to Supabase with all analytics fields
        const { data, error } = await supabase.from('interview_sessions').insert({
          user_id: user.id,
          type: interviewConfig?.type || 'General',
          role: interviewConfig?.jobRole || 'General',
          duration: feedbackData.duration || '0 minutes',
          score: score,
          voice_analysis: {
            clarity: voiceAnalysis.clarity || 0,
            pace: voiceAnalysis.pace || 0,
            pitch: voiceAnalysis.pitch || 0,
            tone: voiceAnalysis.tone || 0,
            confidence: voiceAnalysis.confidence || 0,
          },
          facial_analysis: {
            smile: facialAnalysis.smile || 0,
            neutrality: facialAnalysis.neutrality || 0,
            confidence: facialAnalysis.confidence || 0,
            engagement: facialAnalysis.engagement || 0,
            eyeContact: facialAnalysis.eyeContact || 0,
            facialExpressions: facialAnalysis.facialExpressions || facialAnalysis.smile || 0,
          },
          // Include body analysis as a separate field in the database
          body_analysis: {
            posture: bodyAnalysis.posture || 0,
            gestures: bodyAnalysis.gestures || 0,
            movement: bodyAnalysis.movement || 0,
            presence: bodyAnalysis.presence || 0,
          },
          // Include response analysis data
          response_analysis: {
            clarity: responsesAnalysis.clarity || 0,
            relevance: responsesAnalysis.relevance || 0,
            structure: responsesAnalysis.structure || 0,
            examples: responsesAnalysis.examples || 0,
          },
          transcript: feedbackData.transcript || feedbackData.transcripts?.[0]?.answer || '',
          feedback: feedbackData.feedback || JSON.stringify(feedbackData.recommendations || []),
          video_url: feedbackData.videoURL || feedbackData.videoUrl || null
        });
        
        if (error) {
          console.error("Failed to save interview data:", error);
          throw error;
        }
        
        // Invalidate interviews query to refresh dashboard
        queryClient.invalidateQueries({ queryKey: ['interviews'] });
        
        toast({
          title: "Interview Completed",
          description: "Your feedback report is ready and results have been saved.",
        });
      } catch (error) {
        console.error("Failed to save interview data:", error);
        toast({
          title: "Saving Error",
          description: "Failed to save your interview data.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      toast({
        title: "Interview Completed",
        description: "Generating your feedback report...",
      });
    }
  };

  const handleStartNewInterview = () => {
    setStage("setup");
    setInterviewConfig(null);
    setFeedbackData(null);
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
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
                    <p className="text-gray-600">Review your performance and areas for improvement</p>
                  </div>
                  <button 
                    onClick={handleStartNewInterview} 
                    className="px-4 py-2 bg-interprepai-600 hover:bg-interprepai-700 text-white rounded-lg transition-colors"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Start New Interview'}
                  </button>
                </div>
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
