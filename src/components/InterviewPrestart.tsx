
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

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
    <div className="flex flex-col md:flex-row items-center justify-center w-full h-full gap-6">
      {/* Left: Camera Preview */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl">
        <div className="w-full max-w-lg aspect-video bg-gray-200 rounded-xl shadow border flex items-center justify-center relative overflow-hidden">
          {loading ? (
            <div className="text-gray-500">Loading camera...</div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-xl"
            />
          )}
        </div>
        <button
          className="start-button mt-7 animate-scale-in"
          style={{
            width: 120,
            height: 120,
            fontSize: 20,
            borderRadius: "50%",
          }}
          onClick={onStart}
          type="button"
        >
          Start Interview
        </button>
      </div>
      {/* Right: Interview Info */}
      <div className="w-full max-w-md flex flex-col bg-white rounded-xl shadow-lg px-6 py-8 border min-h-[340px] mt-6 md:mt-0">
        <div className="flex items-center mb-4 gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full p-2 hover:bg-gray-100 transition"
              aria-label="Back"
              type="button"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <h2 className="font-bold text-2xl">Get Ready</h2>
        </div>
        <div className="mb-3">
          <p>
            <span className="font-semibold">Position:</span> {config.jobRole}
          </p>
          <p>
            <span className="font-semibold">Type:</span> {config.type}
          </p>
          <p>
            <span className="font-semibold">Difficulty:</span> {config.difficulty}
          </p>
        </div>
        <div className="text-gray-600 text-sm mb-2">
          Ensure your camera and background are ready before you begin.
        </div>
        <div className="text-xs text-gray-400">
          You’ll enter the real interview after pressing the button.
        </div>
      </div>
    </div>
  );
};

export default InterviewPrestart;
