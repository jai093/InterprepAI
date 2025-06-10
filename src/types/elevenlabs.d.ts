
declare global {
  interface Window {
    ElevenLabs?: {
      Conversation?: new (options: {
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

// ElevenLabs SDK types for the new package
export interface ElevenLabsConversationOptions {
  agentId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

export interface ElevenLabsAgentOverrides {
  agent?: {
    prompt?: {
      prompt: string;
    };
    firstMessage?: string;
  };
}

export {};
