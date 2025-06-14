
import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedStartCallButtonProps {
  status: "idle" | "user" | "ai";
  onClick: () => void;
  disabled?: boolean;
}

const COLORS: Record<string, string> = {
  idle: "bg-gray-200",
  user: "bg-blue-500 animate-pulse-shadow",
  ai: "bg-purple-600 animate-pulse-shadow",
};

const AnimatedStartCallButton: React.FC<AnimatedStartCallButtonProps> = ({
  status = "idle",
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "rounded-full h-24 w-24 flex items-center justify-center text-white font-bold text-lg focus-visible:ring-2 focus-visible:ring-ring transition-all duration-300 drop-shadow-xl shadow-xl outline-none",
      COLORS[status],
      disabled && "opacity-50 pointer-events-none"
    )}
    aria-label="Start Call"
    disabled={disabled}
    style={{
      boxShadow: status !== "idle" ? "0 0 24px 5px #818cf8" : undefined,
      border: status !== "idle" ? "3px solid #818cf8" : "2px solid #e5e7eb",
      animation: status !== "idle" ? "pulse 1.5s infinite cubic-bezier(.4,0,.6,1)" : undefined,
    }}
  >
    {status === "idle" ? "Start Call" : status === "user" ? "You" : "AI"}
  </button>
);

export default AnimatedStartCallButton;

