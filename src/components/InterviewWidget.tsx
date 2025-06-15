import React, { useState, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { useProfile } from "@/hooks/useProfile";
import "./InterviewWidget.css";
import InterviewMessages from "./InterviewMessages";
import InterviewCamera from "./InterviewCamera";

interface InterviewWidgetProps {
  onEndInterview?: () => void;
  showCamera?: boolean;
  interviewConfig?: {
    type: string;
    jobRole: string;
    duration: number;
    difficulty: string;
  };
  onSessionStart?: (sessionId: string) => void;
}

// Use the agent id provided by the user
const AGENT_ID = "agent_01jxs5kf50fg6t0p79hky1knfb";

const InterviewWidget: React.FC<InterviewWidgetProps> = ({
  onEndInterview,
  showCamera = true,
  interviewConfig,
  onSessionStart
}) => {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', text: string, timestamp: Date}>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { profile } = useProfile();

  // Save session/conv id for analytics
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Generate custom prompt based on interview config and profile
  const generateCustomPrompt = () => {
    let prompt = `You are an AI interviewer conducting a ${interviewConfig?.difficulty || 'medium'} level ${interviewConfig?.type || 'behavioral'} interview for the ${interviewConfig?.jobRole || 'Software Engineer'} position.`;
    
    if (interviewConfig?.type === 'roleSpecific') {
      prompt += ` Focus specifically on skills and experiences relevant to ${interviewConfig.jobRole}. Ask questions that assess the candidate's expertise in this role.`;
    }
    
    if (profile?.skills) {
      prompt += ` The candidate has mentioned these skills: ${profile.skills}. Ask relevant questions about these skills.`;
    }
    
    if (profile?.resume_url) {
      prompt += ` The candidate has uploaded a resume. Ask questions that relate to their background and the role requirements.`;
    }
    
    prompt += ` Keep questions conversational, professional, and appropriate for the difficulty level. Wait for the candidate to respond before asking the next question.`;
    
    return prompt;
  };

  // Initialize ElevenLabs conversation with custom prompt
  const conversation = useConversation({
    onConnect: () => {
      console.log("Interview conversation connected");
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          text: `Hello! I'm ready to begin your ${interviewConfig?.type || "behavioral"} interview for the ${interviewConfig?.jobRole || "Software Engineer"} position. Let's start!`,
          timestamp: new Date()
        }
      ]);
      // Inform parent of session id if available (don't set here; do in handleStart)
    },
    onDisconnect: () => {
      console.log("Interview conversation disconnected");
      setStarted(false);
    },
    onMessage: (message) => {
      console.log("Conversation message:", message);
      if (message.source === 'user' && message.message) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'user',
          text: message.message,
          timestamp: new Date()
        }]);
      } else if (message.source === 'ai' && message.message) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: message.message,
          timestamp: new Date()
        }]);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
    }
  });

  // Camera setup (showCamera applies throughout)
  useEffect(() => {
    if (showCamera) {
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
  }, [showCamera]);

  // Start interview on mount (no preview step)
  useEffect(() => {
    if (!started) {
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = async () => {
    try {
      setStarted(true);
      const customPrompt = generateCustomPrompt();
      // Start the conversation with the agent and custom prompt
      const newConversationId = await conversation.startSession({
        agentId: AGENT_ID,
        overrides: {
          agent: {
            prompt: {
              prompt: customPrompt
            },
            firstMessage: `Hello! I'm ready to begin your ${interviewConfig?.type || "behavioral"} interview for the ${interviewConfig?.jobRole || "Software Engineer"} position. Let's start with an introduction - tell me about yourself.`
          }
        }
      });
      if (newConversationId && typeof newConversationId === "string") {
        setConversationId(newConversationId);
        if (onSessionStart) onSessionStart(newConversationId);
      }
      console.log("Interview conversation started with custom prompt and id:", newConversationId);
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

  // --- MAIN RETURN ---
  return (
    <div className="interview-container flex flex-col items-center">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Show the interview (live session/chat UI) as soon as this component loads */}
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
                  <span className="text-xs text-gray-600">
                    {interviewConfig?.jobRole || 'Software Engineer'} - {interviewConfig?.type || 'Behavioral'}
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
                <InterviewMessages messages={messages} />
                {/* Voice input indicator */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Voice chat active - speak naturally</span>
                  </div>
                </div>
              </div>
              
              {/* Camera feed (if enabled) */}
              <InterviewCamera videoRef={videoRef} showCamera={showCamera} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewWidget;
