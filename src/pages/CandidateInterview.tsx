
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Play, Pause, Square, Mic, MicOff, Video, VideoOff, Clock } from "lucide-react";
import InterviewSession from "@/components/InterviewSession";

interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: string[];
}

interface InterviewState {
  currentQuestion: number;
  timeRemaining: number;
  isRecording: boolean;
  responses: string[];
  audioEnabled: boolean;
  videoEnabled: boolean;
}

interface FeedbackResult {
  [key: string]: any;
}

export default function CandidateInterview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = searchParams.get("token");
  const assessmentId = searchParams.get("assessment");
  const inviteId = searchParams.get("invite");
  const candidateId = searchParams.get("candidate");
  const recruiterId = searchParams.get("r");

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [useStructuredAssessment, setUseStructuredAssessment] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [interviewResult, setInterviewResult] = useState<FeedbackResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestion: 0,
    timeRemaining: 300, // 5 minutes per question
    isRecording: false,
    responses: [],
    audioEnabled: true,
    videoEnabled: true
  });

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (token) {
      fetchAssessmentByToken();
    } else if (assessmentId) {
      fetchAssessment();
    } else if (candidateId && recruiterId) {
      // Legacy support for old interview links
      setUseStructuredAssessment(false);
      setLoading(false);
    }
  }, [token, assessmentId, candidateId, recruiterId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (interviewStarted && useStructuredAssessment && interviewState.timeRemaining > 0) {
      timer = setInterval(() => {
        setInterviewState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (useStructuredAssessment && interviewState.timeRemaining === 0) {
      nextQuestion();
    }
    return () => clearInterval(timer);
  }, [interviewStarted, useStructuredAssessment, interviewState.timeRemaining]);

  const fetchAssessmentByToken = async () => {
    if (!token) return;
    
    try {
      console.log("Fetching assessment with token:", token);
      
      // First get the invite by token
      const { data: inviteData, error: inviteError } = await supabase
        .from("assessment_invites")
        .select(`
          id,
          assessment_id,
          candidate_email,
          status,
          assessments (
            id,
            title,
            description,
            questions
          )
        `)
        .eq("token", token)
        .single();

      if (inviteError) {
        console.error("Invite error:", inviteError);
        throw inviteError;
      }
      
      if (!inviteData || !inviteData.assessments) {
        console.error("No assessment data found for token");
        throw new Error("Assessment not found for this token");
      }

      console.log("Found assessment data:", inviteData);
      setInvite(inviteData);
      
      // Transform the assessment data to include questions as an array
      const questions = inviteData.assessments.questions;
      let questionArray: string[] = [];
      
      if (Array.isArray(questions)) {
        questionArray = questions.filter((q): q is string => typeof q === 'string');
      } else if (typeof questions === 'object' && questions !== null) {
        // Handle case where questions might be stored as an object
        questionArray = Object.values(questions).filter((q): q is string => typeof q === 'string');
      } else if (typeof questions === 'string') {
        // Handle case where it might be a JSON string
        try {
          const parsed = JSON.parse(questions);
          questionArray = Array.isArray(parsed) ? parsed : [questions];
        } catch {
          questionArray = [questions];
        }
      }
      
      const transformedAssessment: Assessment = {
        id: inviteData.assessments.id,
        title: inviteData.assessments.title,
        description: inviteData.assessments.description || "",
        questions: questionArray
      };
      
      console.log("Transformed assessment:", transformedAssessment);
      
      setAssessment(transformedAssessment);
      setUseStructuredAssessment(true);
      
      // Initialize responses array
      setInterviewState(prev => ({
        ...prev,
        responses: new Array(transformedAssessment.questions.length).fill("")
      }));
    } catch (error: any) {
      console.error("Error fetching assessment by token:", error);
      toast({
        variant: "destructive",
        title: "Assessment Not Found",
        description: "The assessment link is invalid or has expired. Please contact the recruiter for a new link.",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessment = async () => {
    if (!assessmentId) return;
    
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (error) throw error;
      
      // Transform the data to match our Assessment interface
      const transformedAssessment: Assessment = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        questions: Array.isArray(data.questions) ? data.questions as string[] : []
      };
      
      setAssessment(transformedAssessment);
      setUseStructuredAssessment(true);
      
      // Initialize responses array
      setInterviewState(prev => ({
        ...prev,
        responses: new Array(transformedAssessment.questions.length).fill("")
      }));
    } catch (error: any) {
      console.error("Error fetching assessment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assessment",
      });
      // Fallback to legacy interview mode
      setUseStructuredAssessment(false);
    } finally {
      setLoading(false);
    }
  };

  const startStructuredInterview = async () => {
    try {
      // Request camera and microphone permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: interviewState.videoEnabled,
        audio: interviewState.audioEnabled
      });
      
      setStream(mediaStream);
      
      // Set up MediaRecorder
      const recorder = new MediaRecorder(mediaStream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Here you would upload the recording to storage
        console.log("Recording stopped, blob size:", blob.size);
      };
      
      setMediaRecorder(recorder);
      setInterviewStarted(true);
      
      toast({
        title: "Interview Started",
        description: "Good luck with your assessment!",
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access camera/microphone. Please check permissions.",
      });
    }
  };

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      mediaRecorder.start();
      setInterviewState(prev => ({ ...prev, isRecording: true }));
      toast({
        title: "Recording Started",
        description: "Answer the current question",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setInterviewState(prev => ({ ...prev, isRecording: false }));
      toast({
        title: "Recording Stopped",
        description: "Response recorded for current question",
      });
    }
  };

  const nextQuestion = () => {
    if (!assessment) return;
    
    if (interviewState.currentQuestion < assessment.questions.length - 1) {
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        timeRemaining: 300,
        isRecording: false
      }));
    } else {
      finishStructuredInterview();
    }
  };

  const finishStructuredInterview = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Save interview results
    try {
      const currentInviteId = invite?.id || inviteId;
      if (currentInviteId) {
        // Update the invite status and link to candidate if they're logged in
        await supabase
          .from("assessment_invites")
          .update({ 
            status: "completed",
            completed_at: new Date().toISOString(),
            candidate_id: user?.id || null
          })
          .eq("id", currentInviteId);

        // Save submission
        const { error } = await supabase
          .from("assessment_submissions")
          .insert({
            invite_id: currentInviteId,
            candidate_id: user?.id || null,
            responses: interviewState.responses,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Interview Completed",
        description: "Thank you for completing the assessment!",
      });
      
      setSessionComplete(true);
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save interview results",
      });
    }
  };

  const toggleAudio = () => {
    setInterviewState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !interviewState.audioEnabled;
      });
    }
  };

  const toggleVideo = () => {
    setInterviewState(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !interviewState.videoEnabled;
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle interview end for assessment-based interviews
  const handleInterviewEnd = async (feedback: FeedbackResult) => {
    setSaving(true);
    setInterviewResult(feedback);

    try {
      let audioUrl = null;
      let videoUrl = null;

      // Upload media files if they exist
      if ((feedback as any).audioBlob || (feedback as any).videoBlob) {
        const formData = new FormData();
        
        if ((feedback as any).audioBlob) {
          formData.append('audio', (feedback as any).audioBlob, 'interview-audio.webm');
        }
        if ((feedback as any).videoBlob) {
          formData.append('video', (feedback as any).videoBlob, 'interview-video.webm');
        }
        
        if (token && invite) {
          formData.append('inviteId', invite.id);
          formData.append('candidateId', user?.id || 'anonymous');
        } else {
          formData.append('inviteId', 'legacy');
          formData.append('candidateId', candidateId || user?.id || 'anonymous');
        }

        try {
          const uploadResponse = await fetch('/supabase/functions/v1/save-interview-media', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const { audioUrl: uploadedAudio, videoUrl: uploadedVideo } = await uploadResponse.json();
            audioUrl = uploadedAudio;
            videoUrl = uploadedVideo;
            console.log('Media uploaded successfully:', { audioUrl, videoUrl });
          }
        } catch (uploadError) {
          console.error('Error uploading media:', uploadError);
        }
      }

      // If we have an assessment invite (token-based interview)
      if (token && invite) {
      // Create assessment submission with comprehensive interview data
        const submissionData = {
          invite_id: invite.id,
          candidate_id: user?.id || null,
          responses: Array.isArray(feedback.transcripts) ? feedback.transcripts : [feedback.transcript || ""],
          feedback: feedback?.feedback || JSON.stringify(feedback),
          audio_url: audioUrl,
          video_url: videoUrl,
          transcript: Array.isArray(feedback.transcripts) ? feedback.transcripts : [feedback.transcript || ""],
          ai_analysis: {
            voice_confidence: feedback.confidence_score || 0,
            clarity_score: feedback.clarity || 0,
            communication_score: feedback.interview_overall_score || 0,
            facial_analysis: feedback.facial_analysis || {},
            suggestions: feedback.suggestions || []
          },
          session_duration: feedback.duration || 0
        };

        const { error: submissionError } = await supabase
          .from("assessment_submissions")
          .insert(submissionData);

        if (submissionError) {
          throw new Error(submissionError.message);
        }

        // Update invite to mark as completed and link candidate
        const { error: updateError } = await supabase
          .from("assessment_invites")
          .update({ 
            status: "completed",
            completed_at: new Date().toISOString(),
            candidate_id: user?.id || null
          })
          .eq("id", invite.id);

        if (updateError) {
          console.error("Error updating invite:", updateError);
        }

        setSessionComplete(true);
        setSaveError(null);
        return;
      }

      // Legacy interview handler (for non-assessment interviews)
      let inviteId: string | null = null;
      let { data: invites } = await supabase
        .from("interview_invites")
        .select("id")
        .eq("recruiter_id", recruiterId)
        .eq("user_id", candidateId)
        .limit(1);

      if (invites && invites.length > 0) {
        inviteId = invites[0].id;
      } else {
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
            video_url: videoUrl || feedback.videoURL || feedback.video_url || null,
            audio_url: audioUrl || feedback.audioURL || feedback.audio_url || null,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Structured Assessment Interview Flow
  if (useStructuredAssessment && assessment) {
    if (!interviewStarted) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Welcome to Your Interview Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
                <p className="text-gray-600">{assessment.description}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Assessment Details:</h4>
                <ul className="text-sm space-y-1">
                  <li>• {assessment.questions.length} questions total</li>
                  <li>• 5 minutes per question</li>
                  <li>• Video and audio will be recorded</li>
                  <li>• You can re-record your answers</li>
                </ul>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant={interviewState.audioEnabled ? "default" : "outline"}
                  onClick={toggleAudio}
                >
                  {interviewState.audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant={interviewState.videoEnabled ? "default" : "outline"}
                  onClick={toggleVideo}
                >
                  {interviewState.videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
              </div>

              <div className="text-center">
                <Button onClick={startStructuredInterview} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">{assessment.title}</h1>
                  <p className="text-sm text-gray-600">
                    Question {interviewState.currentQuestion + 1} of {assessment.questions.length}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(interviewState.timeRemaining)}
                  </Badge>
                  <Progress 
                    value={(interviewState.currentQuestion / assessment.questions.length) * 100} 
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                {stream ? (
                  <video
                    autoPlay
                    muted
                    ref={(video) => {
                      if (video && stream) {
                        video.srcObject = stream;
                      }
                    }}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-white">Camera feed will appear here</div>
                )}
              </div>
              <div className="flex justify-center space-x-2">
                <Button variant="outline" onClick={toggleAudio}>
                  {interviewState.audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="outline" onClick={toggleVideo}>
                  {interviewState.videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle>Question {interviewState.currentQuestion + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">{assessment.questions[interviewState.currentQuestion]}</p>
              
              <div className="flex justify-center space-x-4">
                {!interviewState.isRecording ? (
                  <Button onClick={startRecording} className="px-8">
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording Answer
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" className="px-8">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                {interviewState.currentQuestion < assessment.questions.length - 1 ? (
                  <Button onClick={nextQuestion} variant="outline">
                    Next Question
                  </Button>
                ) : (
                  <Button onClick={finishStructuredInterview} variant="outline">
                    Finish Interview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
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
            customQuestions: assessment?.questions
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

