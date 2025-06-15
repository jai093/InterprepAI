
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

  // Button animation styling (copied from previous code)
  const AnimatedButton = () => (
    <button
      className="start-button"
      onClick={() => setStarted(true)}
      disabled={started}
      style={started ? { pointerEvents: "none", opacity: 0.6 } : {}}
    >
      {!started ? "Start Interview" : "Interview in progress..."}
    </button>
  );

  return (
    <div className="interview-container flex flex-col items-center">
      <div className="flex flex-col items-center gap-4 w-full">
        {!started && <AnimatedButton />}

        {/* Show end button and widget when started */}
        {started && (
          <>
            <button
              className="end-interview-btn mt-2 rounded bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition"
              onClick={handleEnd}
              type="button"
            >
              End Interview
            </button>
            <div className="mt-4 w-full flex flex-col items-center">
              {/* Embed the official ElevenLabs widget */}
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
          </>
        )}

        {/* Live camera preview if desired */}
        {started && showCamera && (
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
    </div>
  );
};

export default InterviewWidget;

