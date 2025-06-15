
import React, { useState, useRef, useEffect } from "react";
import "./InterviewWidget.css";

interface InterviewWidgetProps {
  onEndInterview?: () => void;
  showCamera?: boolean;
}

// Use the agent id provided by the user
const AGENT_ID = "agent_01jxs5kf50fg6t0p79hky1knfb";

// Convenience to only load the ElevenLabs widget script once
const ELEVENLABS_WIDGET_URL = "https://unpkg.com/@elevenlabs/convai-widget-embed";

const InterviewWidget: React.FC<InterviewWidgetProps> = ({
  onEndInterview,
  showCamera = true,
}) => {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Only load script if necessary, when user starts interview
  useEffect(() => {
    if (started) {
      // Only add once
      if (!document.querySelector(`script[src="${ELEVENLABS_WIDGET_URL}"]`)) {
        const script = document.createElement("script");
        script.src = ELEVENLABS_WIDGET_URL;
        script.async = true;
        script.type = "text/javascript";
        document.body.appendChild(script);
      }
    }
  }, [started]);

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

  // End interview: hide widget and cleanup
  const handleEnd = () => {
    setStarted(false);
    if (onEndInterview) onEndInterview();
  };

  return (
    <div className="interview-container flex flex-col items-center">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Button, fade out on click */}
        {!started && (
          <button
            className="start-button transition-all duration-300 animate-scale-in"
            onClick={() => setStarted(true)}
            disabled={started}
            style={started ? { pointerEvents: "none", opacity: 0.6 } : {}}
          >
            Start Interview
          </button>
        )}

        {/* Embedded widget replaces button (not a popup) */}
        {started && (
          <div className="interview-widget-box flex flex-col items-center w-full animate-fade-in rounded-2xl bg-[#f2f2f5] shadow-lg px-4 py-5 relative" style={{minWidth: "340px", maxWidth: "400px"}}>
            {/* Custom End button above the widget (optional UX) */}
            <button
              className="absolute top-2 right-4 rounded text-sm bg-red-600 text-white px-4 py-1 hover:bg-red-700 transition z-10"
              onClick={handleEnd}
              type="button"
            >
              End
            </button>
            {/* ElevenLabs widget embedded in-place, NOT as a popup */}
            <div className="w-full flex flex-col items-center">
              <elevenlabs-convai agent-id={AGENT_ID}></elevenlabs-convai>
            </div>
            {/* Camera only if enabled, below the widget */}
            {showCamera && (
              <div className="mt-4 w-full flex justify-center">
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

