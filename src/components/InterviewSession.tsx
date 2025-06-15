import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Video, VideoOff, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import InterviewWidget from "./InterviewWidget";
import "../components/InterviewWidget.css";

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
      })
      .catch(() => {});
    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
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

  // Helper to generate mock feedback for demo purposes
  const generateMockFeedback = () => {
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
      duration: `${config.duration} min`,

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

  // Handler for ending the interview (user or AI)
  const handleEndInterview = () => {
    // GENERATE FEEDBACK ANALYSIS AND SEND TO onEnd
    const feedback = generateMockFeedback();
    onEnd(feedback); // This will trigger navigation to feedback report in parent
    // Stop local stream to release camera/mic
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-6 py-4 px-2 md:px-4 bg-[#f9fafb] min-h-[75vh] items-stretch">
      {/* Left: Responsive live video with mic/camera toggles */}
      <div className="flex flex-col items-center md:items-stretch w-full md:w-1/2 max-w-2xl mx-auto">
        <Card className="w-full h-full rounded-2xl shadow-lg flex-1 flex flex-col">
          <CardContent className="flex flex-col flex-1 px-0 py-0">
            <div className="relative flex flex-col items-center w-full h-full">
              <div className="w-full aspect-video bg-gray-200 rounded-t-2xl overflow-hidden shadow flex items-center justify-center transition-all">
                <video
                  ref={videoRef}
                  autoPlay
                  muted={true} // Always keep video muted to avoid echo!
                  playsInline
                  className={`w-full h-full object-cover rounded-t-2xl transition-opacity ${
                    videoEnabled ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    minHeight: 180,
                    background: "#222",
                  }}
                />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-t-2xl">
                    <VideoOff size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4 py-4 w-full">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleAudio}
                  className="w-12 h-12"
                  aria-label={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {audioEnabled ? <Mic /> : <MicOff />}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleVideo}
                  className="w-12 h-12"
                  aria-label={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {videoEnabled ? <Video /> : <VideoOff />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Right: Interview panel (AI Interview/Info/Active/End) */}
      <div className="flex flex-col w-full md:w-1/2 max-w-md min-w-[280px] mt-8 md:mt-0 mx-auto md:mx-0">
        <InterviewWidget
          interviewConfig={config}
          onEndInterview={handleEndInterview}
          showCamera={false}
        />
      </div>
    </div>
  );
};

export default InterviewSession;
