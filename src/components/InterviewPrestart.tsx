
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onBack
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    setLoading(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6 mb-8 border">
        <div className="flex mb-5 items-center gap-2">
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
          <div>
            <h2 className="font-bold text-xl">Get Ready for Your Interview</h2>
            <p className="text-gray-600 text-sm">
              Position: <span className="font-medium">{config.jobRole}</span>{" "}
              &middot; Type: <span className="capitalize">{config.type}</span>{" "}
              &middot; Difficulty: <span className="capitalize">{config.difficulty}</span>
            </p>
          </div>
        </div>
        {/* Video Preview */}
        <div className="flex flex-col items-center">
          <div className="relative w-72 h-56 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border">
            {loading ? (
              <div className="text-gray-500">Loading preview...</div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
          <div className="mb-6 text-center text-gray-500 text-sm">
            <p>Check your camera and background,<br />then press when you are ready.</p>
          </div>
          {/* Circular Start Interview Button */}
          <button
            className="start-button transition-all duration-300 animate-scale-in mb-2"
            style={{ width: 100, height: 100, fontSize: 18, borderRadius: "50%" }}
            onClick={onStart}
            type="button"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrestart;
