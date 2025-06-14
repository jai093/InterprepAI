
import React, { useState, useEffect } from "react";

interface CallTimerProps {
  maxSeconds: number;
  onComplete: () => void;
  running: boolean;
}

const CallTimer: React.FC<CallTimerProps> = ({ maxSeconds, onComplete, running }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    if (elapsed >= maxSeconds) {
      onComplete();
      return;
    }
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [elapsed, maxSeconds, onComplete, running]);

  useEffect(() => {
    if (!running) setElapsed(0);
  }, [running]);

  const format = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="text-center font-mono text-lg text-gray-700 px-3">
      {format(elapsed)} / {format(maxSeconds)}
    </div>
  );
};

export default CallTimer;
