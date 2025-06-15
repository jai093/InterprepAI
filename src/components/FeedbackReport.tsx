import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { SafeInterviewData } from "./feedback/types";
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

const DATA_FIELDS_MAP = [
  { key: 'candidate_name', label: 'Candidate Name' },
  { key: 'target_role', label: 'Target Role' },
  { key: 'mobile_number', label: 'Mobile Number' },
  { key: 'confidence_score', label: 'Confidence Score' },
  { key: 'resume_url', label: 'Resume URL' },
  { key: 'interview_overall_score', label: 'Overall AI Interview Score' },
  { key: 'language_used', label: 'Language Used' },
  { key: 'email_address', label: 'Email Address' },
  { key: 'date', label: 'Date' },
  { key: 'duration', label: 'Duration' }
];

const EVALUATION_CRITERIA_MAP = [
  { key: 'voice_modulation', label: 'Voice Modulation', description: 'Variation in voice (tone, pitch, pace) conveying confidence and engagement.' },
  { key: 'body_language', label: 'Body Language & Expressions', description: 'Facial expressions, eye contact, and gestures from webcam analysis.' },
  { key: 'problem_solving', label: 'Problem Solving Ability', description: 'Approach to scenario-based or logical questions.' },
  { key: 'communication_style', label: 'Communication Style', description: 'Interactivity and engagement in conversation.' },
  { key: 'example_usage', label: 'Example Usage', description: 'Inclusion of examples, stories, or data to support answers.' },
  { key: 'tone_language', label: 'Tone and Language', description: 'Professional and workplace-appropriate tone.' },
  { key: 'structure', label: 'Structure', description: 'Logical structure in answering (e.g., STAR method).' },
  { key: 'confidence', label: 'Confidence', description: 'Delivery and tone of being self-assured.' },
  { key: 'relevance', label: 'Relevance', description: 'How directly the answer addresses the question.' },
  { key: 'clarity', label: 'Clarity', description: 'Clear articulation of responses.' }
];

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

        setTimeout(() => setLoading(false), 500);
      } catch (error) {
        console.error("Error setting up media:", error);
        setLoading(false);
      }
    };

    setupMedia();

    return () => {
      if (videoUrl && !interviewData.videoURL && !interviewData.recordingUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (audioUrl && !interviewData.audioURL) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    // eslint-disable-next-line
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

  // Utility to get value or fallback from interview data
  const getFieldValue = (fieldKey: string) => {
    // Provide robust fallback for missing/undefined values
    return typeof interviewData[fieldKey] !== "undefined" && interviewData[fieldKey] !== null
      ? interviewData[fieldKey] : "--";
  };

  const renderDataFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-5">
      {DATA_FIELDS_MAP.map(item => (
        <div key={item.key}>
          <span className="text-sm font-semibold mr-1">{item.label}:</span>
          <span className="text-sm">{getFieldValue(item.key)}</span>
        </div>
      ))}
    </div>
  );

  const renderCriteria = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {EVALUATION_CRITERIA_MAP.map(crit => (
        <div key={crit.key} className="bg-gray-50 rounded-xl border p-4 flex flex-col">
          <span className="font-semibold text-base mb-1">{crit.label}</span>
          <span className="text-2xl font-mono text-indigo-700">{getFieldValue(crit.key)}%</span>
          <span className="text-xs text-gray-500 mt-1">{crit.description}</span>
        </div>
      ))}
    </div>
  );

  const handleDownloadReport = () => {
    // Report includes all criteria and extracted data fields
    let reportContent = `Interview Feedback Report\n\n`;

    DATA_FIELDS_MAP.forEach(item => {
      if (getFieldValue(item.key))
        reportContent += `${item.label}: ${getFieldValue(item.key)}\n`;
    });

    reportContent += `\nEvaluation:\n`;
    EVALUATION_CRITERIA_MAP.forEach(crit => {
      if (typeof interviewData[crit.key] !== "undefined")
        reportContent += `- ${crit.label}: ${interviewData[crit.key]}\n`;
    });

    reportContent += `\nThank you!\n`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-feedback-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Interview Feedback Report</CardTitle>
          <div className="flex flex-row justify-end items-center space-x-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition text-sm"
              onClick={handleDownloadReport}
            >
              Download Full Report
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {renderDataFields()}

          {renderCriteria()}

          <Tabs defaultValue="analysis" className="mb-6 mt-6">
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
