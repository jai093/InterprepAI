import { useState, useEffect, useCallback } from "react";
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
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(true);

  // Check browser support
  useEffect(() => {
    if (!window.speechSynthesis) {
      setSpeechSynthesisSupported(false);
      console.error("Speech synthesis not supported in this browser");
      toast({
        title: "Speech Synthesis Not Available",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Initialize voices with better error handling
  useEffect(() => {
    // Only attempt if speech synthesis is supported
    if (!window.speechSynthesis) return;
    
    try {
      const populateVoiceList = () => {
        try {
          const availableVoices = window.speechSynthesis.getVoices();
          setVoices(availableVoices);
          
          // Log available voices to help with debugging
          console.log(`Available voices: ${availableVoices.length}`, 
            availableVoices.map(v => `${v.name} (${v.lang})`).join(', '));
        } catch (error) {
          console.error("Error getting voices:", error);
        }
      };

      populateVoiceList();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
      }
      
      // Reset speech synthesis on page load
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error("Error initializing speech synthesis:", error);
    }

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.error("Error cancelling speech synthesis:", error);
      }
    };
  }, []);

  // Create a wrapper for speak function with retry logic
  const speak = useCallback((text: string, options: { rate?: number; pitch?: number; voice?: string } = {}) => {
    if (!window.speechSynthesis || !speechSynthesisSupported) {
      toast({
        title: "Speech Synthesis Not Available",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      // Simulate completion after text would have been spoken
      setTimeout(() => {
        if (onEnd) onEnd();
      }, text.length * 50); // ~50ms per character as fallback
      return;
    }
    
    try {
      // Cancel any existing speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance
      const newUtterance = new SpeechSynthesisUtterance(text);
      
      // Set default options with slightly reduced values for better reliability
      newUtterance.rate = options.rate !== undefined ? options.rate : 0.9;
      newUtterance.pitch = options.pitch !== undefined ? options.pitch : 1;
      
      // Try to find the requested voice or use a default one
      if (options.voice && voices.length > 0) {
        const requestedVoice = voices.find(v => 
          v.name === options.voice || 
          v.voiceURI === options.voice
        );
        
        if (requestedVoice) {
          newUtterance.voice = requestedVoice;
          console.log(`Using requested voice: ${requestedVoice.name}`);
        } else {
          // Find deep male voice as default for interviewer
          const deepMaleVoice = voices.find(v => 
            v.name.includes('Male') || 
            (v.lang.includes('en') && !v.name.includes('Female'))
          );
          
          if (deepMaleVoice) {
            newUtterance.voice = deepMaleVoice;
            console.log(`Using deep male voice: ${deepMaleVoice.name}`);
          } else if (voices.length > 0) {
            // Fallback to any available voice
            newUtterance.voice = voices[0];
            console.log(`Fallback to first available voice: ${voices[0].name}`);
          }
        }
      }
      
      // Set event handlers with better error handling
      newUtterance.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };
      
      newUtterance.onend = () => {
        console.log("Speech ended normally");
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      
      newUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        
        // Try to provide more specific error information
        let errorMessage = "There was an error with text-to-speech. Please try again.";
        if (event.error) {
          errorMessage = `Speech error: ${event.error}`;
        }
        
        toast({
          title: "Speech Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Ensure onEnd is still called even on error
        if (onEnd) onEnd();
      };
      
      // Store the utterance to control it later
      setUtterance(newUtterance);
      
      // Start speaking with retry logic
      try {
        window.speechSynthesis.speak(newUtterance);
        console.log("Speech synthesis started");
        
        // Chrome has a bug where speech can cut off - this keeps it alive
        const keepAlive = setInterval(() => {
          if (isSpeaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            console.log("Keeping speech synthesis alive");
          } else {
            clearInterval(keepAlive);
          }
        }, 5000);
        
        // Clear interval when speech ends
        newUtterance.onend = () => {
          clearInterval(keepAlive);
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };
      } catch (speakError) {
        console.error("Error in speechSynthesis.speak:", speakError);
        setIsSpeaking(false);
        
        toast({
          title: "Speech Synthesis Failed",
          description: "Could not start speech synthesis. Trying an alternative method...",
          variant: "warning"
        });
        
        // Fallback to notify the UI that "speech" is done
        setTimeout(() => {
          if (onEnd) onEnd();
        }, text.length * 50); // ~50ms per character as fallback
      }
    } catch (error) {
      console.error("Speech synthesis setup error:", error);
      setIsSpeaking(false);
      
      toast({
        title: "Speech Setup Error",
        description: "Could not set up text-to-speech. Please try refreshing the page.",
        variant: "destructive",
      });
      
      // Ensure onEnd is called even on error
      if (onEnd) onEnd();
    }
  }, [voices, isSpeaking, speechSynthesisSupported, toast, onEnd]);
  
  const pause = useCallback(() => {
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } catch (error) {
      console.error("Error pausing speech:", error);
    }
  }, []);
  
  const resume = useCallback(() => {
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Error resuming speech:", error);
    }
  }, []);
  
  const cancel = useCallback(() => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsPaused(false);
    } catch (error) {
      console.error("Error cancelling speech:", error);
    }
  }, []);
  
  const getPreferredVoice = useCallback(() => {
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
  }, [voices]);

  return {
    voices,
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    getPreferredVoice,
    speechSynthesisSupported
  };
};

export default useSpeechSynthesis;
