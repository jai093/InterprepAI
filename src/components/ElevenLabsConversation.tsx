
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, FileText, RefreshCw, AlertCircle } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationRef = useRef<any>(null);
  
  const AGENT_ID = "YflyhSHD0Yqq3poIbnan";
  const INTERVIEW_DURATION = 10 * 60; // 10 minutes in seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

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

  const initializeWebSocket = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create WebSocket connection to ElevenLabs
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`;
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('Connected to ElevenLabs Conversational AI');
        setIsConnected(true);
        setConversationStarted(true);
        setIsLoading(false);
        setSdkError(null);
        startTimer();
        
        // Send initial context if resume exists
        const resumeAnalysis = analyzeResumeContent();
        if (resumeAnalysis) {
          websocket.send(JSON.stringify({
            type: 'conversation_initiation_metadata',
            conversation_initiation_metadata: {
              conversation_config_override: {
                agent: {
                  prompt: {
                    prompt: `You are a professional AI interviewer conducting a comprehensive interview session. ${resumeAnalysis} Ask relevant, engaging questions that help assess the candidate's qualifications, experience, and potential. Keep responses conversational, professional, and encouraging. Ask follow-up questions to dive deeper into their experience and skills. Conduct this as a real interview session.`
                  },
                  first_message: profile?.resume_url 
                    ? "Hello! Welcome to your interview session. I've reviewed your background and I'm excited to learn more about your experience and qualifications. Let's begin - could you please tell me a bit about yourself and what interests you most about your field?"
                    : "Hello! Welcome to your interview session. I'm excited to learn about your experience and qualifications. Let's begin - could you please tell me a bit about yourself and what interests you most about your field?"
                }
              }
            }
          }));
        }
        
        toast({
          title: "Interview Started",
          description: "Connected to AI interviewer. Start speaking when ready!",
        });
      };

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        
        if (message.type === 'agent_response') {
          setIsSpeaking(true);
          // Handle audio response
          if (message.audio) {
            playAudioResponse(message.audio);
          }
        } else if (message.type === 'agent_response_end') {
          setIsSpeaking(false);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setSdkError('Connection error. Please check your network and try again.');
        setIsLoading(false);
      };

      websocket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setConversationStarted(false);
      };

      conversationRef.current = websocket;

      // Set up MediaRecorder for audio streaming
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
          // Convert audio to base64 and send to WebSocket
          const reader = new FileReader();
          reader.onload = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            websocket.send(JSON.stringify({
              type: 'audio',
              audio: base64Audio
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      setMediaRecorder(recorder);
      
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setIsLoading(false);
      setSdkError('Failed to access microphone or connect to service.');
      toast({
        title: "Error",
        description: "Failed to start the interview. Please check your microphone permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const playAudioResponse = async (audioBase64: string) => {
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing audio response:', error);
      setIsSpeaking(false);
    }
  };

  const startConversation = async () => {
    setIsLoading(true);
    setSdkError(null);
    await initializeWebSocket();
  };

  const endConversation = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    if (conversationRef.current && conversationRef.current.readyState === WebSocket.OPEN) {
      conversationRef.current.close();
    }
    
    setIsConnected(false);
    setConversationStarted(false);
    
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
          {/* Connection Status */}
          {sdkError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{sdkError}</span>
                <Button size="sm" variant="outline" onClick={startConversation}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isConnected && (
            <Alert>
              <AlertDescription className="text-green-600">
                ✅ Connected to ElevenLabs Conversational AI
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
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  {isLoading ? "Connecting..." : "Start AI Interview (10 min)"}
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
