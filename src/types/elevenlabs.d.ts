
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

// WebSocket message types for ElevenLabs Conversational AI
export interface ElevenLabsMessage {
  type: 'audio' | 'agent_response' | 'agent_response_end' | 'conversation_initiation_metadata';
  audio?: string;
  conversation_initiation_metadata?: {
    conversation_config_override: {
      agent: {
        prompt?: {
          prompt: string;
        };
        first_message?: string;
      };
    };
  };
}

export {};
