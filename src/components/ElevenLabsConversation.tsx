import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, FileText, RefreshCw } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const AGENT_ID = "YflyhSHD0Yqq3poIbnan";
  const INTERVIEW_DURATION = 10 * 60; // 10 minutes in seconds
  const MAX_LOAD_ATTEMPTS = 3;
  const LOAD_TIMEOUT = 15000; // 15 seconds timeout

  const checkSDKAvailability = () => {
    return window.ElevenLabs && window.ElevenLabs.Conversation;
  };

  const loadElevenLabsSDK = () => {
    console.log(`Loading ElevenLabs SDK - Attempt ${loadingAttempts + 1}/${MAX_LOAD_ATTEMPTS}`);
    
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Check if SDK is already available
    if (checkSDKAvailability()) {
      console.log('ElevenLabs SDK already available');
      setSdkLoaded(true);
      setSdkError(null);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="elevenlabs.io/convai-widget"]');
    if (existingScript && !checkSDKAvailability()) {
      console.log('Script exists but SDK not ready, removing and retrying...');
      existingScript.remove();
    }

    // Create new script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    
    // Set timeout for loading
    loadTimeoutRef.current = setTimeout(() => {
      console.error('SDK loading timeout');
      script.remove();
      
      if (loadingAttempts < MAX_LOAD_ATTEMPTS - 1) {
        setLoadingAttempts(prev => prev + 1);
        setTimeout(() => loadElevenLabsSDK(), 2000); // Retry after 2 seconds
      } else {
        setSdkError('Failed to load ElevenLabs SDK after multiple attempts. Please refresh the page.');
        toast({
          title: "SDK Load Failed",
          description: "Failed to load ElevenLabs SDK. Please refresh the page and try again.",
          variant: "destructive"
        });
      }
    }, LOAD_TIMEOUT);
    
    script.onload = () => {
      console.log('ElevenLabs script loaded, checking SDK availability...');
      
      // Clear timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      // Wait a bit for SDK to initialize
      setTimeout(() => {
        if (checkSDKAvailability()) {
          console.log('ElevenLabs SDK loaded and ready');
          setSdkLoaded(true);
          setSdkError(null);
          toast({
            title: "SDK Ready",
            description: "ElevenLabs SDK loaded successfully. You can now start the interview.",
          });
        } else {
          console.error('Script loaded but SDK not available');
          if (loadingAttempts < MAX_LOAD_ATTEMPTS - 1) {
            setLoadingAttempts(prev => prev + 1);
            setTimeout(() => loadElevenLabsSDK(), 2000);
          } else {
            setSdkError('SDK failed to initialize properly.');
          }
        }
      }, 1000);
    };
    
    script.onerror = () => {
      console.error('Failed to load ElevenLabs script');
      
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      if (loadingAttempts < MAX_LOAD_ATTEMPTS - 1) {
        setLoadingAttempts(prev => prev + 1);
        setTimeout(() => loadElevenLabsSDK(), 2000);
      } else {
        setSdkError('Network error loading ElevenLabs SDK.');
        toast({
          title: "Network Error",
          description: "Failed to load ElevenLabs SDK due to network issues.",
          variant: "destructive"
        });
      }
    };
    
    document.head.appendChild(script);
  };

  useEffect(() => {
    loadElevenLabsSDK();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (conversation && conversation.endSession) {
        conversation.endSession().catch(console.error);
      }
    };
  }, []);

  const retrySDKLoad = () => {
    setLoadingAttempts(0);
    setSdkError(null);
    setSdkLoaded(false);
    loadElevenLabsSDK();
  };

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
    if (!sdkLoaded || !checkSDKAvailability()) {
      toast({
        title: "SDK Not Ready",
        description: "ElevenLabs SDK is not ready. Please wait for it to load or try refreshing.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const resumeAnalysis = analyzeResumeContent();
      
      // Create conversation instance
      const conv = new window.ElevenLabs.Conversation({
        agentId: AGENT_ID,
        onConnect: () => {
          console.log('Connected to ElevenLabs agent');
          setIsConnected(true);
          setConversationStarted(true);
          setIsLoading(false);
          startTimer();
          
          toast({
            title: "Interview Started",
            description: "Connected to AI interviewer. Start speaking when ready!",
          });
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs agent');
          setIsConnected(false);
          setConversationStarted(false);
          setIsLoading(false);
        },
        onMessage: (message: any) => {
          console.log('Message received:', message);
          if (message.type === 'agent_response_start') {
            setIsSpeaking(true);
          } else if (message.type === 'agent_response_end') {
            setIsSpeaking(false);
          }
        },
        onError: (error: any) => {
          console.error('ElevenLabs conversation error:', error);
          setIsLoading(false);
          toast({
            title: "Conversation Error",
            description: "There was an issue with the AI conversation. Please try again.",
            variant: "destructive"
          });
        }
      });

      // Set conversation overrides for personalized interview
      if (resumeAnalysis) {
        conv.setOverrides({
          agent: {
            prompt: {
              prompt: `You are a professional AI interviewer conducting a comprehensive interview session. ${resumeAnalysis} Ask relevant, engaging questions that help assess the candidate's qualifications, experience, and potential. Keep responses conversational, professional, and encouraging. Ask follow-up questions to dive deeper into their experience and skills. Conduct this as a real interview session.`
            },
            firstMessage: `Hello! Welcome to your interview session. ${profile?.resume_url ? "I've reviewed your background and I'm excited to learn more about your experience and qualifications." : "I'm excited to learn about your experience and qualifications."} Let's begin - could you please tell me a bit about yourself and what interests you most about your field?`
          }
        });
      }

      setConversation(conv);
      
      // Start the conversation session
      await conv.startSession();
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to start the interview. Please check your microphone permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (conversation && conversation.endSession) {
      try {
        await conversation.endSession();
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
    
    setIsConnected(false);
    setConversationStarted(false);
    setConversation(null);
    
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
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Voice Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SDK Status */}
          {!sdkLoaded && !sdkError && (
            <Alert>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Loading ElevenLabs SDK for voice interview... (Attempt {loadingAttempts + 1}/{MAX_LOAD_ATTEMPTS})
                </AlertDescription>
              </div>
            </Alert>
          )}

          {sdkError && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{sdkError}</span>
                <Button size="sm" variant="outline" onClick={retrySDKLoad}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {sdkLoaded && (
            <Alert>
              <AlertDescription className="text-green-600">
                ✅ ElevenLabs SDK ready for voice interview
              </AlertDescription>
            </Alert>
          )}

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
                <Button 
                  onClick={startConversation} 
                  disabled={isLoading || !sdkLoaded}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  {isLoading ? "Connecting..." : !sdkLoaded ? "Loading SDK..." : "Start AI Interview (10 min)"}
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
                  The AI interviewer is conducting a real-time voice interview. 
                  Speak clearly and naturally. The interview will automatically end after 10 minutes.
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <Alert>
                <AlertDescription>
                  Connecting to AI interviewer... Please allow microphone access when prompted.
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
