
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ELEVEN_LABS_VOICES } from '@/utils/textToSpeech';

interface ElevenLabsContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  currentVoice: string;
  setCurrentVoice: (voiceId: string) => void;
  isConfigured: boolean;
  clearApiKey: () => void;
  hasElevenApiKey: boolean;
  elevenVoiceId: string;
  elevenApiKey: string | null;
}

export const ElevenLabsContext = createContext<ElevenLabsContextType | undefined>(undefined);

export const useElevenLabs = (): ElevenLabsContextType => {
  const context = useContext(ElevenLabsContext);
  if (context === undefined) {
    throw new Error('useElevenLabs must be used within an ElevenLabsProvider');
  }
  return context;
};

interface ElevenLabsProviderProps {
  children: ReactNode;
}

export const ElevenLabsProvider: React.FC<ElevenLabsProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [currentVoice, setCurrentVoice] = useState<string>(ELEVEN_LABS_VOICES.SARAH);
  const { toast } = useToast();

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('elevenLabsApiKey');
    if (storedApiKey) {
      setApiKeyState(storedApiKey);
    }
    
    const storedVoice = localStorage.getItem('elevenLabsVoice');
    if (storedVoice) {
      setCurrentVoice(storedVoice);
    }
  }, []);

  // Set API key and store it in localStorage
  const setApiKey = (key: string) => {
    localStorage.setItem('elevenLabsApiKey', key);
    setApiKeyState(key);
    
    toast({
      title: "ElevenLabs API key saved",
      description: "Your API key has been securely stored for voice generation.",
    });
  };

  // Change voice and store preference
  const handleSetCurrentVoice = (voiceId: string) => {
    localStorage.setItem('elevenLabsVoice', voiceId);
    setCurrentVoice(voiceId);
  };

  // Clear API key
  const clearApiKey = () => {
    localStorage.removeItem('elevenLabsApiKey');
    setApiKeyState(null);
    
    toast({
      title: "API key removed",
      description: "Your ElevenLabs API key has been removed.",
    });
  };

  return (
    <ElevenLabsContext.Provider 
      value={{ 
        apiKey, 
        setApiKey, 
        currentVoice, 
        setCurrentVoice: handleSetCurrentVoice,
        isConfigured: !!apiKey,
        clearApiKey,
        hasElevenApiKey: !!apiKey,
        elevenVoiceId: currentVoice,
        elevenApiKey: apiKey
      }}
    >
      {children}
    </ElevenLabsContext.Provider>
  );
};
