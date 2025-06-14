import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Mic, Video, VideoOff, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedStartCallButton from "./AnimatedStartCallButton";
import CallTimer from "./CallTimer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useIsMobile } from "@/hooks/use-mobile";
import ElevenLabsConversation from "./ElevenLabsConversation";
import InterviewWidget from "./InterviewWidget";
import "../components/InterviewWidget.css"; // Ensure styles are loaded

interface InterviewConfig {
  type: string;
  jobRole: string;
  duration: number;
  difficulty: string;
}

interface InterviewSessionProps {
  config: InterviewConfig;
  onEnd: (feedback: any) => void;
}

const MAX_DURATION_SECONDS = 600;

const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onEnd }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { requestMediaPermissions } = useMediaDevices();

  // Refs and states for camera/audio
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // Only show EL widget after call started
  const [showELWidget, setShowELWidget] = useState(false);

  // Set up devices on mount
  useEffect(() => {
    const setupMedia = async () => {
      try {
        await requestMediaPermissions();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setIsInitializing(false);
      } catch (e) {
        toast({
          title: "Permission Error",
          description: "Camera and microphone access is required.",
          variant: "destructive",
        });
      }
    };
    setupMedia();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Toggle handlers
  const toggleVideo = () => {
    if (!streamRef.current) return;
    setVideoEnabled(v => {
      streamRef.current?.getVideoTracks().forEach(t => (t.enabled = !v));
      return !v;
    });
  };
  const toggleAudio = () => {
    if (!streamRef.current) return;
    setAudioEnabled(a => {
      streamRef.current?.getAudioTracks().forEach(t => (t.enabled = !a));
      return !a;
    });
  };

  // Timer complete handler (hard 10 min stop)
  const handleTimerComplete = () => {
    setCallEnded(true);
    setTimerRunning(false);
    setCallStarted(false);
    onEnd({ endedBy: "timer" });
  };

  // Overwrite Interview info with fixed values
  const fixedInfo = {
    type: "behavioral",
    jobRole: "Software Engineer",
    difficulty: "medium",
    duration: 10, // always 10 minutes
  };

  return (
    <div
      className="w-full min-h-[80vh] flex items-center justify-center py-12 bg-[#f9fafb]"
      style={{ minHeight: "80vh" }}
    >
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 w-full max-w-6xl px-2 sm:px-4">
        {/* Left: Live video/audio preview */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <Card className="shadow-md h-full flex-1">
            <CardContent className="p-0 min-h-[420px] relative flex flex-col justify-center">
              <div className="flex-1 w-full aspect-video relative flex items-center justify-center bg-gray-50 rounded-t-lg">
                {isInitializing ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <p className="mt-4 text-center font-medium">Setting up your interview environment...</p>
                      <p className="text-sm text-muted-foreground">Please allow camera and microphone access.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      muted
                      autoPlay
                      playsInline
                      className={`w-full aspect-video rounded-t-lg object-cover border border-gray-200 shadow-lg transition-opacity duration-300 ${videoEnabled ? "opacity-100" : "opacity-0"}`}
                    />
                    {!videoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-t-lg">
                        <div className="flex flex-col items-center">
                          <VideoOff size={48} className="text-gray-300" />
                          <p className="text-gray-300 mt-1">Video is off</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                      <Button size="icon" variant="secondary" onClick={toggleAudio} className="w-12 h-12">
                        {audioEnabled ? <Mic /> : <MicOff />}
                      </Button>
                      <Button size="icon" variant="secondary" onClick={toggleVideo} className="w-12 h-12">
                        {videoEnabled ? <Video /> : <VideoOff />}
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {/* Show call timer overlay if call started */}
              {callStarted && timerRunning && (
                <div className="absolute top-4 left-4 z-10">
                  <CallTimer maxSeconds={600} onComplete={handleTimerComplete} running={timerRunning} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Interview panel */}
        <div className="flex flex-col w-full lg:w-[370px] max-w-sm gap-4">
          <Card className="shadow-md flex-1 flex flex-col h-full">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Panel: AI Interview/Info */}
              <Tabs defaultValue="interview" className="flex-1 flex flex-col w-full">
                <TabsList className="grid grid-cols-2 sticky top-0 z-10 bg-white gap-2 mx-0 mt-2 mb-4 w-[96%] self-center">
                  <TabsTrigger value="interview">AI Interview</TabsTrigger>
                  <TabsTrigger value="info">Interview Info</TabsTrigger>
                </TabsList>
                {/* Interview tab: Launches custom ElevenLabs interview widget */}
                <TabsContent value="interview" className="flex-1 flex flex-col">
                  <InterviewWidget />
                  {/* (No fake chat logic, all handled by widget) */}
                </TabsContent>

                {/* Info tab */}
                <TabsContent value="info" className="space-y-4 px-4 pb-4 pt-2 data-[state=active]:flex-1">
                  <div>
                    <h3 className="font-semibold mb-1">Interview Type</h3>
                    <Badge variant="outline">{fixedInfo.type}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Position</h3>
                    <p className="text-sm">{fixedInfo.jobRole}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Difficulty</h3>
                    <Badge variant="outline">{fixedInfo.difficulty}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Duration</h3>
                    <p className="text-sm">10 minutes</p>
                  </div>
                  <Alert>
                    <AlertDescription>
                      This interview uses AI for natural conversation and can end early if time limit is reached.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
