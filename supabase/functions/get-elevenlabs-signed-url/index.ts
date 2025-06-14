
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS domains: your production and local dev
const allowedOrigins = [
  "https://interprep-ai.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "https://localhost:5173"
];

const getCORSHeaders = (origin: string | null = "*") => {
  const corsOrigin = allowedOrigins.includes(origin || "") ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info",
    "Content-Type": "application/json"
  };
};

// Set your secret in Lovable as ELEVENLABS_API_KEY, not in code!
const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY");

serve(async (req) => {
  const origin = req.headers.get("origin");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: getCORSHeaders(origin),
    });
  }

  try {
    const { agentId } = await req.json();
    if (!ELEVENLABS_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing ElevenLabs API key" }),
        { status: 500, headers: getCORSHeaders(origin) }
      );
    }
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: "Missing agentId" }),
        { status: 400, headers: getCORSHeaders(origin) }
      );
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
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: response.status, headers: getCORSHeaders(origin) }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: getCORSHeaders(origin),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: getCORSHeaders(origin) }
    );
  }
});
