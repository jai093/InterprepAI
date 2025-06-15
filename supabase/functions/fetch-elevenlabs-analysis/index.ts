
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const BASE_URL = "https://api.elevenlabs.io/v1/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, agentId } = await req.json();

    if (!ELEVENLABS_API_KEY) throw new Error("No API key.");
    if (!sessionId || !agentId) throw new Error("Missing sessionId/agentId");

    // --- Call ElevenLabs for conversation details ---
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

    // --- Analysis building ---
    // Ensure all evaluation criteria exist, fallback to 0 if undefined
    const getVal = (v: any) => (typeof v === "number" ? v : 0);

    // Use available evaluation or build basic scores
    const evaluation = conversation?.evaluation ?? {};

    // Gather responsesAnalysis, nonVerbalAnalysis, etc., safely
    const makeObj = (obj: any, keys: string[]) =>
      keys.reduce((acc, k) => ({ ...acc, [k]: getVal(obj?.[k]) }), {});

    // Build transcript array
    const transcripts = Array.isArray(conversation?.messages)
      ? conversation.messages
          .filter((m) => m.sender === "user" || m.sender === "ai")
          .map((m) => ({
            question: m.sender === "ai" ? m.text : "",
            answer: m.sender === "user" ? m.text : "",
            timestamp: m.timestamp,
          }))
      : [];

    const analysis = {
      candidate_name: conversation?.user?.name || "",
      target_role: conversation?.conversation?.role || "",
      date: conversation?.created_at || "",
      duration: conversation?.duration_seconds
        ? Math.round(conversation.duration_seconds / 60) + " min"
        : "",
      // Main evaluation criteria
      voice_modulation: getVal(evaluation.voice_modulation),
      body_language: getVal(evaluation.body_language),
      problem_solving: getVal(evaluation.problem_solving),
      communication_style: getVal(evaluation.communication_style),
      example_usage: getVal(evaluation.example_usage),
      tone_language: getVal(evaluation.tone_language),
      structure: getVal(evaluation.structure),
      confidence: getVal(evaluation.confidence),
      relevance: getVal(evaluation.relevance),
      clarity: getVal(evaluation.clarity),

      // Detailed analysis
      responsesAnalysis: makeObj(evaluation, [
        "clarity",
        "relevance",
        "structure",
        "examples",
      ]),
      nonVerbalAnalysis: makeObj(evaluation, [
        "eyeContact",
        "facialExpressions",
        "bodyLanguage",
      ]),
      voiceAnalysis: makeObj(evaluation, [
        "pace",
        "tone",
        "clarity",
        "confidence",
      ]),
      facialAnalysis: makeObj(evaluation, [
        "smile",
        "neutrality",
        "confidence",
        "engagement",
        "eyeContact",
        "facialExpressions",
      ]),
      bodyAnalysis: makeObj(evaluation, [
        "posture",
        "gestures",
        "movement",
        "presence",
      ]),

      strengths: Array.isArray(evaluation.strengths)
        ? evaluation.strengths
        : [],
      improvements: Array.isArray(evaluation.improvements)
        ? evaluation.improvements
        : [],
      recommendations: Array.isArray(evaluation.recommendations)
        ? evaluation.recommendations
        : [],

      transcripts,
    };

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
