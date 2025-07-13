
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
    
    console.log("Received request:", { role, language, skills, level });

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Create unique questions by including timestamp and random seed
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    const prompt = `
      You are an expert HR interviewer. Generate 5 UNIQUE, DIVERSE, and CHALLENGING technical interview questions in ${language} for a "${role}" position at ${level} level, focusing on these skills: ${skills.join(", ")}.
      
      IMPORTANT: Make each question DIFFERENT from typical interview questions. Be creative and test real-world problem-solving.
      
      Requirements:
      - Each question should test a different aspect of the skills
      - Include scenario-based questions, not just definitions
      - Make questions progressive from basic to advanced
      - Avoid generic "tell me about" questions
      - Current timestamp: ${timestamp}, seed: ${randomSeed}
      
      Return ONLY the numbered questions, no other text:
      1. [question]
      2. [question]
      3. [question]
      4. [question]
      5. [question]
    `;

    // Gemini API call (text-only model, suitable for interview Qs)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: prompt }] 
          }
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    console.log("Gemini response status:", geminiResponse.status);
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const raw = await geminiResponse.json();
    console.log("Gemini raw response:", JSON.stringify(raw, null, 2));
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
    console.error("Error in generate-gemini-questions:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Check edge function logs for more information"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
