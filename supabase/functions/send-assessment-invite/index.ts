import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssessmentInviteRequest {
  candidate_email: string;
  assessment_title: string;
  recruiter_name: string;
  recruiter_email: string;
  invite_link: string;
  invite_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      candidate_email, 
      assessment_title, 
      recruiter_name, 
      recruiter_email, 
      invite_link 
    }: AssessmentInviteRequest = await req.json();

    console.log('Sending assessment invite email to:', candidate_email);

    const emailResponse = await resend.emails.send({
      from: "Interview Platform <onboarding@resend.dev>",
      to: [candidate_email],
      subject: `Interview Assessment Invitation: ${assessment_title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Assessment Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Interview Assessment Invitation</h1>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello,</p>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                You have been invited by <strong>${recruiter_name}</strong> to complete an interview assessment for the following role:
              </p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">${assessment_title}</h3>
                <p style="color: #64748b; margin: 0; font-size: 14px;">Assessment from ${recruiter_name}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invite_link}" 
                 style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
                Start Assessment
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h4 style="color: #374151; margin-bottom: 15px;">What to Expect:</h4>
              <ul style="color: #6b7280; line-height: 1.8;">
                <li>Interactive AI-powered interview questions</li>
                <li>Video and audio recording (ensure camera/microphone access)</li>
                <li>Real-time feedback and analysis</li>
                <li>Estimated completion time: 15-30 minutes</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Important:</strong> Please ensure you have a stable internet connection and access to your camera and microphone before starting the assessment.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>If you have any questions, please contact ${recruiter_name} at 
                <a href="mailto:${recruiter_email}" style="color: #2563eb;">${recruiter_email}</a>
              </p>
              <p style="margin-top: 20px;">Best of luck with your assessment!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Assessment invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-assessment-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);