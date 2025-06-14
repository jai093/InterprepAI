
import React, { useState } from "react";
import { useConversation, Conversation, Message } from "@elevenlabs/react";
import "./InterviewWidget.css";

// FILL IN WITH YOUR REAL ELEVENLABS AGENT ID AND API KEY/PROJECT KEY
const AGENT_ID = "YOUR_AGENT_ID_HERE";
const PROJECT_KEY = "YOUR_PROJECT_KEY_HERE"; // Only needed if agent is private

const InterviewWidget: React.FC = () => {
  const [started, setStarted] = useState(false);
  // Track status for button: "idle" | "user" | "ai"
  const [status, setStatus] = useState<"idle" | "user" | "ai">("idle");

  // ElevenLabs useConversation: manages audio, websocket, agent events, messages
  const {
    startSession,
    endSession,
    sendMessage,
    messages,
    status: elStatus,
    isSpeaking,
    isConnected,
    isMicActive,
    setVolume,
  }: Conversation = useConversation({
    agentId: AGENT_ID,
    // For private agent, set apiKey: PROJECT_KEY,
    onConnect: () => setStatus("ai"),
    onDisconnect: () => setStatus("idle"),
    onMessage: (msg: Message) => {
      if (msg.role === "user") setStatus("user");
      else if (msg.role === "agent") setStatus("ai");
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
      alert("Could not start conversation: " + e?.toString());
    }
  };

  // Send text message
  const [input, setInput] = useState("");
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await sendMessage(input.trim());
      setInput("");
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

      {/* EMBEDDED CHAT UI (only after started) */}
      {started && (
        <div className="chat-box">
          <div className="messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`msg msg-${msg.role === "user" ? "user" : "ai"}`}
              >
                <span>{msg.content}</span>
              </div>
            ))}
          </div>
          <form
            className="chat-input-row"
            onSubmit={handleSend}
            style={{ display: "flex", gap: 8, marginTop: 10 }}
            autoComplete="off"
          >
            <input
              className="chat-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!isConnected}
              placeholder={
                isConnected
                  ? "Type a message or use your mic..."
                  : "Connecting..."
              }
            />
            <button className="send-btn" type="submit" disabled={!isConnected}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InterviewWidget;
