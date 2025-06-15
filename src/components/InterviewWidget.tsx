
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
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', text: string, timestamp: Date}>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log("Interview conversation connected");
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: 'Connected! I\'m ready to begin the interview.',
        timestamp: new Date()
      }]);
    },
    onDisconnect: () => {
      console.log("Interview conversation disconnected");
      setStarted(false);
    },
    onMessage: (message) => {
      console.log("Conversation message:", message);
      if (message.type === 'user_transcript' && message.text) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'user',
          text: message.text,
          timestamp: new Date()
        }]);
      } else if (message.type === 'agent_response' && message.text) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: message.text,
          timestamp: new Date()
        }]);
      }
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
      setMessages([]);
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

        {/* Live Voice Chat UI */}
        {started && (
          <div className="interview-session-box flex flex-col w-full animate-fade-in rounded-2xl bg-white shadow-lg border relative" style={{minWidth: "400px", maxWidth: "600px", height: "500px"}}>
            {/* Header with status and end button */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${conversation.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    {conversation.status === 'connected' ? 'Interview Active' : 'Connecting...'}
                  </span>
                  {conversation.isSpeaking && (
                    <span className="text-xs text-purple-600 font-medium">
                      AI is speaking...
                    </span>
                  )}
                </div>
              </div>
              
              <button
                className="rounded-lg text-sm bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition font-medium"
                onClick={handleEnd}
                type="button"
              >
                End Interview
              </button>
            </div>
            
            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden">
              {/* Chat messages area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
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
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
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
                
                {/* Voice input indicator */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Voice chat active - speak naturally</span>
                  </div>
                </div>
              </div>
              
              {/* Camera feed (if enabled) */}
              {showCamera && (
                <div className="w-48 border-l bg-gray-50 flex flex-col">
                  <div className="p-2 text-xs font-medium text-gray-600 text-center border-b">
                    Your Video
                  </div>
                  <div className="flex-1 flex items-center justify-center p-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-32 rounded-lg border shadow bg-black object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewWidget;
