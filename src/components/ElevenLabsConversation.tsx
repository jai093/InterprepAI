
import React from "react";

/**
 * This component embeds the ElevenLabs Conversational AI widget using the official embed code.
 * The script is included once from index.html.
 */
const ElevenLabsConversation: React.FC = () => {
  // No need to inject the script here; it's already loaded in index.html
  return (
    <div className="flex justify-center my-12">
      {/* Embed the ElevenLabs Conversational Agent using the provided agent-id */}
      <elevenlabs-convai agent-id="YflyhSHD0Yqq3poIbnan"></elevenlabs-convai>
    </div>
  );
};

export default ElevenLabsConversation;

