import React, { useState, useRef, useEffect } from "react";
import { useTextToSpeech } from "@/utils/textToSpeech";
import { useElevenLabs } from "@/contexts/ElevenLabsContext";

// Animation utility: cycles through colors for speaking effect
const COLORS = [
  "#6366f1", // Interprepai light
  "#4338ca", // Interprepai dark
  "#1E40AF", // Blue
  "#a5b4fc", // Lightest
];

interface AnimatedAIWidgetProps {
  isSpeaking?: boolean;
  message?: string;
  onClose?: () => void;
}

// Animated custom AI Interviewer Widget with animated avatar and mouth movement synced to provided speaking state.
const AnimatedAIWidget: React.FC<AnimatedAIWidgetProps> = ({
  isSpeaking = false,
  message = "The AI Interviewer is speaking...",
  onClose,
}) => {
  const [colorIndex, setColorIndex] = useState(0);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Animate color cycling while speaking
  useEffect(() => {
    if (!isSpeaking) return;
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % COLORS.length);
    }, 350);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Mouth animation synced with isSpeaking
  const [mouthOpen, setMouthOpen] = useState(false);
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false);
      return;
    }
    const mouthTimer = setInterval(() => {
      setMouthOpen((open) => !open);
    }, 220);
    return () => clearInterval(mouthTimer);
  }, [isSpeaking]);

  return (
    <div
      className="fixed bottom-4 left-0 w-full z-[9999] flex justify-center pointer-events-none"
      style={{
        pointerEvents: "none",
        animation: "fade-in 0.3s ease",
      }}
    >
      <div
        className="relative bg-white rounded-xl p-4 flex gap-4 items-center ring-2 pointer-events-auto shadow-lg"
        style={{
          borderColor: isSpeaking ? COLORS[colorIndex] : "#e5e7eb",
          transition: "border-color 0.3s",
          minWidth: 320,
          maxWidth: 460,
        }}
      >
        {/* Animated Avatar */}
        <div
          ref={avatarRef}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 74,
            height: 74,
            background: isSpeaking
              ? `radial-gradient(circle at 55% 45%, ${COLORS[colorIndex]} 70%, #fff 130%)`
              : "#e0e7ff",
            transition: "background 0.3s",
            boxShadow: isSpeaking
              ? `0 0 18px 4px ${COLORS[colorIndex]}66`
              : "0 2px 16px #6366f133",
          }}
        >
          {/* Face */}
          <svg width="60" height="60" viewBox="0 0 60 60" className="block">
            {/* Head */}
            <circle cx="30" cy="30" r="28" fill="#fff" stroke="#d1d5db" strokeWidth="2" />
            {/* Eyes */}
            <ellipse cx="22" cy="27" rx="3" ry="5" fill="#4338ca" />
            <ellipse cx="38" cy="27" rx="3" ry="5" fill="#4338ca" />
            {/* Mouth animated */}
            <ellipse
              cx="30"
              cy="41"
              rx={mouthOpen ? 7 : 7}
              ry={mouthOpen ? 7 : 1.8}
              fill={isSpeaking ? COLORS[colorIndex] : "#aeaeae"}
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
            style={{ pointerEvents: "auto" }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimatedAIWidget;
