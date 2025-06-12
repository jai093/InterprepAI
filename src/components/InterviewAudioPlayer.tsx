
import { useEffect, useRef } from 'react';

interface InterviewAudioPlayerProps {
  audioUrl: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

const InterviewAudioPlayer = ({ 
  audioUrl, 
  onPlayStart, 
  onPlayEnd, 
  onError 
}: InterviewAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const playAudio = async () => {
      try {
        onPlayStart?.();
        
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        if (!audioRef.current) {
          audioRef.current = new Audio(url);
        } else {
          audioRef.current.src = url;
        }

        // Set up event listeners
        audioRef.current.onended = () => {
          onPlayEnd?.();
          URL.revokeObjectURL(url); // Clean up blob URL
        };

        audioRef.current.onerror = (e) => {
          const error = new Error('Audio playback failed');
          console.error('Audio playback failed:', e);
          onError?.(error);
          URL.revokeObjectURL(url); // Clean up blob URL
        };

        await audioRef.current.play();
        console.log('Audio playing...');
      } catch (error) {
        console.error('Audio playback failed:', error);
        onError?.(error as Error);
      }
    };

    playAudio();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl, onPlayStart, onPlayEnd, onError]);

  return null; // This component doesn't render anything
};

export default InterviewAudioPlayer;
