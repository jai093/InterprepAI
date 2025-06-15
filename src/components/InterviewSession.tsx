
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Video, VideoOff, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import InterviewWidget from "./InterviewWidget";
import "../components/InterviewWidget.css";

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
    <div className="flex flex-col md:flex-row w-full gap-6 py-4 px-2 md:px-4 bg-[#f9fafb] min-h-[75vh] items-stretch">
      {/* Left: Responsive live video with mic/camera toggles */}
      <div className="flex flex-col items-center md:items-stretch w-full md:w-1/2 max-w-2xl mx-auto">
        <Card className="w-full h-full rounded-2xl shadow-lg flex-1 flex flex-col">
          <CardContent className="flex flex-col flex-1 px-0 py-0">
            <div className="relative flex flex-col items-center w-full h-full">
              <div className="w-full aspect-video bg-gray-200 rounded-t-2xl overflow-hidden shadow flex items-center justify-center transition-all">
                <video
                  ref={videoRef}
                  autoPlay
                  muted={!audioEnabled}
                  playsInline
                  className={`w-full h-full object-cover rounded-t-2xl transition-opacity ${
                    videoEnabled ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    minHeight: 180,
                    background: "#222",
                  }}
                />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-t-2xl">
                    <VideoOff size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4 py-4 w-full">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleAudio}
                  className="w-12 h-12"
                  aria-label={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {audioEnabled ? <Mic /> : <MicOff />}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleVideo}
                  className="w-12 h-12"
                  aria-label={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {videoEnabled ? <Video /> : <VideoOff />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Right: Interview panel (AI Interview/Info/Active/End) */}
      <div className="flex flex-col w-full md:w-1/2 max-w-md min-w-[280px] mt-8 md:mt-0 mx-auto md:mx-0">
        <InterviewWidget
          interviewConfig={config}
          onEndInterview={() => onEnd && onEnd(undefined)}
          showCamera={false}
        />
      </div>
    </div>
  );
};

export default InterviewSession;
