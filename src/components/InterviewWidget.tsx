import React, { useState } from "react";
import { useConversation } from "@elevenlabs/react";
import "./InterviewWidget.css";

// SET YOUR AGENT ID HERE
const AGENT_ID = "YflyhSHD0Yqq3poIbnan"; // Provided by user

const InterviewWidget: React.FC = () => {
  const [started, setStarted] = useState(false);
  // Track status for button: "idle" | "user" | "ai"
  const [status, setStatus] = useState<"idle" | "user" | "ai">("idle");
  const [input, setInput] = useState("");
  // Since the SDK does not provide messages, maintain local state
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);

  // ElevenLabs useConversation: manages audio, websocket, agent events, messages
  const {
    startSession,
    endSession,
    status: elStatus,
    isSpeaking
  } = useConversation({
    agentId: AGENT_ID,
    onConnect: () => setStatus("ai"),
    onDisconnect: () => setStatus("idle"),
    onMessage: (msg: any) => {
      if (msg?.role === "user") {
        setStatus("user");
        setMessages((old) => [...old, { role: "user", content: msg.content }]);
      } else if (msg?.role === "agent") {
        setStatus("ai");
        setMessages((old) => [...old, { role: "ai", content: msg.content }]);
      }
    },
    onError: () => setStatus("idle"),
  });

  const handleStart = async () => {
    setStarted(true);
    setStatus("ai");
    setMessages([]);
    try {
      await startSession();
    } catch (e) {
      setStatus("idle");
      setStarted(false);
      // Improved error message: handle CloseEvent
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

  // Text input will only echo locally—no chat is sent to the agent, only spoken messages work
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages((old) => [
        ...old,
        { role: "user", content: input.trim() },
      ]);
      setStatus("user");
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
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`msg msg-${msg.role === "user" ? "user" : "ai"}`}
                >
                  <span>{msg.content}</span>
                </div>
              ))
            ) : (
              <div className="msg msg-ai">
                <span>
                  Say something or type below to begin the conversation!
                </span>
              </div>
            )}
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
              onChange={(e) => setInput(e.target.value)}
              disabled={!started}
              placeholder={
                started
                  ? "Type a message (will NOT be sent to AI; use your mic)"
                  : "Connecting..."
              }
            />
            <button
              className="send-btn"
              type="submit"
              disabled={!started || !input.trim()}
              title="Text messages are local only—speak to interact with the AI"
            >
              Send
            </button>
          </form>
          <div className="text-xs text-gray-500 px-4 pt-2 pb-1">
            <span>
              <b>Note:</b> Only voice/microphone input is sent to the AI agent. Typing a message will <b>NOT</b> trigger an AI reply.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewWidget;
