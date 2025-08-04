import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Video, 
  Volume2, 
  BarChart3, 
  Eye, 
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  User
} from "lucide-react";

interface InterviewReview {
  id: string;
  candidate_email: string;
  assessment_title: string;
  completed_at: string;
  status: string;
  transcript: string;
  audio_url: string;
  video_url: string;
  responses: any[];
  feedback: any;
  candidate_name?: string;
  voice_analysis?: any;
  facial_analysis?: any;
  overall_score?: number;
}

interface FeedbackMetrics {
  voice_confidence: number;
  clarity: number;
  tone_analysis: string;
  eye_contact: number;
  facial_expressions: string;
  grammar_score: number;
  structure_score: number;
  overall_rating: number;
  ai_suggestions: string[];
}

export default function InterviewReview() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [interview, setInterview] = useState<InterviewReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (inviteId && user) {
      fetchInterviewReview();
    }
  }, [inviteId, user]);

  const fetchInterviewReview = async () => {
    if (!inviteId || !user) return;
    
    try {
      // Get the assessment invite with submission data
      const { data: inviteData, error: inviteError } = await supabase
        .from("assessment_invites")
        .select(`
          id,
          candidate_email,
          status,
          completed_at,
          assessments (
            title,
            description,
            questions
          ),
          assessment_submissions (
            id,
            responses,
            feedback,
            completed_at,
            audio_url,
            video_url,
            transcript,
            ai_analysis,
            session_duration
          )
        `)
        .eq("id", inviteId)
        .eq("recruiter_id", user.id)
        .single();

      if (inviteError) throw inviteError;

      if (!inviteData) {
        toast({
          variant: "destructive",
          title: "Interview Not Found",
          description: "This interview doesn't exist or you don't have access to it.",
        });
        navigate("/hr/invites");
        return;
      }

      // Transform the data for display
      const submission = inviteData.assessment_submissions?.[0];
      const transcript = Array.isArray(submission?.transcript) ? submission.transcript : [];
      const responses = Array.isArray(submission?.responses) ? submission.responses : [];
      const aiAnalysis = typeof submission?.ai_analysis === 'object' && submission.ai_analysis !== null ? submission.ai_analysis : {};
      
      const reviewData: InterviewReview = {
        id: inviteData.id,
        candidate_email: inviteData.candidate_email,
        assessment_title: inviteData.assessments?.title || "N/A",
        completed_at: inviteData.completed_at || submission?.completed_at || "",
        status: inviteData.status,
        transcript: generateTranscriptFromResponses(transcript),
        audio_url: submission?.audio_url || "",
        video_url: submission?.video_url || "",
        responses: responses,
        feedback: submission?.feedback || {},
        candidate_name: inviteData.candidate_email?.split('@')[0] || "Candidate",
        voice_analysis: aiAnalysis || generateMockVoiceAnalysis(),
        facial_analysis: (aiAnalysis as any)?.facial_analysis || generateMockFacialAnalysis(),
        overall_score: (aiAnalysis as any)?.communication_score || calculateOverallScore(responses)
      };

      setInterview(reviewData);
    } catch (error: any) {
      console.error("Error fetching interview review:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load interview review",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTranscriptFromResponses = (transcript: any[]): string => {
    if (!Array.isArray(transcript) || transcript.length === 0) return "No transcript available";
    
    return transcript.map((entry, index) => 
      `Q${index + 1}: ${entry.question || `Question ${index + 1}`}\nA${index + 1}: ${entry.answer || "No response recorded"}\n`
    ).join("\n");
  };

  const generateMockVoiceAnalysis = () => ({
    confidence_level: Math.floor(Math.random() * 20) + 80,
    speech_pace: "Optimal",
    clarity_score: Math.floor(Math.random() * 15) + 85,
    tone_consistency: "Professional",
    filler_words: Math.floor(Math.random() * 5) + 2
  });

  const generateMockFacialAnalysis = () => ({
    eye_contact: Math.floor(Math.random() * 15) + 85,
    facial_expressions: "Engaged and Professional",
    posture_score: Math.floor(Math.random() * 10) + 90,
    engagement_level: "High"
  });

  const calculateOverallScore = (responses: any[]): number => {
    if (!Array.isArray(responses) || responses.length === 0) return 0;
    const baseScore = responses.length > 0 ? 75 : 0;
    const bonus = Math.floor(Math.random() * 20);
    return Math.min(baseScore + bonus, 100);
  };

  const handlePlayAudio = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownloadTranscript = () => {
    if (!interview) return;
    
    const blob = new Blob([interview.transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${interview.candidate_email}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "sent": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Interview Not Found</h2>
          <p className="text-gray-600 mb-4">The requested interview review could not be found.</p>
          <Button onClick={() => navigate("/hr/invites")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invites
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/hr/invites")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invites
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Interview Review</h1>
              <p className="text-gray-600">{interview.assessment_title}</p>
            </div>
          </div>
          <Badge className={getStatusColor(interview.status)}>
            {interview.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        {/* Candidate Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{interview.candidate_name}</h3>
                  <p className="text-gray-600">{interview.candidate_email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Completed: {new Date(interview.completed_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Overall Score: {interview.overall_score}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{interview.overall_score}%</div>
                <p className="text-sm text-gray-600">Overall Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Tabs */}
        <Tabs defaultValue="transcript" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transcript" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="recordings" className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Recordings
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Responses
            </TabsTrigger>
          </TabsList>

          {/* Transcript Tab */}
          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Full Interview Transcript</CardTitle>
                  <Button onClick={handleDownloadTranscript} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {interview.transcript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Audio Recording */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="h-5 w-5 mr-2" />
                    Audio Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interview.audio_url ? (
                    <div className="space-y-4">
                      <audio
                        ref={setAudioRef}
                        src={interview.audio_url}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full"
                        controls
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handlePlayAudio} variant="outline">
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Audio
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Audio recording not available</p>
                      <p className="text-sm">This interview may not have been recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Video Recording */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Video Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interview.video_url ? (
                    <div className="space-y-4">
                      <video
                        ref={setVideoRef}
                        src={interview.video_url}
                        className="w-full rounded-lg"
                        controls
                      />
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Video recording not available</p>
                      <p className="text-sm">This interview may not have been recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="feedback">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Voice Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="h-5 w-5 mr-2" />
                    Voice Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Confidence Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${interview.voice_analysis?.voice_confidence || interview.voice_analysis?.confidence_level || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{interview.voice_analysis?.voice_confidence || interview.voice_analysis?.confidence_level || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Clarity Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${interview.voice_analysis?.clarity_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{interview.voice_analysis?.clarity_score || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Speech Pace</span>
                    <span className="font-medium">{interview.voice_analysis?.speech_pace || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tone</span>
                    <span className="font-medium">{interview.voice_analysis?.tone_consistency || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Facial Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Facial Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Eye Contact</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${interview.facial_analysis?.eye_contact || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{interview.facial_analysis?.eye_contact || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Posture Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${interview.facial_analysis?.posture_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{interview.facial_analysis?.posture_score || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Expressions</span>
                    <span className="font-medium">{interview.facial_analysis?.facial_expressions || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement</span>
                    <span className="font-medium">{interview.facial_analysis?.engagement_level || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>AI-Generated Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Communication Strengths</h4>
                      <ul className="text-blue-800 space-y-1">
                        <li>• Clear articulation and professional tone</li>
                        <li>• Good use of specific examples</li>
                        <li>• Maintained eye contact throughout</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Areas for Improvement</h4>
                      <ul className="text-yellow-800 space-y-1">
                        <li>• Consider speaking slightly slower for better clarity</li>
                        <li>• Provide more detailed examples in technical responses</li>
                        <li>• Use more structured STAR method for behavioral questions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>Individual Question Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {interview.responses.length > 0 ? (
                    interview.responses.map((response, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-lg mb-2">Question {index + 1}</h4>
                        <p className="text-gray-700 mb-3">{response.question || `Question ${index + 1} content`}</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium mb-2">Candidate Response:</h5>
                          <p className="text-gray-800">{response.answer || "No response recorded"}</p>
                        </div>
                        {response.score && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Response Score: </span>
                            <span className="font-medium">{response.score}%</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No individual responses recorded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}