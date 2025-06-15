
// Fetches interview analysis & evaluation from ElevenLabs after a conversation
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const BASE_URL = "https://api.elevenlabs.io/v1/";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, agentId } = await req.json();

    if (!ELEVENLABS_API_KEY) throw new Error("No API key.");
    if (!sessionId || !agentId) throw new Error("Missing sessionId/agentId");

    // 1. Get the conversation details (responses, transcript, criteria, etc.)
    const convRes = await fetch(`${BASE_URL}conversations/${sessionId}`, {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    if (!convRes.ok) {
      const err = await convRes.text();
      throw new Error("Failed to fetch conversation: " + err);
    }
    const conversation = await convRes.json();

    // 2. (Optional) You may call an evaluation endpoint if available for scoring
    // For now, extract what we can from conversation data
    const analysis = {
      // Basic metadata
      candidate_name: conversation?.user?.name || "Candidate",
      target_role: conversation?.conversation?.role || "Software Engineer",
      date: conversation?.created_at, // could format this better on client
      duration: conversation?.duration_seconds
        ? Math.round(conversation.duration_seconds / 60) + " min"
        : "",
      transcripts: Array.isArray(conversation?.messages)
        ? conversation.messages
            .filter((m) => m.sender === "user" || m.sender === "ai")
            .map((m) => ({
              question: m.sender === "ai" ? m.text : "",
              answer: m.sender === "user" ? m.text : "",
              timestamp: m.timestamp,
            }))
        : [],
      // Criteria, if provided by ElevenLabs (put in root for convenience, fallback to 0)
      voice_modulation: conversation?.evaluation?.voice_modulation ?? 0,
      body_language: conversation?.evaluation?.body_language ?? 0,
      problem_solving: conversation?.evaluation?.problem_solving ?? 0,
      communication_style: conversation?.evaluation?.communication_style ?? 0,
      example_usage: conversation?.evaluation?.example_usage ?? 0,
      tone_language: conversation?.evaluation?.tone_language ?? 0,
      structure: conversation?.evaluation?.structure ?? 0,
      confidence: conversation?.evaluation?.confidence ?? 0,
      relevance: conversation?.evaluation?.relevance ?? 0,
      clarity: conversation?.evaluation?.clarity ?? 0,
      // Additional evaluation analysis
      ...conversation?.evaluation,
    };

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
