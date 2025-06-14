
import React, { useState, useRef, useEffect } from "react";

// Animation utility: cycles through colors for speaking effect
const COLORS = [
  "#6366f1", // Interprepai light
  "#4338ca", // Interprepai dark
  "#1E40AF", // Blue
  "#a5b4fc", // Lightest
];

interface AnimatedAIWidgetProps {
  speaking?: boolean;
  message?: string;
  onClose?: () => void;
}

/**
 * Custom AI Interviewer Widget with animated avatar and color-changing talking state.
 */
const AnimatedAIWidget: React.FC<AnimatedAIWidgetProps> = ({
  speaking = true,
  message = "The AI Interviewer is speaking...",
  onClose,
}) => {
  const [colorIndex, setColorIndex] = useState(0);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Cycle avatar border color when "speaking"
  useEffect(() => {
    if (!speaking) return;

    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % COLORS.length);
    }, 350);

    return () => clearInterval(interval);
  }, [speaking]);

  // "Mouth" animates open and close
  const [mouthOpen, setMouthOpen] = useState(false);
  useEffect(() => {
    if (!speaking) return setMouthOpen(false);

    const mouthTimer = setInterval(() => {
      setMouthOpen((open) => !open);
    }, 220);

    return () => clearInterval(mouthTimer);
  }, [speaking]);

  return (
    <div
      className="fixed bottom-4 right-4 w-[360px] max-w-full z-[9999] animate-fade-in"
      style={{
        boxShadow: "0 0 32px 0 rgba(80,74,203,0.25)",
      }}
    >
      <div className="relative bg-white rounded-xl p-4 flex gap-4 items-center ring-2"
        style={{
          borderColor: speaking ? COLORS[colorIndex] : "#e5e7eb",
          transition: "border-color 0.3s",
        }}
      >
        {/* Animated Avatar */}
        <div
          ref={avatarRef}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 74,
            height: 74,
            background: speaking
              ? `radial-gradient(circle at 55% 45%, ${COLORS[colorIndex]} 70%, #fff 130%)`
              : "#e0e7ff",
            transition: "background 0.3s",
            boxShadow: speaking
              ? `0 0 18px 4px ${COLORS[colorIndex]}66`
              : "0 2px 16px #6366f133",
          }}
        >
          {/* Face */}
          <svg width="60" height="60" viewBox="0 0 60 60" className="block">
            {/* Head */}
            <circle cx="30" cy="30" r="28" fill="#fff" stroke="#d1d5db" strokeWidth="2"/>
            {/* Eyes */}
            <ellipse cx="22" cy="27" rx="3" ry="5" fill="#4338ca" />
            <ellipse cx="38" cy="27" rx="3" ry="5" fill="#4338ca" />
            {/* Mouth animated */}
            <ellipse
              cx="30"
              cy="41"
              rx={mouthOpen ? 7 : 7}
              ry={mouthOpen ? 7 : 1.8}
              fill={speaking ? COLORS[colorIndex] : "#aeaeae"}
              style={{
                transition: "all 0.17s cubic-bezier(.4,0,.6,1)",
              }}
            />
          </svg>
        </div>
        {/* Message */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg text-slate-700 mb-1 select-none">
            AI Interviewer
          </div>
          <div className="text-md text-gray-600 min-h-[38px] flex items-center">
            {message}
          </div>
        </div>
        {/* Close */}
        {onClose && (
          <button
            className="absolute top-1 right-2 text-gray-400 hover:text-destructive transition"
            aria-label="Close widget"
            onClick={onClose}
            tabIndex={0}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimatedAIWidget;
