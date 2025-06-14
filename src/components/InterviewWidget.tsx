
import React, { useState } from "react";
import { useConversation } from "@elevenlabs/react";
import "./InterviewWidget.css";

// SET YOUR AGENT ID HERE
const AGENT_ID = "YflyhSHD0Yqq3poIbnan"; // Provided by user

const InterviewWidget: React.FC = () => {
  const [started, setStarted] = useState(false);
  // Track status for button: "idle" | "user" | "ai"
  const [status, setStatus] = useState<"idle" | "user" | "ai">("idle");

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

  // Button color logic
  const getButtonClass = () => {
    if (!started) return "start-button";
    if (status === "user") return "start-button user-speaking";
    if (status === "ai" && isSpeaking) return "start-button ai-speaking";
    return "start-button";
  };

  return (
    <div className="interview-container">
      {/* CIRCULAR BUTTON */}
      {!started ? (
        <button className={getButtonClass()} onClick={handleStart}>
          Start Interview
        </button>
      ) : (
        <button className={getButtonClass()} style={{ pointerEvents: "none" }}>
          Interview in progress...
        </button>
      )}
    </div>
  );
};

export default InterviewWidget;
