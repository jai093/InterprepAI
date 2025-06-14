
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Mic, Video, VideoOff, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConversationInput from "./ConversationInput";
import AnimatedStartCallButton from "./AnimatedStartCallButton";
import CallTimer from "./CallTimer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [whoSpeaking, setWhoSpeaking] = useState<"idle" | "user" | "ai">("idle");
  const [timerRunning, setTimerRunning] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    {
      role: "ai",
      text: "Welcome to your AI interview! You can interact by voice or message. Click Start Call when ready.",
    },
  ]);

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

  // Timer complete handler: hard stop at 10 mins
  const handleTimerComplete = () => {
    setCallEnded(true);
    setTimerRunning(false);
    setCallStarted(false);
    onEnd({
      messages,
      endedBy: "timer",
    });
  };

  // Sending message and voice input
  const handleSendMessage = (text: string) => {
    if (!callStarted || callEnded) return;
    setMessages(m => [...m, { role: "user", text }]);
    setWhoSpeaking("user");
    setTimeout(() => {
      // Mock AI reply
      setMessages(m => [
        ...m,
        {
          role: "ai",
          text:
            text.length % 2
              ? "That's interesting! Let's talk more."
              : "Thank you. Next question.",
        },
      ]);
      setWhoSpeaking("ai");
      setTimeout(() => setWhoSpeaking("idle"), 1600);
    }, 1300);
    setTimeout(() => setWhoSpeaking("idle"), 400);
  };
  const handleVoiceInput = () => {
    handleSendMessage("Voice input from user");
  };

  // UI: Chat bubbles
  const ChatBubble = ({ role, text }: { role: "ai" | "user"; text: string }) => (
    <div className={`flex w-full mb-1 ${role === "user" ? "justify-end" : ""}`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] text-base
          ${role === "ai" ? "bg-indigo-100 text-indigo-800" : "bg-blue-100 text-blue-800"}
        `}
      >
        {text}
      </div>
    </div>
  );

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
                  <CallTimer maxSeconds={MAX_DURATION_SECONDS} onComplete={handleTimerComplete} running={timerRunning} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Interview/Chat/Start button area */}
        <div className="flex flex-col w-full lg:w-[370px] max-w-sm gap-4">
          <Card className="shadow-md flex-1 flex flex-col h-full">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Panel: AI Interview/Info */}
              <Tabs defaultValue="interview" className="flex-1 flex flex-col w-full">
                <TabsList className="grid grid-cols-2 sticky top-0 z-10 bg-white gap-2 mx-0 mt-2 mb-4 w-[96%] self-center">
                  <TabsTrigger value="interview">AI Interview</TabsTrigger>
                  <TabsTrigger value="info">Interview Info</TabsTrigger>
                </TabsList>
                {/* Interview: Chat log + input + start button */}
                <TabsContent value="interview" className="flex-1 flex flex-col">
                  {/* Chat log area */}
                  <div className="flex-1 px-4 pb-1 pt-1 overflow-y-auto mb-1" style={{ minHeight: 150, maxHeight: 200 }}>
                    {messages.map((msg, i) => (
                      <ChatBubble key={i} role={msg.role} text={msg.text} />
                    ))}
                  </div>
                  {/* Input area (show only if call started & not ended) */}
                  <div className="px-3 mb-1">
                    <ConversationInput
                      onSend={handleSendMessage}
                      onVoiceInput={handleVoiceInput}
                      disabled={!callStarted || callEnded}
                      loading={false}
                    />
                  </div>
                  {/* Animated Start Call button (show if not started or ended) */}
                  {!callStarted && !callEnded && (
                    <div className="flex justify-center py-4">
                      <AnimatedStartCallButton
                        status={whoSpeaking}
                        onClick={() => {
                          setCallStarted(true);
                          setTimerRunning(true);
                          setMessages(m => [
                            ...m,
                            { role: "ai", text: "Interview started! Please introduce yourself." },
                          ]);
                          setWhoSpeaking("ai");
                          setTimeout(() => setWhoSpeaking("idle"), 1200);
                        }}
                        disabled={isInitializing}
                      />
                    </div>
                  )}
                  {callEnded && (
                    <div className="text-center my-4 text-destructive font-semibold">
                      Interview ended (Max time reached)
                    </div>
                  )}
                </TabsContent>

                {/* Info tab */}
                <TabsContent value="info" className="space-y-4 px-4 pb-4 pt-2 data-[state=active]:flex-1">
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
                    <p className="text-sm">{Math.round(config.duration)} minutes</p>
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
