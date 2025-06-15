
import React, { useState, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import "./InterviewWidget.css";

interface InterviewWidgetProps {
  onEndInterview?: () => void;
  showCamera?: boolean;
}

// Use the agent id provided by the user
const AGENT_ID = "agent_01jxs5kf50fg6t0p79hky1knfb";

const InterviewWidget: React.FC<InterviewWidgetProps> = ({
  onEndInterview,
  showCamera = true,
}) => {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log("Interview conversation connected");
    },
    onDisconnect: () => {
      console.log("Interview conversation disconnected");
      setStarted(false);
    },
    onMessage: (message) => {
      console.log("Conversation message:", message);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
    }
  });

  // Camera setup only if showCamera is true and interview started
  useEffect(() => {
    if (started && showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        })
        .catch(() => { /* camera error ignored */ });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [started, showCamera]);

  // Start interview: begin conversation directly
  const handleStart = async () => {
    try {
      setStarted(true);
      // Start the conversation with the agent
      await conversation.startSession({ 
        agentId: AGENT_ID 
      });
      console.log("Interview conversation started");
    } catch (error) {
      console.error("Failed to start interview:", error);
      setStarted(false);
    }
  };

  // End interview: stop conversation and cleanup
  const handleEnd = async () => {
    try {
      await conversation.endSession();
      setStarted(false);
      if (onEndInterview) onEndInterview();
    } catch (error) {
      console.error("Failed to end interview:", error);
      setStarted(false);
      if (onEndInterview) onEndInterview();
    }
  };

  return (
    <div className="interview-container flex flex-col items-center">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Button, fade out on click */}
        {!started && (
          <button
            className="start-button transition-all duration-300 animate-scale-in"
            onClick={handleStart}
            disabled={started}
            style={started ? { pointerEvents: "none", opacity: 0.6 } : {}}
          >
            Start Interview
          </button>
        )}

        {/* Interview session UI (no widget, just conversation status) */}
        {started && (
          <div className="interview-session-box flex flex-col items-center w-full animate-fade-in rounded-2xl bg-[#f2f2f5] shadow-lg px-4 py-5 relative" style={{minWidth: "340px", maxWidth: "400px"}}>
            {/* Custom End button */}
            <button
              className="absolute top-2 right-4 rounded text-sm bg-red-600 text-white px-4 py-1 hover:bg-red-700 transition z-10"
              onClick={handleEnd}
              type="button"
            >
              End
            </button>
            
            {/* Conversation status indicator */}
            <div className="w-full flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${conversation.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">
                  {conversation.status === 'connected' ? 'Interview Active' : 'Connecting...'}
                </span>
              </div>
              
              {conversation.isSpeaking && (
                <div className="text-sm text-purple-600 font-medium">
                  AI is speaking...
                </div>
              )}
            </div>
            
            {/* Camera only if enabled, below the status */}
            {showCamera && (
              <div className="w-full flex justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-[220px] h-[125px] rounded-lg border shadow bg-black object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewWidget;
