
declare global {
  interface Window {
    ElevenLabs: {
      Conversation: new (options: {
        agentId: string;
        onConnect?: () => void;
        onDisconnect?: () => void;
        onMessage?: (message: any) => void;
        onError?: (error: any) => void;
      }) => {
        startSession: () => Promise<void>;
        endSession: () => Promise<void>;
        setOverrides: (overrides: {
          agent?: {
            prompt?: {
              prompt: string;
            };
            firstMessage?: string;
          };
        }) => void;
        setVolume: (options: { volume: number }) => Promise<void>;
        status: string;
        isSpeaking: boolean;
      };
    };
  }
}

export {};
