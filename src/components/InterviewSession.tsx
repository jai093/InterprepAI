import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mic, Video, VideoOff, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onEnd }) => {
  // --- Video/audio state ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        localStream = stream;
      })
      .catch(() => {});
    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Toggle handlers
  const toggleVideo = () => {
    if (!streamRef.current) return;
    setVideoEnabled((v) => {
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !v));
      return !v;
    });
  };
  const toggleAudio = () => {
    if (!streamRef.current) return;
    setAudioEnabled((a) => {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !a));
      return !a;
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-start min-h-[70vh] w-full gap-6 py-10 px-2 bg-[#f9fafb]">
      {/* Left: Responsive live video with mic/camera toggles */}
      <div className="flex flex-1 flex-col items-center max-w-2xl w-full">
        <Card className="w-full rounded-2xl shadow-lg">
          <CardContent className="px-0 py-0">
            <div className="relative flex flex-col items-center w-full">
              <div className="w-full aspect-video bg-gray-200 rounded-t-2xl overflow-hidden shadow flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  muted={!audioEnabled}
                  playsInline
                  className={`w-full h-full object-cover rounded-t-2xl transition-opacity
                    ${videoEnabled ? "opacity-100" : "opacity-0"}
                  `}
                  style={{
                    minHeight: 240,
                    background: "#222",
                  }}
                />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-t-2xl">
                    <VideoOff size={56} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-6 py-6">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleAudio}
                  className="w-14 h-14"
                >
                  {audioEnabled ? <Mic /> : <MicOff />}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleVideo}
                  className="w-14 h-14"
                >
                  {videoEnabled ? <Video /> : <VideoOff />}
                </Button>
              </div>
              <button
                className="bg-indigo-600 text-white rounded-full mt-2 mb-6 font-semibold text-lg flex items-center justify-center shadow-md transition hover:bg-indigo-700 animate-scale-in"
                style={{
                  width: 100,
                  height: 100,
                  fontSize: 20,
                  borderRadius: "50%",
                }}
                onClick={() => {/* start interview - handled in parent */}}
                disabled
                type="button"
                tabIndex={-1}
                aria-disabled="true"
              >
                {/* This button is only for visual spacing; disable in actual interview */}
                Start Interview
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Right: Interview panel (AI Interview/Info/Active/End) */}
      <div className="flex flex-col w-full max-w-md min-w-[300px] mt-8 md:mt-0">
        <InterviewWidget
          interviewConfig={config}
          onEndInterview={() => onEnd && onEnd(undefined)}
          showCamera={false}
        />
        {/* Info tab can be appended here if needed */}
      </div>
    </div>
  );
};

export default InterviewSession;
