import React, { useState, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { useProfile } from "@/hooks/useProfile";
import "./InterviewWidget.css";

interface InterviewWidgetProps {
  onEndInterview?: () => void;
  showCamera?: boolean;
  interviewConfig?: {
    type: string;
    jobRole: string;
    duration: number;
    difficulty: string;
  };
}

// Use the agent id provided by the user
const AGENT_ID = "agent_01jxs5kf50fg6t0p79hky1knfb";

const InterviewWidget: React.FC<InterviewWidgetProps> = ({
  onEndInterview,
  showCamera = true,
  interviewConfig
}) => {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', text: string, timestamp: Date}>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { profile } = useProfile();

  // ---- ADD preview state ----
  // 1. When in interview step, the widget starts in preview mode (before starting the actual conversation)
  const [previewMode, setPreviewMode] = useState(true);

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
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: `Hello! I'm ready to begin your ${interviewConfig?.type || 'behavioral'} interview for the ${interviewConfig?.jobRole || 'Software Engineer'} position. Let's start!`,
        timestamp: new Date()
      }]);
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

  // Camera setup (showCamera applies to both preview & interview) - keep as-is
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

  // ---- REWRITE: Start interview to dismiss preview first, then start session ----
  const handleBeginPreviewStart = () => {
    setPreviewMode(false);
    // Start interview voice session after dismissing preview UI
    handleStart();
  };

  // Start interview: begin conversation directly with custom prompt
  const handleStart = async () => {
    try {
      setStarted(true);
      const customPrompt = generateCustomPrompt();
      
      // Start the conversation with the agent and custom prompt
      await conversation.startSession({ 
        agentId: AGENT_ID,
        overrides: {
          agent: {
            prompt: {
              prompt: customPrompt
            },
            firstMessage: `Hello! I'm ready to begin your ${interviewConfig?.type || 'behavioral'} interview for the ${interviewConfig?.jobRole || 'Software Engineer'} position. Let's start with an introduction - tell me about yourself.`
          }
        }
      });
      console.log("Interview conversation started with custom prompt");
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
        {/* If not started (previewMode), show PREVIEW UI */}
        {!started && previewMode && (
          <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
            <div className="webcam-preview-container mb-6">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Interview Preview</h3>
                <p className="text-sm text-gray-600">
                  This is how you'll appear in the interview. Adjust your camera as needed.
                </p>
              </div>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-80 h-60 rounded-xl border-2 border-gray-200 shadow-lg bg-black object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  ● LIVE
                </div>
              </div>
            </div>
            {/* Big circular Start Interview button (like screenshot) */}
            <button
              className="start-button transition-all duration-300 animate-scale-in mb-4"
              onClick={handleBeginPreviewStart}
              type="button"
            >
              Start Interview
            </button>
            <p className="text-gray-500 text-sm text-center mb-2">
              Press when you are ready – your interview will begin immediately!
            </p>
          </div>
        )}

        {/* If not started and NOT in preview mode (should NOT appear in this flow!) */}
        {!started && !previewMode && (
          // Prevent showing any other button/preview (edge protection, can leave blank or loading)
          <div/>
        )}

        {/* Once started, show the existing Interview (live session/chat UI) */}
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
