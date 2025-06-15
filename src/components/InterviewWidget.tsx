
import React, { useState, useRef, useEffect } from "react";
import "./InterviewWidget.css";

interface InterviewWidgetProps {
  onEndInterview?: () => void;
  showCamera?: boolean;
}

const AGENT_ID = "YflyhSHD0Yqq3poIbnan";

const InterviewWidget: React.FC<InterviewWidgetProps> = ({
  onEndInterview,
  showCamera = true,
}) => {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera setup
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

        {/* Start interview button with animation */}
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

        {/* When started, show end button, widget, and camera (if enabled) */}
        {started && (
          <div className="flex flex-col items-center w-full animate-fade-in">
            <button
              className="end-interview-btn mt-2 rounded bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition"
              onClick={handleEnd}
              type="button"
            >
              End Interview
            </button>
            {/* Embedded official ElevenLabs widget */}
            <div className="mt-4 w-full max-w-[520px] flex flex-col items-center">
              <elevenlabs-convai
                agent-id={AGENT_ID}
                terms-content={`
#### Terms and Conditions

By clicking "Agree", and each time I interact with this AI agent, I consent to the recording, storage, and analysis of my conversations by InterPrepAI and its third-party providers including ElevenLabs and OpenAI. If you do not wish to have your conversations recorded, please do not use this service.
`}
                local-storage-key="terms_accepted"
                style={{ maxWidth: 520, width: "100%" }}
              ></elevenlabs-convai>
            </div>
            {/* Camera only if enabled */}
            {showCamera && (
              <div className="mt-2 mb-2 w-full flex justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-[280px] h-[160px] rounded-lg border shadow bg-black object-cover"
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
