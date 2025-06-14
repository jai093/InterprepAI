
import { useEffect, useState } from "react";

/**
 * Hook to subscribe to the ElevenLabs Conversational Agent's speaking state.
 * Listens for changes to window.ElevenLabs.Conversation instance, if available.
 */
export function useElevenLabsSpeaking() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    let conversation: any = null;
    let pollInterval: NodeJS.Timeout;

    /**
     * Poll for isSpeaking from window.ElevenLabs.Conversation, if available.
     * (Official SDK currently does not emit custom events, so we poll)
     */
    function pollAgent() {
      try {
        if (
          window.ElevenLabs &&
          window.ElevenLabs.Conversation &&
          Array.isArray((window as any).elevenLabsConversations)
        ) {
          // If multiple agents, take the latest
          conversation = (window as any).elevenLabsConversations.slice(-1)[0];
        } else if (
          window.ElevenLabs &&
          window.ElevenLabs.Conversation &&
          (window as any).elevenLabsConversation
        ) {
          // Single instance fallback
          conversation = (window as any).elevenLabsConversation;
        }
        if (!conversation) return;

        setIsSpeaking(!!conversation.isSpeaking);
      } catch (e) {
        setIsSpeaking(false);
      }
    }

    pollInterval = setInterval(pollAgent, 200);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  return isSpeaking;
}
