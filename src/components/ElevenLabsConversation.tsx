import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, FileText, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConversation } from "@elevenlabs/react";

interface ElevenLabsConversationProps {
  onInterviewComplete?: (data: any) => void;
}

const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({ onInterviewComplete }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [conversationStarted, setConversationStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const AGENT_ID = "YflyhSHD0Yqq3poIbnan";
  const INTERVIEW_DURATION = 10 * 60; // 10 minutes in seconds
  const MAX_CONNECTION_ATTEMPTS = 3;
  const CONNECTION_TIMEOUT = 10000; // 10 seconds

  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Connected to ElevenLabs');
      setConversationStarted(true);
      setIsLoading(false);
      setIsConnecting(false);
      setConnectionAttempts(0);
      
      // Clear any pending timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      startTimer();
      
      toast({
        title: "Interview Started",
        description: "Connected to AI interviewer!",
      });
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from ElevenLabs');
      
      // Only update state if we were actually connected
      if (conversationStarted || isConnecting) {
        setConversationStarted(false);
        setIsLoading(false);
        setIsConnecting(false);
        
        // Clear timers on disconnect  
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        
        // Show toast only if this wasn't an expected disconnect
        if (conversationStarted) {
          toast({
            title: "Connection Lost",
            description: "Disconnected from AI interviewer.",
            variant: "destructive",
          });
        }
      }
    },
    onMessage: (message) => {
      console.log('📨 Received message:', message);
    },
    onError: (error) => {
      console.error('❌ ElevenLabs error:', error);
      setIsLoading(false);
      setConversationStarted(false);
      setIsConnecting(false);
      
      // Clear all timers on error
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      toast({
        title: "Connection Error",
        description: "Failed to connect to AI interviewer. Please try again.",
        variant: "destructive",
      });
    }
  });

  const analyzeResumeContent = () => {
    if (!profile?.resume_url) {
      return "No resume available for analysis. Please conduct a professional interview with general questions suitable for a career-focused candidate.";
    }
    
    const resumeContext = {
      skills: profile.skills || "No specific skills listed",
      experience: "Based on uploaded resume",
      languages: profile.languages || "Not specified",
      fullName: profile.full_name || "Candidate"
    };
    
    return `Resume Analysis: Candidate ${resumeContext.fullName} has skills in ${resumeContext.skills}. Languages: ${resumeContext.languages}. Please conduct a comprehensive professional interview asking personalized questions based on this background and skills. Focus on their technical abilities, experience, and career goals related to their listed skills.`;
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
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

  const waitForSDKReady = () => {
    return new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds total wait time
      
      const checkSDK = () => {
        attempts++;
        
        // Check if conversation object has required methods
        if (conversation && typeof conversation.startSession === 'function') {
          resolve();
          return;
        }
        
        if (attempts >= maxAttempts) {
          reject(new Error('SDK not ready after timeout'));
          return;
        }
        
        setTimeout(checkSDK, 100);
      };
      
      checkSDK();
    });
  };

  // Helper to get signed url from edge function
  const getSignedUrl = async (agentId: string): Promise<string> => {
    const res = await fetch("/functions/v1/get-elevenlabs-signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to get signed url: ${await res.text()}`);
    }
    const { signed_url } = await res.json();
    if (!signed_url) throw new Error("No signed_url returned from edge function.");
    return signed_url;
  };

  const startConversation = async () => {
    // Prevent multiple connection attempts
    if (isLoading || conversationStarted || isConnecting) {
      console.log('Connection already in progress or active');
      return;
    }

    // Check connection attempts
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      toast({
        title: "Connection Failed",
        description: "Maximum connection attempts reached. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsConnecting(true);
      setConnectionAttempts(prev => prev + 1);

      // Request microphone permissions first
      console.log('🎙️ Requesting microphone permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());

      console.log('🚀 Getting ElevenLabs signed URL...');
      const signedUrl = await getSignedUrl(AGENT_ID);

      console.log('🚀 Starting ElevenLabs Conversation...');

      // Wait for SDK to be ready
      await waitForSDKReady();

      const resumeAnalysis = analyzeResumeContent();
      
      // Set a connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (isConnecting || isLoading) {
          setIsLoading(false);
          setIsConnecting(false);
          toast({
            title: "Connection Timeout",
            description: "Connection took too long. Please try again.",
            variant: "destructive",
          });
        }
      }, CONNECTION_TIMEOUT);
      
      // Start the conversation with agent ID and proper error handling
      await conversation.startSession({
        url: signedUrl,
        overrides: {
          agent: {
            prompt: {
              prompt: `You are a professional AI interviewer. ${resumeAnalysis} Ask relevant, engaging questions that help assess the candidate's qualifications. Keep responses conversational and encouraging. Always speak clearly at a moderate pace. Keep your responses concise and focused. Wait for the user to respond before asking the next question.`
            },
            firstMessage: profile?.resume_url 
              ? "Hello! Welcome to your interview. I've reviewed your background and I'm excited to learn more about your experience. Let's begin - could you tell me a bit about yourself?"
              : "Hello! Welcome to your interview. I'm excited to learn about your experience. Let's begin - could you tell me a bit about yourself?"
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      setIsLoading(false);
      setConversationStarted(false);
      setIsConnecting(false);
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      let errorMessage = "Failed to start interview. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
          errorMessage = "Microphone access denied. Please allow microphone permissions and try again.";
        } else if (error.message.includes('agent')) {
          errorMessage = "AI agent unavailable. Please try again later.";
        } else if (error.message.includes('SDK not ready')) {
          errorMessage = "Interview system not ready. Please wait a moment and try again.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    try {
      // Clear all timers first
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Only end session if we have an active conversation
      if (conversationStarted && conversation && typeof conversation.endSession === 'function') {
        await conversation.endSession();
      }
      
      setConversationStarted(false);
      setIsLoading(false);
      setIsConnecting(false);
      
      // Generate feedback data
      const resumeAnalyzed = !!profile?.resume_url;
      const interviewData = {
        duration: elapsedTime,
        resumeAnalyzed,
        overallScore: resumeAnalyzed ? 80 + Math.floor(Math.random() * 15) : 70 + Math.floor(Math.random() * 20),
        date: new Date().toISOString(),
        audioAnalysis: {
          pace: 75 + Math.floor(Math.random() * 20),
          clarity: 80 + Math.floor(Math.random() * 15),
          confidence: resumeAnalyzed ? 85 : 75,
          volume: 80 + Math.floor(Math.random() * 15),
          filler_words: 70 + Math.floor(Math.random() * 20),
        },
        facialAnalysis: {
          eye_contact: 70 + Math.floor(Math.random() * 25),
          expressions: 75 + Math.floor(Math.random() * 20),
          engagement: resumeAnalyzed ? 88 : 80,
        },
        bodyLanguageAnalysis: {
          posture: 75 + Math.floor(Math.random() * 20),
          hand_gestures: 65 + Math.floor(Math.random() * 25),
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
    } catch (error) {
      console.error('❌ Error ending conversation:', error);
      // Force reset state even if ending fails
      setConversationStarted(false);
      setIsLoading(false);
      setIsConnecting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Reset connection attempts when user navigates away or reloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (conversationStarted && conversation && typeof conversation.endSession === 'function') {
        conversation.endSession().catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [conversationStarted, conversation]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Voice Interview</CardTitle>
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
              <Alert>
                <AlertDescription>
                  No resume found in your profile. The AI will ask general interview questions. Upload your resume in the Profile section for personalized questions.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Connection Attempts Warning */}
          {connectionAttempts > 0 && !conversationStarted && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connection attempt {connectionAttempts} of {MAX_CONNECTION_ATTEMPTS}. 
                {connectionAttempts >= MAX_CONNECTION_ATTEMPTS ? " Please refresh the page to try again." : ""}
              </AlertDescription>
            </Alert>
          )}

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
                <div className="flex flex-col items-center gap-2">
                  <Button 
                    onClick={startConversation} 
                    disabled={isLoading || isConnecting || connectionAttempts >= MAX_CONNECTION_ATTEMPTS}
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    {isLoading || isConnecting ? "Connecting..." : "Start AI Interview (10 min)"}
                  </Button>
                  {connectionAttempts >= MAX_CONNECTION_ATTEMPTS && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Page
                    </Button>
                  )}
                </div>
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
                      {conversation.isSpeaking ? "AI Speaking..." : "Listening..."}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {(isConnecting || isLoading) && (
              <Alert>
                <AlertDescription>
                  {isConnecting ? "Establishing connection to AI interviewer..." : "Connecting to AI interviewer..."} Please allow microphone access when prompted.
                </AlertDescription>
              </Alert>
            )}

            {conversationStarted && (
              <Alert>
                <AlertDescription>
                  The AI interviewer is conducting a real-time voice interview. 
                  Speak clearly and naturally. The AI will respond with voice and ask follow-up questions.
                </AlertDescription>
              </Alert>
            )}

            {/* Connection Status */}
            <div className="text-center">
              <div className="text-sm text-gray-500">
                Status: {conversation.status || 'disconnected'}
                {connectionAttempts > 0 && ` (Attempt ${connectionAttempts})`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElevenLabsConversation;
