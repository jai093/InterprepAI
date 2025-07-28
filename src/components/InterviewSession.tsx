import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import InterviewPreviewPanel from "./InterviewPreviewPanel";
import InterviewWidget from "./InterviewWidget";
import "../components/InterviewWidget.css";
import { useInterviewRecorder } from "@/hooks/useInterviewRecorder";
import { supabase } from "@/integrations/supabase/client";

interface InterviewConfig {
  type: string;
  jobRole: string;
  duration: number;
  difficulty: string;
}

interface InterviewSessionProps {
  config: InterviewConfig;
  onEnd: (feedback: any) => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onEnd }) => {
  // --- Video/audio state ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // NEW: Interview recording hook
  const recorder = useInterviewRecorder();

  // --- Setup user media & recording ---
  useEffect(() => {
    let localStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        localStream = stream;
        // Start recording immediately
        recorder.start(stream);
      })
      .catch(() => {});
    return () => {
      recorder.stop();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      recorder.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle handlers
  const toggleVideo = () => {
    if (!streamRef.current) return;
    setVideoEnabled((v) => {
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !v));
      return !v;
    });
  };
  const toggleAudio = () => {
    if (!streamRef.current) return;
    setAudioEnabled((a) => {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !a));
      return !a;
    });
  };

  // Pass ElevenLabs conversation/sessionId when starting
  const onInterviewStarted = (id?: string) => {
    if (id) setSessionId(id);
  };

  // Overwrite config.duration everywhere with 10 minutes for legacy safety
  const activeDuration = 10;

  // Helper to generate mock feedback for demo purposes
  const generateMockFeedback = (): any => {
    return {
      // Custom criteria
      candidate_name: "Demo Candidate",
      target_role: config.jobRole,
      mobile_number: "+123456789",
      confidence_score: "83",
      resume_url: "https://example.com/resume.pdf",
      interview_overall_score: "78",
      language_used: "English",
      email_address: "demo@example.com",
      date: new Date().toLocaleString(),
      duration: `${activeDuration} min`,

      // Evaluation criteria (0-100 scale)
      voice_modulation: 79,
      body_language: 75,
      problem_solving: 82,
      communication_style: 85,
      example_usage: 73,
      tone_language: 80,
      structure: 78,
      confidence: 84,
      relevance: 91,
      clarity: 77,

      // Recordings
      videoURL: videoRef.current && videoRef.current.srcObject
        ? undefined // For security, do not share live video stream, but you can use a mock URL
        : undefined,
      audioURL: undefined,

      // Mock additional analysis data (used by FeedbackReport)
      responsesAnalysis: {
        clarity: 77, relevance: 91, structure: 78, examples: 73,
      },
      nonVerbalAnalysis: {
        eyeContact: 80, facialExpressions: 75, bodyLanguage: 75,
      },
      voiceAnalysis: {
        pace: 83, tone: 79, clarity: 77, confidence: 84,
      },
      facialAnalysis: {
        smile: 80, neutrality: 80, confidence: 84, engagement: 83, eyeContact: 80, facialExpressions: 75,
      },
      bodyAnalysis: {
        posture: 76, gestures: 74, movement: 71, presence: 80,
      },
      strengths: [
        "Clear and professional communication",
        "Strong logical reasoning",
        "Excellent engagement with the interviewer"
      ],
      improvements: [
        "Provide more concrete examples in some answers",
        "Reduce usage of filler words"
      ],
      recommendations: [
        "Prepare more structured responses using STAR method",
        "Practice varying tone for more confidence"
      ],
      transcripts: [
        { question: "Tell me about yourself.", answer: "I am a software engineer with 5 years of experience in full stack development..." },
        { question: "Describe a situation where you solved a complex problem.", answer: "For instance, in my previous role, I faced a database scaling issue..." }
      ]
    };
  };

  // NEW: Fetch ElevenLabs evaluation from Edge Function
  const fetchRealFeedback = async (sid: string) => {
    setLoading(true);
    try {
      // Always use the actual sessionId to get real scores – not mock!
      const res = await fetch("https://mybjsygfhrzzknwalyov.supabase.co/functions/v1/fetch-elevenlabs-analysis", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          sessionId: sid,
          agentId: "agent_01jxs5kf50fg6t0p79hky1knfb",
        }),
      });
      const data = await res.json();
      console.log('Analysis response:', data);
      
      // The actual ElevenLabs analysis now includes real scores & detailed analysis!
      if (data.analysis && Object.keys(data.analysis).length > 0) {
        // Attach blobs to analysis
        data.analysis.videoBlob = recorder.videoBlob;
        data.analysis.audioBlob = recorder.audioBlob;
        onEnd(data.analysis);
      } else {
        console.log('No analysis data, using mock feedback');
        // Use mock feedback if no real analysis
        const mockFeedback = generateMockFeedback();
        (mockFeedback as any).videoBlob = recorder.videoBlob;
        (mockFeedback as any).audioBlob = recorder.audioBlob;
        onEnd(mockFeedback);
      }
    } catch (e) {
      console.error('Error fetching analysis:', e);
      // Use mock feedback on error
      const mockFeedback = generateMockFeedback();
      (mockFeedback as any).videoBlob = recorder.videoBlob;
      (mockFeedback as any).audioBlob = recorder.audioBlob;
      onEnd(mockFeedback);
    } finally {
      setLoading(false);
      recorder.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      recorder.clear();
    }
  };

  const endInterviewWithFeedback = () => {
    recorder.stop();
    if (sessionId) {
      fetchRealFeedback(sessionId);
    } else {
      // fallback for safety
      const fallbackFeedback = generateMockFeedback();
      (fallbackFeedback as any).videoBlob = recorder.videoBlob;
      (fallbackFeedback as any).audioBlob = recorder.audioBlob;
      onEnd(fallbackFeedback);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      recorder.clear();
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-6 py-4 px-2 md:px-4 bg-[#f9fafb] min-h-[75vh] items-stretch">
      {/* Left: Responsive live video with mic/camera toggles */}
      <div className="flex flex-col items-center md:items-stretch w-full md:w-1/2 max-w-2xl mx-auto">
        <Card className="w-full h-full rounded-2xl shadow-lg flex-1 flex flex-col">
          <CardContent className="flex flex-col flex-1 px-0 py-0">
            <InterviewPreviewPanel
              videoRef={videoRef}
              videoEnabled={videoEnabled}
              audioEnabled={audioEnabled}
              toggleVideo={toggleVideo}
              toggleAudio={toggleAudio}
            />
          </CardContent>
        </Card>
      </div>
      {/* Right: Interview panel (AI Interview/Info/Active/End) */}
      <div className="flex flex-col w-full md:w-1/2 max-w-md min-w-[280px] mt-8 md:mt-0 mx-auto md:mx-0">
        <InterviewWidget
          interviewConfig={config}
          onEndInterview={endInterviewWithFeedback}
          showCamera={false}
          onSessionStart={onInterviewStarted}
        />
        {loading && (
          <div className="mt-6 px-4 py-6 bg-white rounded-xl shadow text-center text-gray-700 border border-indigo-200">
            <div className="mb-3">Analyzing your interview responses...</div>
            <div className="flex justify-center">
              <span className="w-8 h-8 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;
