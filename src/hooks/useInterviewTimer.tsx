
import { useRef, useState, useCallback } from "react";

export function useInterviewTimer(maxDuration: number, onComplete: () => void) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const updated = prev + 1;
        if (updated >= maxDuration) {
          onComplete();
          return maxDuration;
        }
        return updated;
      });
    }, 1000);
  }, [maxDuration, onComplete]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedTime(0);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return { elapsedTime, startTimer, resetTimer, clearTimer, formatTime, setElapsedTime };
}
