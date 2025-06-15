
// Gemini Questions Edge Function for Lovable Supabase
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, language, skills, level } = await req.json();

    const prompt = `
      You are an HR assistant. I am preparing an interview for a candidate. Please generate 5 concise, high-quality and non-repetitive technical interview questions in ${language} for the role "${role}" (${level}), focusing on the following skills: ${skills.join(", ")}.
      DO NOT preface your response, just return a plain numbered array (no explanations).
      Example output: 
      1. ...
      2. ...
      3. ...
      4. ...
      5. ...
    `;

    // Gemini API call (text-only model, suitable for interview Qs)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      }),
    });

    const raw = await geminiResponse.json();
    let text = "";

    // Extract the actual response text
    if (raw?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = raw.candidates[0].content.parts[0].text;
    } else if (raw?.candidates?.[0]?.content?.text) {
      text = raw.candidates[0].content.text;
    } else if (raw?.text) {
      text = raw.text;
    } else {
      throw new Error("No Gemini response received");
    }
    // Parse out questions as an array
    const lines = text.split("\n").filter(l => l.trim()).map(l => l.replace(/^\d+\.\s*/, "").trim());
    const questions = lines.slice(0, 5);
    
    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
