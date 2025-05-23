
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Available ElevenLabs voices with their IDs
export const ELEVEN_LABS_VOICES = {
  ARIA: '9BWtsMINqrJLrRacOk9x',
  ROGER: 'CwhRBWXzGAHq8TQ4Fs17',
  SARAH: 'EXAVITQu4vr4xnSDxMaL',
  CHARLIE: 'IKne3meq5aSn9XLyUdCD'
};

// Function to convert text to speech using ElevenLabs API
export const textToSpeech = async (
  text: string,
  voiceId: string = ELEVEN_LABS_VOICES.SARAH, 
  apiKey?: string
): Promise<string | null> => {
  try {
    if (!apiKey) {
      console.error("No ElevenLabs API key provided");
      return null;
    }

    // Use direct fetch to the edge function instead of accessing protected properties
    const functionName = 'text-to-speech';
    const projectRef = 'mybjsygfhrzzknwalyov'; // From supabase/config.toml
    
    // Get current auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Call the edge function properly
    const response = await fetch(
      `https://${projectRef}.supabase.co/functions/v1/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          text,
          voiceId,
          apiKey,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    // Create a blob URL from the response to play the audio
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error converting text to speech:", error);
    return null;
  }
};

// React hook for using text-to-speech functionality
export const useTextToSpeech = () => {
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Effect to create audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onplay = () => setIsSpeaking(true);
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Audio Error",
        description: "Failed to play audio",
        variant: "destructive"
      });
    };
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [toast]);
  
  // Function to speak text
  const speak = useCallback(async (
    text: string, 
    voiceId: string = ELEVEN_LABS_VOICES.SARAH,
    apiKey?: string
  ) => {
    try {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Generate new audio
      const url = await textToSpeech(text, voiceId, apiKey);
      if (!url) {
        throw new Error("Failed to generate speech");
      }
      
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
      
      return true;
    } catch (error) {
      console.error("Error in speak function:", error);
      toast({
        title: "Speech Error",
        description: "Failed to generate or play speech",
        variant: "destructive"
      });
      return false;
    }
  }, [audioUrl, toast]);
  
  // Function to stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking
  };
};
