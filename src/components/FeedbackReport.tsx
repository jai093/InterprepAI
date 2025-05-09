
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { FeedbackReportProps } from "./feedback/types";
import { createSafeInterviewData } from "./feedback/utils";
import PerformanceAnalysisTab from "./feedback/PerformanceAnalysisTab";
import RecordingsTab from "./feedback/RecordingsTab";
import TranscriptTab from "./feedback/TranscriptTab";
import ReportFooter from "./feedback/ReportFooter";
import { Skeleton } from "@/components/ui/skeleton";

export interface FeedbackReportProps {
  interviewData: any;
  onSave?: () => Promise<void>;
  onRestart?: () => void;
  isSaving?: boolean;
}

const FeedbackReport = ({ interviewData, onSave, onRestart, isSaving }: FeedbackReportProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Create safe interview data with default values
  const safeInterviewData = createSafeInterviewData(interviewData);
  
  useEffect(() => {
    // Create URL from blobs if available
    const setupMedia = async () => {
      try {
        if (interviewData.videoURL) {
          setVideoUrl(interviewData.videoURL);
        } else if (interviewData.videoBlob) {
          const url = URL.createObjectURL(interviewData.videoBlob);
          setVideoUrl(url);
        } else if (interviewData.recordingUrl) {
          setVideoUrl(interviewData.recordingUrl);
        }
        
        if (interviewData.audioURL) {
          setAudioUrl(interviewData.audioURL);
        } else if (interviewData.audioBlob) {
          const url = URL.createObjectURL(interviewData.audioBlob);
          setAudioUrl(url);
        }

        // Simulate loading for smoother UI transition
        setTimeout(() => setLoading(false), 500);
      } catch (error) {
        console.error("Error setting up media:", error);
        setLoading(false);
      }
    };

    setupMedia();
    
    // Clean up URL objects on unmount
    return () => {
      if (videoUrl && !interviewData.videoURL && !interviewData.recordingUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (audioUrl && !interviewData.audioURL) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [interviewData]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle><Skeleton className="h-8 w-64" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <Skeleton className="h-20 w-20 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Interview Feedback Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Date: {safeInterviewData.date}</p>
              <p className="text-sm text-gray-500">Duration: {safeInterviewData.duration}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="w-20 h-20 rounded-full border-4 border-interprepai-500 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-interprepai-700">{safeInterviewData.overallScore}%</span>
              </div>
              <div>
                <p className="font-medium">Overall Score</p>
                <p className="text-sm text-gray-500">
                  {safeInterviewData.overallScore > 80 ? "Excellent" : 
                   safeInterviewData.overallScore > 70 ? "Very Good" : 
                   safeInterviewData.overallScore > 60 ? "Good" : 
                   safeInterviewData.overallScore > 50 ? "Average" : "Needs Improvement"}
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="analysis" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
              <TabsTrigger value="recordings">Recordings</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis">
              <PerformanceAnalysisTab safeInterviewData={safeInterviewData} />
            </TabsContent>
            
            <TabsContent value="recordings">
              <RecordingsTab videoUrl={videoUrl} audioUrl={audioUrl} />
            </TabsContent>
            
            <TabsContent value="transcript">
              <TranscriptTab safeInterviewData={safeInterviewData} />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <ReportFooter 
          safeInterviewData={safeInterviewData} 
          videoUrl={videoUrl} 
          audioUrl={audioUrl} 
          onSave={onSave}
          onRestart={onRestart}
          isSaving={isSaving}
        />
      </Card>
    </div>
  );
};

export default FeedbackReport;
