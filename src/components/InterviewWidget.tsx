
import React, { useState, useEffect, useRef } from "react";
import "./InterviewWidget.css";

// TODO: Replace with your own Agent ID and Project Key/API Key from ElevenLabs
const AGENT_ID = "YOUR_AGENT_ID_HERE";
const PROJECT_KEY = "YOUR_PROJECT_KEY_HERE"; // Could be the API key or project key (see ElevenLabs docs)

const InterviewWidget: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "user" | "ai">("idle");
  const [isStarted, setIsStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load the ElevenLabs agent script dynamically
  useEffect(() => {
    if ((window as any).Elevenlabs) return; // Already loaded

    const script = document.createElement("script");
    script.src = "https://cdn.elevenlabs.io/agent-sdk/v1/agent.js";
    script.async = true;
    script.onload = () => {
      // ready to initialize agent
    };
    document.body.appendChild(script);
  }, []);

  // Agent init (runs after script and when "start" pressed)
  const handleStart = () => {
    if (isStarted) return;
    setIsStarted(true);

    // Ensure window agent is present
    const checkAgent = setInterval(() => {
      // @ts-ignore
      if ((window as any).Elevenlabs && (window as any).Elevenlabs.init) {
        clearInterval(checkAgent);
        // @ts-ignore
        (window as any).Elevenlabs.init({
          agentId: AGENT_ID,
          projectKey: PROJECT_KEY,
          stream: true,
          container: containerRef.current,
          mode: "embedded",
          onStart: () => setStatus("ai"),
          onUserSpeak: () => setStatus("user"),
          onAgentSpeak: () => setStatus("ai"),
          onEnd: () => {
            setStatus("idle");
            setIsStarted(false);
          },
        });
        // Start conversation
        // @ts-ignore
        (window as any).Elevenlabs.startConversation();
      }
    }, 100);
  };

  const getButtonClass = () => {
    if (status === "user") return "start-button user-speaking";
    if (status === "ai") return "start-button ai-speaking";
    return "start-button";
  };

  return (
    <div className="interview-container">
      <button className={getButtonClass()} onClick={handleStart}>
        {isStarted ? "Interview in progress..." : "Start Interview"}
      </button>
      <div ref={containerRef} className="chat-box" />
    </div>
  );
};

export default InterviewWidget;
