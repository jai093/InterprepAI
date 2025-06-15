
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import InterviewSession from "@/components/InterviewSession";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackResult {
  [key: string]: any;
}

export default function CandidateInterview() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [searchParams] = useSearchParams();
  const recruiterId = searchParams.get("r");
  const [sessionComplete, setSessionComplete] = useState(false);
  const [interviewResult, setInterviewResult] = useState<FeedbackResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Get invite associated for display (could be used for showing HR who sent, etc)
  // For now, we'll focus on starting the session and storing result
  const handleInterviewEnd = async (feedback: FeedbackResult) => {
    setSaving(true);
    setInterviewResult(feedback);

    try {
      // Find or create invite in DB
      // Note: in real app, we would validate candidateId and recruiterId are present and sensible
      let inviteId: string | null = null;
      // Try to find invite in DB
      let { data: invites } = await supabase
        .from("interview_invites")
        .select("id")
        .eq("recruiter_id", recruiterId)
        .eq("user_id", candidateId)
        .limit(1);

      if (invites && invites.length > 0) {
        inviteId = invites[0].id;
      } else {
        // Create the invite record
        const { data: created, error: createError } = await supabase
          .from("interview_invites")
          .insert([
            {
              recruiter_id: recruiterId,
              user_id: candidateId,
              invite_link: window.location.href,
              status: "completed",
            },
          ])
          .select();
        if (createError || !created) {
          throw new Error(createError?.message || "Could not create invite");
        }
        inviteId = created[0].id;
      }

      // Save result to interview_results
      const { error: resultError } = await supabase
        .from("interview_results")
        .insert([
          {
            invite_id: inviteId,
            score: feedback.interview_overall_score || feedback.confidence_score || null,
            transcript: Array.isArray(feedback.transcripts)
              ? feedback.transcripts.map((t: any) => `${t.question}\n${t.answer}`).join("\n\n")
              : feedback.transcript || null,
            ai_feedback: feedback?.feedback || JSON.stringify(feedback),
            video_url: feedback.videoURL || feedback.video_url || null,
            audio_url: feedback.audioURL || feedback.audio_url || null,
          },
        ]);
      if (resultError) throw new Error(resultError.message);

      setSessionComplete(true);
      setSaveError(null);
    } catch (e: any) {
      setSaveError(e.message || "Unknown error saving result.");
      setSessionComplete(true);
    }
    setSaving(false);
  };

  if (sessionComplete) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-3">Interview Complete</h1>
          {saveError ? (
            <div className="text-red-500 mb-3">
              Error saving your result: {saveError}
            </div>
          ) : (
            <p className="text-green-700 mb-2">
              Thank you for completing the interview! Your responses have been submitted.
            </p>
          )}
          <div className="text-gray-500 mt-2">
            You may now close this window. HR will review your interview soon.
          </div>
        </div>
      </div>
    );
  }

  // If IDs missing or not valid, fallback
  if (!candidateId || !recruiterId) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-bold text-xl mb-2">Invalid Link</h2>
          <p className="text-gray-600">
            This is not a valid interview invite. Please check your link or contact your recruiter.
          </p>
        </div>
      </div>
    );
  }

  // Render the live interview session for candidate
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <div className="bg-white px-4 py-5 md:py-8 rounded-xl shadow-lg max-w-3xl w-full">
        <h1 className="text-2xl font-bold mb-2 text-center">Live Interview Session</h1>
        <div className="mb-6 text-gray-700 text-center">
          Please ensure your camera and microphone are enabled for this live session.
        </div>
        <InterviewSession
          // For this use-case, pass config with sensible defaults
          config={{
            type: "behavioral",
            jobRole: "N/A",
            duration: 10,
            difficulty: "medium",
          }}
          onEnd={handleInterviewEnd}
        />
        {saving && (
          <div className="mt-6 text-center text-indigo-600">
            Saving your interview responses and analysis...
          </div>
        )}
      </div>
    </div>
  );
}

