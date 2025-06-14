
import React, { useState, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import "./InterviewWidget.css";

const AGENT_ID = "YflyhSHD0Yqq3poIbnan"; // Provided by user

interface InterviewWidgetProps {
  onEndInterview?: () => void;
  showCamera?: boolean;
}

const InterviewWidget: React.FC<InterviewWidgetProps> = ({
  onEndInterview,
  showCamera = true,
}) => {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<"idle" | "user" | "ai">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera setup
  useEffect(() => {
    if (started && showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        })
        .catch(() => { /* Optional error handling */ });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [started, showCamera]);

  const {
    startSession,
    endSession,
    status: elStatus,
    isSpeaking
  } = useConversation({
    agentId: AGENT_ID,
    onConnect: () => setStatus("ai"),
    onDisconnect: () => setStatus("idle"),
    onMessage: () => {
      // no-op since chat UI is removed
    },
    onError: () => setStatus("idle"),
  });

  const handleStart = async () => {
    setStarted(true);
    setStatus("ai");
    try {
      await startSession();
    } catch (e) {
      setStatus("idle");
      setStarted(false);
      let errorMsg = "";
      if (
        typeof window !== "undefined" &&
        typeof window.CloseEvent !== "undefined" &&
        e instanceof window.CloseEvent
      ) {
        errorMsg = `WebSocket closed - code: ${e.code}, reason: ${e.reason || "No reason"}, wasClean: ${e.wasClean}`;
      } else if (e && typeof e === "object" && "code" in e && "reason" in e) {
        errorMsg = `WebSocket closed - code: ${e.code}, reason: ${e.reason || "No reason"}, wasClean: ${e.wasClean}`;
      } else if (e instanceof Error) {
        errorMsg = e.message;
      } else {
        errorMsg = String(e);
      }
      alert("Could not start conversation: " + errorMsg);
    }
  };

  const handleEnd = async () => {
    await endSession();
    setStarted(false);
    if (onEndInterview) onEndInterview();
  };

  const getButtonClass = () => {
    if (!started) return "start-button";
    if (status === "user") return "start-button user-speaking";
    if (status === "ai" && isSpeaking) return "start-button ai-speaking";
    return "start-button";
  };

  return (
    <div className="interview-container flex flex-col items-center">
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          className={getButtonClass()}
          onClick={!started ? handleStart : undefined}
          style={started ? { pointerEvents: "none" } : {}}
        >
          {!started ? "Start Interview" : "Interview in progress..."}
        </button>
        {started && (
          <button
            className="end-interview-btn mt-2 rounded bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition"
            onClick={handleEnd}
            type="button"
          >
            End Interview
          </button>
        )}
        {/* Live camera preview */}
        {started && showCamera && (
          <div className="mt-4 mb-2 w-full flex justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-[280px] h-[160px] rounded-lg border shadow bg-black object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewWidget;
