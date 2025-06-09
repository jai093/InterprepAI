
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

// WebSocket message types for ElevenLabs Conversational AI - Updated to match API spec
export interface ElevenLabsInitMessage {
  message_type: 'conversation_init';
  agent_id: string;
  voice_id?: string;
  text_to_speech_model_id?: string;
  latency_optimization_level?: number;
  conversation_config_override?: {
    agent?: {
      prompt?: {
        prompt: string;
      };
      first_message?: string;
    };
  };
}

export interface ElevenLabsAudioMessage {
  message_type: 'audio';
  audio_chunk: string; // base64 encoded audio data
}

export interface ElevenLabsPongMessage {
  message_type: 'pong';
  event_id?: string;
}

export interface ElevenLabsIncomingMessage {
  message_type: 'conversation_initiation_metadata' | 'audio' | 'agent_response' | 'ping';
  type?: string; // fallback for older format
  audio_chunk?: string;
  audio?: string;
  agent_response?: {
    audio: string;
  };
  event_id?: string;
}

export {};
