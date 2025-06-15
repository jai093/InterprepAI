
import React, { RefObject } from "react";
import { Mic, Video, VideoOff, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterviewPreviewPanelProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoEnabled: boolean;
  audioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

const InterviewPreviewPanel: React.FC<InterviewPreviewPanelProps> = ({
  videoRef,
  videoEnabled,
  audioEnabled,
  toggleVideo,
  toggleAudio,
}) => (
  <div className="relative flex flex-col items-center w-full h-full">
    <div className="w-full aspect-video bg-gray-200 rounded-t-2xl overflow-hidden shadow flex items-center justify-center transition-all">
      <video
        ref={videoRef}
        autoPlay
        muted={true}
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
);

export default InterviewPreviewPanel;
