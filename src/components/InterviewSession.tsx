import React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Video, VideoOff, MicOff, Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ElevenLabsConversation from "./ElevenLabsConversation";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimatedAIWidget from "@/components/AnimatedAIWidget";
import { useElevenLabsSpeaking } from "@/hooks/useElevenLabsSpeaking";

interface InterviewConfig {
  type: string;
  jobRole: string;
  duration: number;
  difficulty: string;
}

interface InterviewSessionProps {
  config: InterviewConfig;
  onEnd: (feedbackData: any) => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onEnd }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { requestMediaPermissions } = useMediaDevices();

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // States
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Conversational Agent speaking state (polls window.ElevenLabs.Conversation)
  const isAgentSpeaking = useElevenLabsSpeaking();

  // Initial setup
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        await requestMediaPermissions();
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoEnabled,
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        streamRef.current = stream;
        setIsInitializing(false);
        
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast({
          title: "Permission Error",
          description: "Please allow access to your camera and microphone to start the interview.",
          variant: "destructive",
        });
      }
    };
    
    initializeMedia();
    
    // Clean up function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Toggle video
  const toggleVideo = async () => {
    if (!streamRef.current) return;
    
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    
    // Stop all video tracks
    streamRef.current.getVideoTracks().forEach(track => {
      track.enabled = newState;
    });
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (!streamRef.current) return;
    
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    
    // Stop all audio tracks
    streamRef.current.getAudioTracks().forEach(track => {
      track.enabled = newState;
    });
  };
  
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleInterviewComplete = (data: any) => {
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Call the onEnd callback with the feedback data
    onEnd(data);
  };
  
  return (
    <>
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Left side - Video feed */}
      <div className="lg:w-2/3 flex flex-col gap-4">
        <Card className="shadow-md overflow-hidden">
          <CardContent className="p-0 relative">
            {isInitializing ? (
              <div className="w-full aspect-video bg-muted flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-interprepai-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-center font-medium">Setting up your interview environment...</p>
                  <p className="text-sm text-muted-foreground">Please allow camera and microphone access when prompted</p>
                </div>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full aspect-video ${videoEnabled ? 'opacity-100' : 'opacity-0 bg-gray-900'}`}
                ></video>
                
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <VideoOff size={48} className="text-gray-400" />
                      <p className="text-gray-400 mt-2">Video is turned off</p>
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button size="icon" variant="secondary" onClick={toggleAudio}>
                    {audioEnabled ? <Mic /> : <MicOff />}
                  </Button>
                  <Button size="icon" variant="secondary" onClick={toggleVideo}>
                    {videoEnabled ? <Video /> : <VideoOff />}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Interview Interface */}
      <div className="lg:w-1/3 flex flex-col h-full">
        <Card className="shadow-md flex-1">
          <CardContent className="p-4 flex flex-col h-full">
            <Tabs defaultValue="interview" className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="interview">AI Interview</TabsTrigger>
                <TabsTrigger value="info">Interview Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="interview" className="flex-1 flex flex-col space-y-0 data-[state=active]:flex-1">
                {/* ElevenLabs Conversational Agent */}
                <ElevenLabsConversation />
              </TabsContent>
              
              <TabsContent value="info" className="space-y-4 data-[state=active]:flex-1">
                <div>
                  <h3 className="font-semibold mb-1">Interview Type</h3>
                  <Badge variant="outline">{config.type}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Position</h3>
                  <p className="text-sm">{config.jobRole}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Difficulty</h3>
                  <Badge variant="outline">{config.difficulty}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Duration</h3>
                  <p className="text-sm">{config.duration} minutes</p>
                </div>
                
                <Alert>
                  <AlertDescription>
                    This interview uses ElevenLabs AI for natural conversation. The AI will analyze your resume from your profile and ask personalized questions.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    {/* --- Custom Animated AI Widget at the bottom of the page --- */}
    <AnimatedAIWidget
      isSpeaking={isAgentSpeaking}
      message={isAgentSpeaking ? "The AI Interviewer is talking to you!" : "Waiting for your response..."}
    />
    </>
  );
};

export default InterviewSession;
