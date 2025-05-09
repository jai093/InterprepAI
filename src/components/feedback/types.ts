
export interface InterviewData {
  date: string;
  duration: string;
  overallScore: number;
  responsesAnalysis: {
    clarity: number;
    relevance: number;
    structure: number;
    examples: number;
  };
  nonVerbalAnalysis?: {
    eyeContact: number;
    facialExpressions: number;
    bodyLanguage: number;
  };
  voiceAnalysis: {
    pace: number;
    tone: number;
    clarity: number;
    confidence: number;
  };
  facialAnalysis?: {
    smile: number;
    neutrality: number;
    confidence: number;
    engagement: number;
    eyeContact?: number;
    facialExpressions?: number;
  };
  bodyAnalysis?: {
    posture: number;
    gestures: number;
    movement: number;
    presence: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  videoBlob?: Blob | null;
  audioBlob?: Blob | null;
  videoURL?: string | null;
  audioURL?: string | null;
  recordingUrl?: string | null;
  transcripts?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface SafeInterviewData {
  date: string;
  duration: string;
  overallScore: number;
  responsesAnalysis: {
    clarity: number;
    relevance: number;
    structure: number;
    examples: number;
  };
  nonVerbalAnalysis?: {
    eyeContact: number;
    facialExpressions: number;
    bodyLanguage: number;
  };
  voiceAnalysis: {
    pace: number;
    tone: number;
    clarity: number;
    confidence: number;
  };
  facialAnalysis: {
    smile: number;
    neutrality: number;
    confidence: number;
    engagement: number;
    eyeContact: number;
    facialExpressions: number;
  };
  bodyAnalysis: {
    posture: number;
    gestures: number;
    movement: number;
    presence: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  transcripts?: Array<{
    question: string;
    answer: string;
  }>;
}

// This interface is no longer needed as we're defining FeedbackReportProps directly in FeedbackReport.tsx
// to avoid conflicts
//export interface FeedbackReportProps {
//  interviewData: InterviewData;
//}
