
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ElevenLabsConversationProps {
  onInterviewComplete?: (data: any) => void;
}

const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({ onInterviewComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const AGENT_ID = "YflyhSHD0Yqq3poIbnan";
  const INTERVIEW_DURATION = 10 * 60; // 10 minutes in seconds

  useEffect(() => {
    // Load ElevenLabs SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@11labs/react@latest/dist/index.umd.js';
    script.onload = () => {
      console.log('ElevenLabs SDK loaded');
    };
    document.head.appendChild(script);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      // In a real implementation, you'd extract text from PDF
      // For now, we'll simulate it
      setResumeText("Candidate has experience in software development, React, Node.js, and database management.");
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been analyzed and will be used for personalized interview questions.",
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= INTERVIEW_DURATION) {
          endConversation();
          return INTERVIEW_DURATION;
        }
        return newTime;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startConversation = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // In a real implementation with @11labs/react:
      // const conversation = useConversation({
      //   onConnect: () => setIsConnected(true),
      //   onDisconnect: () => setIsConnected(false),
      //   onMessage: (message) => console.log('Message:', message),
      // });
      // await conversation.startSession({ agentId: AGENT_ID });
      
      // For now, simulate the connection
      setIsConnected(true);
      setConversationStarted(true);
      startTimer();
      
      toast({
        title: "Interview Started",
        description: "Your AI interview has begun. Speak naturally and answer the questions.",
      });
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start the interview. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsConnected(false);
    setConversationStarted(false);
    
    // Generate mock feedback data
    const interviewData = {
      duration: elapsedTime,
      resumeAnalyzed: !!resumeFile,
      overallScore: 75 + Math.floor(Math.random() * 20),
      date: new Date().toISOString(),
      audioAnalysis: {
        pace: 80,
        clarity: 85,
        confidence: 78,
        volume: 82,
        filler_words: 72,
      },
      facialAnalysis: {
        eye_contact: 75,
        expressions: 80,
        engagement: 85,
      },
      bodyLanguageAnalysis: {
        posture: 78,
        hand_gestures: 70,
        overall_presence: 80,
      },
    };
    
    if (onInterviewComplete) {
      onInterviewComplete(interviewData);
    }
    
    toast({
      title: "Interview Complete",
      description: `Your ${formatTime(elapsedTime)} interview session has ended.`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Interview with Resume Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resume Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Resume (Optional)</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={conversationStarted}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Resume
              </Button>
              {resumeFile && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  {resumeFile.name}
                </div>
              )}
            </div>
            {resumeFile && (
              <Alert>
                <AlertDescription>
                  Resume uploaded successfully! The AI will ask personalized questions based on your experience.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Interview Controls */}
          <div className="space-y-4">
            {conversationStarted && (
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {formatTime(INTERVIEW_DURATION - elapsedTime)}
                </div>
                <div className="text-sm text-gray-500">Time Remaining</div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {!conversationStarted ? (
                <Button onClick={startConversation} className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Start Interview (10 min)
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={endConversation}
                    className="flex items-center gap-2"
                  >
                    <MicOff className="h-4 w-4" />
                    End Interview
                  </Button>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-md">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700">
                      {isSpeaking ? "AI Speaking..." : "Listening..."}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {conversationStarted && (
              <Alert>
                <AlertDescription>
                  The AI interviewer is analyzing your resume and asking personalized questions. 
                  Speak clearly and naturally. The interview will automatically end after 10 minutes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElevenLabsConversation;
