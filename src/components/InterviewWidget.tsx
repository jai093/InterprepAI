
import React, { useState, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<"idle" | "user" | "ai" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
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
    onConnect: () => {
      setStatus("ai");
      setIsConnecting(false);
      setErrorMsg(null);
    },
    onDisconnect: () => {
      setStatus("idle");
      setStarted(false);
      setIsConnecting(false);
    },
    onMessage: () => { /* no-op */ },
    onError: (error) => {
      setStatus("error");
      setStarted(false);
      setIsConnecting(false);

      let errorMsg = "";

      // SAFELY handle error object (fixes null checks/typescript errors)
      if (error && typeof error === "object") {
        // Attempt to duck-type for WebSocket CloseEvent (code/reason/wasClean present)
        const maybeHasCode = Object.prototype.hasOwnProperty.call(error, "code");
        const maybeHasReason = Object.prototype.hasOwnProperty.call(error, "reason");
        const maybeHasWasClean = Object.prototype.hasOwnProperty.call(error, "wasClean");
        if (
          maybeHasCode && maybeHasReason && maybeHasWasClean &&
          typeof (error as any).code === "number"
        ) {
          const e = error as { code?: number; reason?: string | null; wasClean?: boolean };
          errorMsg = `WebSocket closed - code: ${e.code}, reason: ${e.reason || "No reason"}, wasClean: ${e.wasClean}`;
        }
        else if (error instanceof Error) {
          errorMsg = error.message;
        }
        else {
          errorMsg = JSON.stringify(error);
        }
      } else if (typeof error === "string") {
        errorMsg = error;
      } else {
        errorMsg = "Unknown error occurred";
      }

      setErrorMsg(errorMsg);
      toast({
        title: "Interview session failed",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handleStart = async () => {
    setErrorMsg(null);
    setIsConnecting(true);
    try {
      await startSession();
      setStarted(true);
      setStatus("ai");
    } catch (e) {
      setIsConnecting(false);
      setStatus("error");
      setStarted(false);

      let errorMsg = "";
      // SAFELY handle error object (fixes null checks/typescript errors)
      if (e && typeof e === "object") {
        const maybeHasCode = Object.prototype.hasOwnProperty.call(e, "code");
        const maybeHasReason = Object.prototype.hasOwnProperty.call(e, "reason");
        const maybeHasWasClean = Object.prototype.hasOwnProperty.call(e, "wasClean");
        if (
          maybeHasCode && maybeHasReason && maybeHasWasClean &&
          typeof (e as any).code === "number"
        ) {
          const errObj = e as { code?: number; reason?: string | null; wasClean?: boolean };
          errorMsg = `WebSocket closed - code: ${errObj.code}, reason: ${errObj.reason || "No reason"}, wasClean: ${errObj.wasClean}`;
        } else if (e instanceof Error) {
          errorMsg = e.message;
        } else {
          errorMsg = JSON.stringify(e);
        }
      } else if (typeof e === "string") {
        errorMsg = e;
      } else {
        errorMsg = "Unknown error occurred";
      }
      setErrorMsg(errorMsg);
      toast({
        title: "Could not start interview",
        description: errorMsg.includes("Could not authorize") 
          ? "Authorization error: Please check your agent ID and API key permissions." 
          : errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleEnd = async () => {
    try {
      await endSession();
    } catch (e) {
      // Session may already be disconnected; ignore errors
    }
    setStarted(false);
    setStatus("idle");
    if (onEndInterview) onEndInterview();
  };

  const getButtonClass = () => {
    if (!started) return "start-button";
    if (status === "user") return "start-button user-speaking";
    if (status === "ai" && isSpeaking) return "start-button ai-speaking";
    return "start-button";
  };

  // UI: Error Message panel
  const ErrorPanel = ({ error }: { error: string }) => (
    <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-700 my-3">
      <strong>Conversation failed:</strong>
      <div>{error}</div>
      {error.includes("authorize") && (
        <div className="mt-1">
          Please check your agent configuration and API key.<br />
          <span className="text-xs">
            If you're using ElevenLabs, make sure your account has permissions for this agent and your key is valid.<br />
            (If running locally, check network access and CORS settings.)
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="interview-container flex flex-col items-center">
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          className={getButtonClass()}
          onClick={!started && !isConnecting ? handleStart : undefined}
          disabled={started || isConnecting || status === "error"}
          style={started ? { pointerEvents: "none" } : {}}
        >
          {isConnecting
            ? "Starting..."
            : !started
            ? "Start Interview"
            : "Interview in progress..."}
        </button>
        {status === "error" && errorMsg && <ErrorPanel error={errorMsg} />}

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
