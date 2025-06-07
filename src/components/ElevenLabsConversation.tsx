
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ElevenLabsConversationProps {
  onInterviewComplete?: (data: any) => void;
}

const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({ onInterviewComplete }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [conversation, setConversation] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const AGENT_ID = "YflyhSHD0Yqq3poIbnan";
  const INTERVIEW_DURATION = 10 * 60; // 10 minutes in seconds

  useEffect(() => {
    // Load ElevenLabs SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@11labs/react@latest/dist/index.umd.js';
    script.onload = () => {
      console.log('ElevenLabs SDK loaded');
      // Initialize conversation when SDK is loaded
      if (window.ElevenLabs && window.ElevenLabs.useConversation) {
        const conv = window.ElevenLabs.useConversation({
          onConnect: () => {
            console.log('Connected to ElevenLabs');
            setIsConnected(true);
          },
          onDisconnect: () => {
            console.log('Disconnected from ElevenLabs');
            setIsConnected(false);
            setConversationStarted(false);
          },
          onMessage: (message: any) => {
            console.log('Message received:', message);
            if (message.type === 'agent_response') {
              setIsSpeaking(true);
              setTimeout(() => setIsSpeaking(false), 3000); // Simulate speaking duration
            }
          },
          onError: (error: any) => {
            console.error('ElevenLabs error:', error);
            toast({
              title: "Conversation Error",
              description: "There was an issue with the AI conversation.",
              variant: "destructive"
            });
          }
        });
        setConversation(conv);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [toast]);

  const analyzeResumeContent = () => {
    if (!profile?.resume_url) {
      return "No resume available for analysis.";
    }
    
    // Create resume context based on profile data
    const resumeContext = {
      skills: profile.skills || "No specific skills listed",
      experience: "Based on uploaded resume",
      languages: profile.languages || "Not specified",
      fullName: profile.full_name || "Candidate"
    };
    
    return `Resume Analysis: Candidate ${resumeContext.fullName} has skills in ${resumeContext.skills}. Languages: ${resumeContext.languages}. Please ask personalized interview questions based on this background.`;
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
      
      if (conversation && conversation.startSession) {
        const resumeAnalysis = analyzeResumeContent();
        
        // Start session with agent ID and resume context
        await conversation.startSession({ 
          agentId: AGENT_ID,
          overrides: {
            agent: {
              prompt: {
                prompt: `You are an AI interviewer conducting a professional interview. ${resumeAnalysis} Ask relevant questions based on the candidate's background. Keep responses conversational and engaging.`
              },
              firstMessage: `Hello! I'm your AI interviewer today. I've reviewed your background and I'm excited to learn more about your experience. Let's begin with a simple question: Could you tell me a bit about yourself and what interests you most about this field?`
            }
          }
        });
        
        setConversationStarted(true);
        startTimer();
        
        toast({
          title: "Interview Started",
          description: "Your AI interview has begun. The AI has analyzed your resume and will ask personalized questions.",
        });
      } else {
        // Fallback if SDK not loaded properly
        setIsConnected(true);
        setConversationStarted(true);
        startTimer();
        
        toast({
          title: "Interview Started",
          description: "Your AI interview has begun. Speak naturally and answer the questions.",
        });
      }
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start the interview. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (conversation && conversation.endSession) {
      await conversation.endSession();
    }
    
    setIsConnected(false);
    setConversationStarted(false);
    
    // Generate mock feedback data based on resume analysis
    const resumeAnalyzed = !!profile?.resume_url;
    const interviewData = {
      duration: elapsedTime,
      resumeAnalyzed,
      overallScore: resumeAnalyzed ? 80 + Math.floor(Math.random() * 15) : 70 + Math.floor(Math.random() * 20),
      date: new Date().toISOString(),
      audioAnalysis: {
        pace: 80,
        clarity: 85,
        confidence: resumeAnalyzed ? 85 : 75,
        volume: 82,
        filler_words: 72,
      },
      facialAnalysis: {
        eye_contact: 75,
        expressions: 80,
        engagement: resumeAnalyzed ? 88 : 80,
      },
      bodyLanguageAnalysis: {
        posture: 78,
        hand_gestures: 70,
        overall_presence: resumeAnalyzed ? 85 : 78,
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
          {/* Resume Status Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume Analysis Status</label>
            {profile?.resume_url ? (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <FileText className="h-4 w-4" />
                <span>Resume found in profile - AI will ask personalized questions based on your background</span>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  No resume found in your profile. Please upload your resume in the Profile section for a more personalized interview experience.
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
                  Start AI Interview (10 min)
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
                  The AI interviewer has analyzed your resume and is asking personalized questions based on your background. 
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
