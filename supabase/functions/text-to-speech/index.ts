
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voiceId, apiKey } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    // Log the request for debugging
    console.log(`Processing TTS request for voice ID: ${voiceId || '21m00Tcm4TlvDq8ikWAM'}`);
    
    // Call ElevenLabs API to generate speech
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || '21m00Tcm4TlvDq8ikWAM'}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.detail?.message || `API Error: ${response.status}`);
      } catch (e) {
        throw new Error(`Error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
    }

    // Forward the audio response
    const audioBuffer = await response.arrayBuffer();
    console.log("Successfully generated audio");
    
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack?.split('\n')[0] // Include first line of stack for debugging
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
