
declare global {
  interface Window {
    ElevenLabs: {
      useConversation: (options: {
        onConnect?: () => void;
        onDisconnect?: () => void;
        onMessage?: (message: any) => void;
        onError?: (error: any) => void;
      }) => {
        startSession: (config: {
          agentId: string;
          overrides?: {
            agent?: {
              prompt?: {
                prompt: string;
              };
              firstMessage?: string;
            };
          };
        }) => Promise<void>;
        endSession: () => Promise<void>;
        setVolume: (options: { volume: number }) => Promise<void>;
        status: string;
        isSpeaking: boolean;
      };
    };
  }
}

export {};
