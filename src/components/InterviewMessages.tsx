
import React from "react";

interface Message {
  id: string;
  type: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface InterviewMessagesProps {
  messages: Message[];
}

const InterviewMessages: React.FC<InterviewMessagesProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <div className="text-lg mb-2">🎤</div>
          <p>Voice interview is ready!</p>
          <p className="text-sm">Start speaking to begin the conversation</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p>{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default InterviewMessages;
