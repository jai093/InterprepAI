
import React, { useEffect, useRef, useState } from "react";

interface InterviewPrestartProps {
  config: {
    type: string;
    jobRole: string;
    duration: number;
    difficulty: string;
  };
  onStart: () => void;
  onBack?: () => void;
}

const InterviewPrestart: React.FC<InterviewPrestartProps> = ({
  config,
  onStart,
  onBack,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    setLoading(true);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center py-8 w-full bg-[#f9fafb]">
      <div className="w-full flex flex-col items-center max-w-xl gap-6 px-2">
        <div className="relative w-full aspect-video bg-gray-200 rounded-2xl border overflow-hidden shadow-lg flex items-center justify-center">
          {loading ? (
            <div className="text-gray-500 font-medium">Loading camera…</div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-2xl"
              style={{
                minHeight: 180,
                background: "#222",
              }}
            />
          )}
        </div>
        <button
          className="bg-indigo-600 text-white rounded-full mt-6 font-semibold text-xl flex items-center justify-center shadow-lg transition hover:bg-indigo-700 animate-scale-in"
          style={{
            width: 110,
            height: 110,
            fontSize: 22,
            borderRadius: "50%",
          }}
          onClick={onStart}
          type="button"
        >
          Start Interview
        </button>
        <div className="bg-white px-6 py-4 rounded-xl shadow-md mt-8 w-full max-w-md text-center">
          <h2 className="font-bold text-lg mb-2">Interview Setup</h2>
          <div>
            <span className="font-medium">Position:</span> {config.jobRole}
          </div>
          <div>
            <span className="font-medium">Type:</span> {config.type}
          </div>
          <div>
            <span className="font-medium">Difficulty:</span> {config.difficulty}
          </div>
          <div className="text-xs text-gray-500 mt-3">
            Ensure your camera and background are ready before you begin.
            <br />
            You will enter the interview after pressing the button.
          </div>
          {onBack && (
            <button
              className="absolute left-2 top-2 text-indigo-700 hover:text-indigo-900"
              onClick={onBack}
              type="button"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrestart;

