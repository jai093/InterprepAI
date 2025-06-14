
import React, { useEffect } from "react";

/**
 * This component embeds the ElevenLabs Conversational AI widget using the official embed code.
 */
const ElevenLabsConversation: React.FC = () => {
  useEffect(() => {
    // If the script already exists, don't add it again
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-12">
      {/* Embed the ElevenLabs Conversational Agent using the provided agent-id */}
      <elevenlabs-convai agent-id="YflyhSHD0Yqq3poIbnan"></elevenlabs-convai>
    </div>
  );
};

export default ElevenLabsConversation;
