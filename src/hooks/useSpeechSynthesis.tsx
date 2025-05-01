
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
}

const useSpeechSynthesis = ({ onEnd }: UseSpeechSynthesisProps = {}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize voices
    const populateVoiceList = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    populateVoiceList();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, options: { rate?: number; pitch?: number; voice?: string } = {}) => {
    // Cancel any existing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Set default options
    newUtterance.rate = options.rate || 1;
    newUtterance.pitch = options.pitch || 1;
    
    // Try to find the requested voice or use a default one
    if (options.voice && voices.length > 0) {
      const requestedVoice = voices.find(v => 
        v.name === options.voice || 
        v.voiceURI === options.voice
      );
      if (requestedVoice) {
        newUtterance.voice = requestedVoice;
      } else {
        // Find deep male voice as default for interviewer
        const deepMaleVoice = voices.find(v => 
          v.name.includes('Male') || 
          (v.lang.includes('en') && !v.name.includes('Female'))
        );
        if (deepMaleVoice) {
          newUtterance.voice = deepMaleVoice;
        }
      }
    }
    
    // Set event handlers
    newUtterance.onstart = () => setIsSpeaking(true);
    newUtterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    newUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "There was an error with text-to-speech. Please try again.",
        variant: "destructive",
      });
    };
    
    // Store the utterance to control it later
    setUtterance(newUtterance);
    
    // Start speaking
    window.speechSynthesis.speak(newUtterance);
  };
  
  const pause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  const resume = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  const cancel = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };
  
  const getPreferredVoice = () => {
    // Try to find a deep male voice for the interviewer
    if (voices.length === 0) return null;
    
    // Priority order: English male voices
    const englishMaleVoices = voices.filter(v => 
      v.lang.includes('en') && 
      (v.name.includes('Male') || !v.name.includes('Female'))
    );
    
    if (englishMaleVoices.length > 0) {
      return englishMaleVoices[0];
    }
    
    // Fallback to any English voice
    const englishVoices = voices.filter(v => v.lang.includes('en'));
    if (englishVoices.length > 0) {
      return englishVoices[0];
    }
    
    // Last resort: any available voice
    return voices[0];
  };

  return {
    voices,
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    getPreferredVoice,
  };
};

export default useSpeechSynthesis;
