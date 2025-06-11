
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

const WEBHOOK_SECRET = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify webhook secret
    const providedSecret = req.headers.get('x-webhook-secret');
    if (providedSecret !== WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook secret' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const webhookData = await req.json();
    console.log('Received ElevenLabs webhook:', webhookData);

    const { event, sessionId, candidateId, audioUrls, audioGenerationComplete, callStatus } = webhookData;

    // Update batch call session status
    if (sessionId) {
      const { error: updateError } = await supabase
        .from('batch_call_sessions')
        .update({
          status: callStatus || 'completed',
          completed_at: new Date().toISOString(),
          webhook_data: webhookData,
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
      }
    }

    // Handle different webhook events
    switch (event) {
      case 'audio_generation_complete':
        console.log('Audio generation completed for session:', sessionId);
        
        // Trigger UI updates via real-time subscription
        await supabase.channel('interview-updates').send({
          type: 'broadcast',
          event: 'audio_ready',
          payload: {
            sessionId,
            candidateId,
            audioUrls,
          },
        });

        // Send notification email/SMS (implement based on your needs)
        if (candidateId) {
          await sendNotification(candidateId, 'audio_ready', { sessionId, audioUrls });
        }
        break;

      case 'call_completed':
        console.log('Call completed for session:', sessionId);
        
        // Trigger emotion/video analysis
        if (candidateId) {
          await triggerAnalysis(candidateId, sessionId);
        }
        break;

      case 'batch_call_ready':
        console.log('Batch call ready for session:', sessionId);
        break;

      default:
        console.log('Unknown webhook event:', event);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendNotification(candidateId: string, type: string, data: any) {
  // Implement email/SMS notification logic
  console.log(`Sending ${type} notification to candidate ${candidateId}:`, data);
  
  // Example: Send email using Resend or SMS using Twilio
  // This would require additional edge functions for email/SMS services
}

async function triggerAnalysis(candidateId: string, sessionId: string) {
  // Trigger emotion/video analysis pipeline
  console.log(`Triggering analysis for candidate ${candidateId}, session ${sessionId}`);
  
  // This could call another edge function or external service
  // for emotion detection, video analysis, etc.
}
