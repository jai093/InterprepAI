
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Set your secret in Lovable as ELEVENLABS_API_KEY, not in code!
const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY");

serve(async (req) => {
  try {
    const { agentId } = await req.json();
    if (!ELEVENLABS_KEY) {
      return new Response("Missing ElevenLabs API key", { status: 500 });
    }
    if (!agentId) {
      return new Response("Missing agentId", { status: 400 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_KEY,
        },
      }
    );

    if (!response.ok) {
      const errMsg = await response.text();
      return new Response(errMsg, { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
