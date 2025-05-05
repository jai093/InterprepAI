
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SafeInterviewData } from "./types";

interface ReportFooterProps {
  safeInterviewData: SafeInterviewData;
  videoUrl: string | null;
  audioUrl: string | null;
}

const ReportFooter = ({ safeInterviewData, videoUrl, audioUrl }: ReportFooterProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const downloadReport = () => {
    try {
      // Create report content
      const reportContent = `
        INTERVIEW FEEDBACK REPORT
        
        Date: ${safeInterviewData.date}
        Duration: ${safeInterviewData.duration}
        Overall Score: ${safeInterviewData.overallScore}%
        
        RESPONSE QUALITY
        - Clarity: ${safeInterviewData.responsesAnalysis.clarity}%
        - Relevance: ${safeInterviewData.responsesAnalysis.relevance}%
        - Structure: ${safeInterviewData.responsesAnalysis.structure}%
        - Examples: ${safeInterviewData.responsesAnalysis.examples}%
        
        NON-VERBAL COMMUNICATION
        - Eye Contact: ${safeInterviewData.facialAnalysis?.eyeContact || safeInterviewData.nonVerbalAnalysis?.eyeContact}%
        - Facial Expressions: ${safeInterviewData.facialAnalysis?.facialExpressions || safeInterviewData.facialAnalysis?.smile || safeInterviewData.nonVerbalAnalysis?.facialExpressions}%
        - Body Language: ${safeInterviewData.bodyAnalysis?.posture || safeInterviewData.nonVerbalAnalysis?.bodyLanguage}%
        
        VOICE ANALYSIS
        - Pace: ${safeInterviewData.voiceAnalysis.pace}%
        - Tone: ${safeInterviewData.voiceAnalysis.tone}%
        - Clarity: ${safeInterviewData.voiceAnalysis.clarity}%
        - Confidence: ${safeInterviewData.voiceAnalysis.confidence}%
        
        FACIAL EXPRESSION ANALYSIS
        - Smile: ${safeInterviewData.facialAnalysis.smile}%
        - Neutrality: ${safeInterviewData.facialAnalysis.neutrality}%
        - Confidence: ${safeInterviewData.facialAnalysis.confidence}%
        - Engagement: ${safeInterviewData.facialAnalysis.engagement}%
        
        BODY LANGUAGE ANALYSIS
        - Posture: ${safeInterviewData.bodyAnalysis.posture}%
        - Gestures: ${safeInterviewData.bodyAnalysis.gestures}%
        - Movement: ${safeInterviewData.bodyAnalysis.movement}%
        - Presence: ${safeInterviewData.bodyAnalysis.presence}%
        
        STRENGTHS
        ${safeInterviewData.strengths.map(s => `- ${s}`).join('\n')}
        
        AREAS FOR IMPROVEMENT
        ${safeInterviewData.improvements.map(i => `- ${i}`).join('\n')}
        
        RECOMMENDATIONS
        ${safeInterviewData.recommendations.map(r => `- ${r}`).join('\n')}
        
        TRANSCRIPTS
        ${safeInterviewData.transcripts?.map(t => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n') || ''}
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
  
  const downloadVideo = () => {
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
              <Button variant="outline" onClick={downloadVideo} className="flex items-center">
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
  );
};

export default ReportFooter;
