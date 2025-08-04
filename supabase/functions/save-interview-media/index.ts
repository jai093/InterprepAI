import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const videoFile = formData.get('video') as File;
    const inviteId = formData.get('inviteId') as string;
    const candidateId = formData.get('candidateId') as string;

    let audioUrl = null;
    let videoUrl = null;

    // Upload audio file if provided
    if (audioFile && audioFile.size > 0) {
      const audioFileName = `${inviteId}-${candidateId}-audio-${Date.now()}.webm`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('interview-audio')
        .upload(audioFileName, audioFile, {
          contentType: 'audio/webm',
        });

      if (audioError) {
        console.error('Audio upload error:', audioError);
      } else {
        const { data: audioUrlData } = supabase.storage
          .from('interview-audio')
          .getPublicUrl(audioData.path);
        audioUrl = audioUrlData.publicUrl;
      }
    }

    // Upload video file if provided
    if (videoFile && videoFile.size > 0) {
      const videoFileName = `${inviteId}-${candidateId}-video-${Date.now()}.webm`;
      const { data: videoData, error: videoError } = await supabase.storage
        .from('interview-audio')
        .upload(videoFileName, videoFile, {
          contentType: 'video/webm',
        });

      if (videoError) {
        console.error('Video upload error:', videoError);
      } else {
        const { data: videoUrlData } = supabase.storage
          .from('interview-audio')
          .getPublicUrl(videoData.path);
        videoUrl = videoUrlData.publicUrl;
      }
    }

    return new Response(
      JSON.stringify({ audioUrl, videoUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in save-interview-media:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});