
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const WEBHOOK_SECRET = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET');

interface BatchCallRequest {
  candidateId: string;
  phoneNumber: string;
  interviewPrompts: string[];
  voiceId?: string;
  callbackUrl?: string;
  initiatorId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { candidateId, phoneNumber, interviewPrompts, voiceId = 'EXAVITQu4vr4xnSDxMaL', callbackUrl, initiatorId }: BatchCallRequest = await req.json();

      console.log('Starting batch call for candidate:', candidateId);

      // Generate TTS for each interview prompt
      const audioPromises = interviewPrompts.map(async (prompt, index) => {
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY!,
          },
          body: JSON.stringify({
            text: prompt,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (!ttsResponse.ok) {
          throw new Error(`TTS generation failed for prompt ${index + 1}`);
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        return {
          index,
          prompt,
          audioData: new Uint8Array(audioBuffer),
        };
      });

      const audioResults = await Promise.all(audioPromises);

      // Store audio files in Supabase Storage
      const audioUrls = await Promise.all(
        audioResults.map(async (result) => {
          const fileName = `interviews/${candidateId}/prompt_${result.index + 1}_${Date.now()}.mp3`;
          
          const { data, error } = await supabase.storage
            .from('interview-audio')
            .upload(fileName, result.audioData, {
              contentType: 'audio/mpeg',
            });

          if (error) {
            console.error('Storage upload error:', error);
            throw error;
          }

          const { data: urlData } = supabase.storage
            .from('interview-audio')
            .getPublicUrl(fileName);

          return {
            index: result.index,
            prompt: result.prompt,
            audioUrl: urlData.publicUrl,
          };
        })
      );

      // Save batch call session to database
      const { data: sessionData, error: sessionError } = await supabase
        .from('batch_call_sessions')
        .insert({
          candidate_id: candidateId,
          phone_number: phoneNumber,
          voice_id: voiceId,
          prompts: interviewPrompts,
          audio_urls: audioUrls.map(a => a.audioUrl),
          status: 'ready',
          callback_url: callbackUrl,
          initiator_id: initiatorId,
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // Initiate the actual phone call (simulate for now)
      console.log('Initiating call to:', phoneNumber);
      console.log('Audio files ready:', audioUrls.length);

      // Trigger webhook notification
      if (callbackUrl) {
        try {
          await fetch(callbackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': WEBHOOK_SECRET!,
            },
            body: JSON.stringify({
              event: 'batch_call_ready',
              sessionId: sessionData.id,
              candidateId,
              audioUrls: audioUrls.map(a => a.audioUrl),
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (webhookError) {
          console.error('Webhook notification failed:', webhookError);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: sessionData.id,
          audioUrls: audioUrls.map(a => a.audioUrl),
          message: 'Batch call prepared successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in batch call function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
