
import React, { useRef, useEffect, useState } from "react";

/**
 * ElevenLabsInterviewWidget uses the official ElevenLabs embed code and displays a Start Interview launcher.
 */
const ElevenLabsInterviewWidget: React.FC = () => {
  const [started, setStarted] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Load the ElevenLabs script if not already loaded, but only after widget is shown
  useEffect(() => {
    if (started && !document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, [started]);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center">
      <header className="w-full bg-[#1f2937] text-white py-10 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to InterPrepAI</h1>
        <p className="text-lg">Click the button below to start your AI interview session</p>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 w-full">
        {!started ? (
          <button
            type="button"
            className="px-8 py-4 text-lg bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition mb-8"
            onClick={() => setStarted(true)}
          >
            Start Interview
          </button>
        ) : null}

        {/* The ElevenLabs Widget appears here after clicking */}
        <div
          id="interviewWidget"
          ref={widgetRef}
          style={{ display: started ? "block" : "none", maxWidth: 520, margin: "0 auto" }}
          className="w-full"
        >
          {/* Embed the widget with your terms and agent-id props */}
          <elevenlabs-convai
            agent-id="YflyhSHD0Yqq3poIbnan"
            terms-content={`#### Terms and Conditions\n\nBy clicking "Agree", and each time I interact with this AI agent, I consent to the recording, storage, and analysis of my conversations by InterPrepAI and its third-party providers including ElevenLabs and OpenAI. If you do not wish to have your conversations recorded, please do not use this service.`}
            local-storage-key="terms_accepted"
          ></elevenlabs-convai>
        </div>
      </main>
    </div>
  );
};

export default ElevenLabsInterviewWidget;
