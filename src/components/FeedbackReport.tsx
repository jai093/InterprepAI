
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackReportProps {
  interviewData: {
    date: string;
    duration: string;
    overallScore: number;
    responsesAnalysis: {
      clarity: number;
      relevance: number;
      structure: number;
      examples: number;
    };
    nonVerbalAnalysis: {
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
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    videoBlob?: Blob | null;
    audioBlob?: Blob | null;
    videoURL?: string | null;
    audioURL?: string | null;
    transcripts?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

const FeedbackReport = ({ interviewData }: FeedbackReportProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Create URL from blobs if available
    if (interviewData.videoURL) {
      setVideoUrl(interviewData.videoURL);
    } else if (interviewData.videoBlob) {
      const url = URL.createObjectURL(interviewData.videoBlob);
      setVideoUrl(url);
      
      // Clean up URL object on unmount
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    
    if (interviewData.audioURL) {
      setAudioUrl(interviewData.audioURL);
    } else if (interviewData.audioBlob) {
      const url = URL.createObjectURL(interviewData.audioBlob);
      setAudioUrl(url);
      
      // Clean up URL object on unmount
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    
  }, [interviewData]);
  
  const downloadReport = () => {
    try {
      // Create report content
      const reportContent = `
        INTERVIEW FEEDBACK REPORT
        
        Date: ${interviewData.date}
        Duration: ${interviewData.duration}
        Overall Score: ${interviewData.overallScore}%
        
        RESPONSE QUALITY
        - Clarity: ${interviewData.responsesAnalysis.clarity}%
        - Relevance: ${interviewData.responsesAnalysis.relevance}%
        - Structure: ${interviewData.responsesAnalysis.structure}%
        - Examples: ${interviewData.responsesAnalysis.examples}%
        
        NON-VERBAL COMMUNICATION
        - Eye Contact: ${interviewData.nonVerbalAnalysis.eyeContact}%
        - Facial Expressions: ${interviewData.nonVerbalAnalysis.facialExpressions}%
        - Body Language: ${interviewData.nonVerbalAnalysis.bodyLanguage}%
        
        VOICE ANALYSIS
        - Pace: ${interviewData.voiceAnalysis.pace}%
        - Tone: ${interviewData.voiceAnalysis.tone}%
        - Clarity: ${interviewData.voiceAnalysis.clarity}%
        - Confidence: ${interviewData.voiceAnalysis.confidence}%
        
        STRENGTHS
        ${interviewData.strengths.map(s => `- ${s}`).join('\n')}
        
        AREAS FOR IMPROVEMENT
        ${interviewData.improvements.map(i => `- ${i}`).join('\n')}
        
        RECOMMENDATIONS
        ${interviewData.recommendations.map(r => `- ${r}`).join('\n')}
        
        TRANSCRIPTS
        ${interviewData.transcripts?.map(t => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n') || ''}
      `;
      
      // Create a blob from the report content
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-feedback-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Downloaded",
        description: "Your interview feedback report has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download Error",
        description: "Could not download the report.",
        variant: "destructive"
      });
    }
  };
  
  const downloadRecording = () => {
    if (!videoUrl) {
      toast({
        title: "No recording available",
        description: "There is no video recording to download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `interview-recording-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Video Downloaded",
        description: "Your interview video has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: "Download Error",
        description: "Could not download the video.",
        variant: "destructive"
      });
    }
  };
  
  const downloadAudio = () => {
    if (!audioUrl) {
      toast({
        title: "No audio available",
        description: "There is no audio recording to download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `interview-audio-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Audio Downloaded",
        description: "Your interview audio has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast({
        title: "Download Error",
        description: "Could not download the audio.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Interview Feedback Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Date: {interviewData.date}</p>
              <p className="text-sm text-gray-500">Duration: {interviewData.duration}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="w-20 h-20 rounded-full border-4 border-interprepai-500 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-interprepai-700">{interviewData.overallScore}%</span>
              </div>
              <div>
                <p className="font-medium">Overall Score</p>
                <p className="text-sm text-gray-500">Above average</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AnalysisCard 
              title="Response Quality" 
              data={interviewData.responsesAnalysis} 
            />
            <AnalysisCard 
              title="Non-verbal Communication" 
              data={interviewData.nonVerbalAnalysis} 
            />
            <AnalysisCard 
              title="Voice Analysis" 
              data={interviewData.voiceAnalysis} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {interviewData.strengths.map((strength, i) => (
                    <li key={i} className="text-sm">{strength}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {interviewData.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm">{improvement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {interviewData.recommendations.map((recommendation, i) => (
                    <li key={i} className="text-sm">{recommendation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 sm:flex-row">
          <Button 
            className="w-full sm:w-auto bg-interprepai-700 hover:bg-interprepai-800 flex items-center"
            onClick={downloadReport}
          >
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">View Interview Recording</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Interview Recording</DialogTitle>
              </DialogHeader>
              {videoUrl ? (
                <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">No video recording available</p>
                </div>
              )}
              
              {audioUrl && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Audio Only:</h3>
                  <audio ref={audioRef} src={audioUrl} controls className="w-full" />
                </div>
              )}
              
              <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {videoUrl && (
                  <Button variant="outline" onClick={downloadRecording} className="flex items-center">
                    <Download className="mr-2 h-4 w-4" /> Download Video
                  </Button>
                )}
                
                {audioUrl && (
                  <Button variant="outline" onClick={downloadAudio} className="flex items-center">
                    <Download className="mr-2 h-4 w-4" /> Download Audio
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link to="/simulation">Start New Interview</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

interface AnalysisCardProps {
  title: string;
  data: Record<string, number>;
}

const AnalysisCard = ({ title, data }: AnalysisCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="flex justify-between items-center mb-1">
              <span className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="text-xs font-medium">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getScoreColorClass(value)}`}
                style={{ width: `${value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const getScoreColorClass = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
};

export default FeedbackReport;
