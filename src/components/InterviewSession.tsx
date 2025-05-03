
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InterviewConfig } from "@/components/InterviewSetup";
import { MicOff, Mic, Download, Video, VideoOff } from "lucide-react";

interface InterviewSessionProps {
  config: InterviewConfig;
  onEnd: (feedbackData: any) => void;
}

interface Question {
  id: number;
  text: string;
  tips: string[];
}

// Speech recognition interface
interface SpeechRecognitionData {
  transcript: string;
  isListening: boolean;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onEnd }) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [userMetrics, setUserMetrics] = useState({
    speakingPace: 0,
    eyeContact: 0,
    fillerWords: 0,
    engagement: 0
  });
  
  // Speech recognition state
  const [speechData, setSpeechData] = useState<SpeechRecognitionData>({
    transcript: "",
    isListening: false
  });
  
  // Track user participation
  const [hasParticipated, setHasParticipated] = useState(false);
  const [responseQuality, setResponseQuality] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [videoRecorded, setVideoRecorded] = useState<boolean>(false);
  const [audioRecorded, setAudioRecorded] = useState<boolean>(false);
  const [facialAnalysis, setFacialAnalysis] = useState({
    smile: 0,
    neutrality: 0,
    confidence: 0,
    engagement: 0
  });
  const [voiceAnalysis, setVoiceAnalysis] = useState({
    clarity: 0,
    pace: 0,
    pitch: 0,
    tone: 0,
    confidence: 0
  });
  
  // Canvas for facial analysis
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceAnalysisInterval = useRef<number | null>(null);
  
  // Mock interview questions based on type and job role
  const getQuestionsByType = () => {
    const baseQuestions: Record<string, Question[]> = {
      behavioral: [
        { id: 1, text: "Tell me about yourself.", tips: ["Keep your answer concise (1-2 minutes)", "Focus on professional background", "Highlight key achievements"] },
        { id: 2, text: "Describe a challenging situation at work and how you handled it.", tips: ["Use the STAR method", "Focus on your specific actions", "Emphasize the positive outcome"] },
        { id: 3, text: "What is your greatest professional achievement?", tips: ["Quantify your impact if possible", "Explain why it matters", "Show humility while highlighting skills"] },
        { id: 4, text: "How do you handle stress and pressure?", tips: ["Provide specific examples", "Show self-awareness", "Highlight healthy coping strategies"] },
        { id: 5, text: "Tell me about a time you demonstrated leadership skills.", tips: ["Doesn't need to be a management role", "Focus on influence and initiative", "Explain your approach to leading others"] }
      ],
      technical: [
        { id: 1, text: `Based on your ${config.jobRole} role, explain how you would approach solving a complex technical problem.`, tips: ["Outline your methodology", "Mention tools you'd use", "Explain how you'd validate the solution"] },
        { id: 2, text: "Describe your experience with relevant technologies in your field.", tips: ["Be specific about technologies", "Highlight depth of knowledge", "Mention learning approaches"] },
        { id: 3, text: "How do you stay updated with the latest industry trends?", tips: ["Mention specific sources", "Describe learning habits", "Show passion for growth"] },
        { id: 4, text: "Tell me about a project where you implemented a complex technical solution.", tips: ["Describe the challenge clearly", "Explain your approach", "Highlight the outcome"] },
        { id: 5, text: "How do you ensure quality in your technical work?", tips: ["Mention testing strategies", "Talk about review processes", "Discuss quality metrics"] }
      ],
      roleSpecific: [
        { id: 1, text: `Why are you interested in this specific ${config.jobRole} role?`, tips: ["Show genuine interest", "Connect to your background", "Demonstrate knowledge of the role"] },
        { id: 2, text: `How does your previous experience prepare you for this ${config.jobRole} position?`, tips: ["Highlight transferable skills", "Use relevant examples", "Connect past achievements to future contributions"] },
        { id: 3, text: `What unique skills would you bring to this ${config.jobRole} role?`, tips: ["Focus on differentiators", "Provide evidence", "Align with job requirements"] },
        { id: 4, text: "How would you handle a challenging stakeholder in this position?", tips: ["Demonstrate communication skills", "Show empathy", "Outline conflict resolution approach"] },
        { id: 5, text: `Where do you see yourself in 5 years in this ${config.jobRole} career path?`, tips: ["Show ambition while being realistic", "Demonstrate commitment", "Align with industry trends"] }
      ]
    };

    // Add difficulty adjustments
    const questions = baseQuestions[config.type] || baseQuestions.behavioral;
    
    // Apply difficulty modifications to questions if needed
    if (config.difficultyLevel === "hard") {
      // Could make questions more challenging based on difficulty
      return questions.map(q => ({
        ...q,
        text: q.text.replace("Tell me", "Please elaborate in detail"),
      }));
    }
    
    return questions;
  };

  const questions = getQuestionsByType();
  
  // Setup media stream from parent component
  useEffect(() => {
    // Get the active media stream from webcam/mic already initialized
    const getActiveStream = async () => {
      try {
        // This will use the already granted permissions
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setMediaStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Start simulating facial analysis when stream is ready
        if (canvasRef.current && stream) {
          startSimulatedFacialAnalysis();
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Device error",
          description: "Could not access your camera or microphone.",
          variant: "destructive"
        });
      }
    };
    
    getActiveStream();
    
    return () => {
      // Cleanup on unmount
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioRecorder && audioRecorder.state !== 'inactive') {
        audioRecorder.stop();
      }
      if (faceAnalysisInterval.current) {
        clearInterval(faceAnalysisInterval.current);
      }
    };
  }, [toast]);
  
  // Simulate facial analysis (in a real implementation this would use computer vision APIs)
  const startSimulatedFacialAnalysis = () => {
    if (faceAnalysisInterval.current) {
      clearInterval(faceAnalysisInterval.current);
    }

    faceAnalysisInterval.current = window.setInterval(() => {
      if (isRecording) {
        setFacialAnalysis({
          smile: Math.min(100, Math.floor(60 + Math.sin(Date.now() * 0.001) * 20)),
          neutrality: Math.min(100, Math.floor(70 + Math.cos(Date.now() * 0.0008) * 15)),
          confidence: Math.min(100, Math.floor(65 + Math.sin(Date.now() * 0.0006) * 25)),
          engagement: Math.min(100, Math.floor(75 + Math.cos(Date.now() * 0.0009) * 15))
        });
      }
    }, 1000);
  };
  
  // Set up speech recognition
  const startSpeechRecognition = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return null;
    }
    
    // Use the type-safe way to access SpeechRecognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return null;
    }
    
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
          
          // Detect filler words
          const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
          const words = transcript.toLowerCase().split(' ');
          const fillerCount = words.filter(word => fillerWords.includes(word)).length;
          
          setUserMetrics(prev => ({
            ...prev,
            fillerWords: prev.fillerWords + fillerCount
          }));
          
          // If user speaks more than 20 characters, mark as participated
          if (transcript.length > 20 && !hasParticipated) {
            setHasParticipated(true);
            
            // Add current question to answered questions if not already there
            if (!answeredQuestions.includes(currentQuestionIndex)) {
              setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
            }
            
            // Estimate response quality based on length and lack of filler words
            const wordsSpoken = transcript.split(' ').length;
            const qualityScore = Math.min(100, Math.max(10, 
              Math.floor((wordsSpoken - fillerCount) * 5)
            ));
            setResponseQuality(prev => Math.max(prev, qualityScore));
          }
        }
      }
      
      setSpeechData(prev => ({
        ...prev,
        transcript: prev.transcript + transcript
      }));

      // Simulate voice analysis based on transcript content
      simulateVoiceAnalysis(transcript);
    };
    
    recognition.onend = () => {
      if (speechData.isListening) {
        recognition.start();
      }
    };
    
    recognition.start();
    setSpeechData(prev => ({ ...prev, isListening: true }));
    
    return recognition;
  };
  
  const simulateVoiceAnalysis = (transcript: string) => {
    // In a real implementation, this would use audio analysis APIs
    // Here we're simulating voice metrics based on actual participation
    if (transcript && transcript.length > 0) {
      // Base the analysis on actual speech content
      const wordCount = transcript.split(' ').length;
      const sentenceStructure = transcript.includes('.') || transcript.includes('?') || transcript.includes('!');
      const hasKeywords = transcript.toLowerCase().includes(config.jobRole.toLowerCase());
      
      // Calculate more realistic scores based on speech quality
      const clarityScore = Math.min(100, Math.max(30, 40 + (wordCount / 10)));
      const paceScore = Math.min(100, Math.max(30, 50 + (sentenceStructure ? 20 : 0)));
      const confidenceScore = Math.min(100, Math.max(30, 40 + (hasKeywords ? 30 : 0) + (wordCount / 15)));
      
      setVoiceAnalysis({
        clarity: Math.floor(clarityScore),
        pace: Math.floor(paceScore),
        pitch: Math.min(100, Math.floor(60 + Math.sin(transcript.length * 0.06) * 15)),
        tone: Math.min(100, Math.floor(50 + Math.cos(transcript.length * 0.04) * 10)),
        confidence: Math.floor(confidenceScore)
      });
    }
  };
  
  const stopSpeechRecognition = (recognition: any) => {
    if (recognition) {
      recognition.stop();
      setSpeechData(prev => ({ ...prev, isListening: false }));
    }
  };
  
  // Start recording with MediaRecorder
  const startRecording = () => {
    if (!mediaStream) {
      toast({
        title: "No media stream",
        description: "Camera and microphone access is required to record.",
        variant: "destructive"
      });
      return;
    }
    
    setRecordedChunks([]);
    setAudioChunks([]);
    setRecordedVideoURL(null);
    setAudioURL(null);
    setVideoRecorded(false);
    setAudioRecorded(false);
    
    // Video recording setup
    try {
      const videoOptions = { mimeType: 'video/webm; codecs=vp9,opus' };
      const mediaRecorder = new MediaRecorder(mediaStream, videoOptions);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create video blob and URL when recording stops
        if (recordedChunks.length) {
          const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);
          setRecordedVideoURL(videoUrl);
          setVideoRecorded(true);
          
          console.log("Video recording stopped, blob created:", videoBlob);
        }
      };
      
      mediaRecorder.start(1000); // Collect data in 1-second chunks
      mediaRecorderRef.current = mediaRecorder;
      
      // Audio recording setup for separate audio file
      const audioStream = new MediaStream(mediaStream.getAudioTracks());
      const audioOptions = { mimeType: 'audio/webm' };
      const audioMediaRecorder = new MediaRecorder(audioStream, audioOptions);
      
      audioMediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      audioMediaRecorder.onstop = () => {
        // Create audio blob and URL when recording stops
        if (audioChunks.length) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
          setAudioRecorded(true);
          
          console.log("Audio recording stopped, blob created:", audioBlob);
        }
      };
      
      audioMediaRecorder.start(1000);
      setAudioRecorder(audioMediaRecorder);
      
      // Start speech recognition
      const recognition = startSpeechRecognition();
      
      // Update state
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Your response is now being recorded.",
      });
      
    } catch (error) {
      console.error("Error setting up MediaRecorder:", error);
      toast({
        title: "Recording Error",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      audioRecorder.stop();
    }
    
    // Stop speech recognition
    setSpeechData(prev => ({ ...prev, isListening: false }));
    
    setIsRecording(false);
    
    toast({
      title: "Recording Complete",
      description: "Your response recording has been saved.",
    });
  };
  
  // Download recorded video
  const downloadVideo = () => {
    if (recordedChunks.length === 0) {
      toast({
        title: "No video available",
        description: "Record a response first before downloading.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${config.jobRole}-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Video Downloaded",
        description: "Your interview video has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: "Download Error",
        description: "Could not download the video.",
        variant: "destructive"
      });
    }
  };
  
  // Download recorded audio
  const downloadAudio = () => {
    if (audioChunks.length === 0) {
      toast({
        title: "No audio available",
        description: "Record a response first before downloading.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-audio-${config.jobRole}-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Audio Downloaded",
        description: "Your interview audio has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast({
        title: "Download Error",
        description: "Could not download the audio.",
        variant: "destructive"
      });
    }
  };
  
  // Mock analytics update
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        
        // Simulate realistic analysis updates based on participation
        // If user hasn't participated, scores should be low
        if (!hasParticipated) {
          setUserMetrics(prev => ({
            speakingPace: Math.min(40, Math.floor(30 + Math.sin(secondsElapsed * 0.1) * 10)),
            eyeContact: Math.min(50, Math.floor(40 + Math.cos(secondsElapsed * 0.05) * 10)),
            fillerWords: prev.fillerWords,
            engagement: Math.min(40, Math.floor(30 + Math.sin(secondsElapsed * 0.08) * 10))
          }));
        } else {
          // If user has participated, provide more realistic metrics
          setUserMetrics(prev => ({
            speakingPace: Math.min(100, Math.floor(60 + Math.sin(secondsElapsed * 0.1) * 15)),
            eyeContact: Math.min(100, Math.floor(65 + Math.cos(secondsElapsed * 0.05) * 15)),
            fillerWords: prev.fillerWords,
            engagement: Math.min(100, Math.floor(70 + Math.sin(secondsElapsed * 0.08) * 10))
          }));
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRecording, secondsElapsed, hasParticipated]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const nextQuestion = () => {
    // Save transcript for current question
    if (speechData.transcript.trim().length > 0) {
      // Mark as participated if there's substantial content
      if (speechData.transcript.trim().length > 20 && !answeredQuestions.includes(currentQuestionIndex)) {
        setHasParticipated(true);
        setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
      }
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSecondsElapsed(0);
      setSpeechData({ transcript: "", isListening: false });
    } else {
      endInterview();
    }
  };
  
  const endInterview = () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
    toast({
      title: "Interview Completed",
      description: "Generating your feedback report...",
    });
    
    // Save recorded video as a blob
    let recordedVideoBlob = null;
    if (recordedChunks.length > 0) {
      recordedVideoBlob = new Blob(recordedChunks, { type: 'video/webm' });
    }
    
    let recordedAudioBlob = null;
    if (audioChunks.length > 0) {
      recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    }
    
    // Calculate participation rate
    const participationRate = (answeredQuestions.length / questions.length) * 100;
    
    // Base scores on actual participation and response quality
    const participationFactor = hasParticipated ? Math.max(0.3, participationRate / 100) : 0.1;
    const speechFactor = hasParticipated ? Math.max(0.4, responseQuality / 100) : 0.2;
    const baseScore = hasParticipated ? 40 : 20;
    
    // Generate realistic feedback data with scores based on actual performance
    const mockFeedback = {
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      duration: `${Math.floor(secondsElapsed / 60)} minutes ${secondsElapsed % 60} seconds`,
      overallScore: Math.floor(baseScore + (participationFactor * 40) + (speechFactor * 20)),
      responsesAnalysis: {
        clarity: hasParticipated ? Math.floor(50 + (responseQuality / 2)) : 30,
        relevance: hasParticipated ? Math.floor(40 + (responseQuality / 2)) : 25,
        structure: hasParticipated ? Math.floor(45 + (responseQuality / 3)) : 20,
        examples: hasParticipated ? Math.floor(40 + (responseQuality / 4)) : 15
      },
      nonVerbalAnalysis: {
        eyeContact: userMetrics.eyeContact,
        facialExpressions: facialAnalysis.smile,
        bodyLanguage: facialAnalysis.engagement
      },
      voiceAnalysis: {
        pace: voiceAnalysis.pace,
        tone: voiceAnalysis.tone,
        clarity: voiceAnalysis.clarity,
        confidence: voiceAnalysis.confidence
      },
      facialAnalysis: {
        smile: hasParticipated ? facialAnalysis.smile : Math.floor(facialAnalysis.smile * 0.5),
        neutrality: facialAnalysis.neutrality,
        confidence: hasParticipated ? facialAnalysis.confidence : Math.floor(facialAnalysis.confidence * 0.6),
        engagement: hasParticipated ? facialAnalysis.engagement : Math.floor(facialAnalysis.engagement * 0.4)
      },
      strengths: hasParticipated ? [
        "Used concise language",
        "Appropriate tone for the setting",
        "Maintained consistent presence",
        responseQuality > 60 ? "Used good examples" : "Attempted to address the question"
      ] : [
        "Attended the interview",
        "Showed interest in the process",
        "Observed the questions"
      ],
      improvements: hasParticipated ? [
        userMetrics.eyeContact < 70 ? "Maintain more consistent eye contact" : "Continue with strong eye contact",
        userMetrics.fillerWords > 5 ? "Reduce filler words like 'um' and 'uh'" : "Good control of filler words",
        facialAnalysis.engagement < 70 ? "Show more engagement through facial expressions" : "Good facial engagement",
        voiceAnalysis.pace < 65 ? "Consider speaking at a slightly faster pace" : "Well-paced delivery"
      ] : [
        "Work on providing responses to interview questions",
        "Practice speaking more during interviews",
        "Try to engage more with the interviewer",
        "Work on interview confidence and participation"
      ],
      recommendations: hasParticipated ? [
        "Practice the STAR method for behavioral questions",
        "Record yourself to monitor eye contact patterns",
        "Try speaking more slowly during technical explanations",
        "Prepare 2-3 more examples for common questions"
      ] : [
        "Practice responding to interview questions aloud",
        "Work with a friend to conduct mock interviews",
        "Consider preparation techniques to build confidence",
        "Set up regular practice sessions to improve interview skills",
        "Review common interview questions for your field"
      ],
      transcripts: [
        {
          question: questions[currentQuestionIndex].text,
          answer: speechData.transcript || "No response provided"
        }
      ],
      videoBlob: recordedVideoBlob,
      audioBlob: recordedAudioBlob,
      videoURL: recordedVideoURL,
      audioURL: audioURL
    };
    
    onEnd(mockFeedback);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-black rounded-lg aspect-video relative overflow-hidden mb-4">
          {mediaStream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white">Camera not connected</div>
            </div>
          )}
          
          {/* Interview controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-center space-x-4">
              <Button 
                size="sm" 
                variant="outline" 
                className={`${isRecording ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/30'} text-white flex items-center`}
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" /> Start Recording
                  </>
                )}
              </Button>
              
              {videoRecorded && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/20 hover:bg-white/30 text-white flex items-center"
                  onClick={downloadVideo}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Video
                </Button>
              )}
              
              {audioRecorded && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/20 hover:bg-white/30 text-white flex items-center"
                  onClick={downloadAudio}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Audio
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 text-white"
                onClick={nextQuestion}
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "End Interview"}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-red-500/80 hover:bg-red-500 text-white"
                onClick={endInterview}
              >
                End Session
              </Button>
            </div>
          </div>
          
          {/* Hidden canvas for facial analysis */}
          <canvas 
            ref={canvasRef} 
            width="640" 
            height="480" 
            className="hidden"
          />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-xl">Current Question</h2>
                <p className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center">
                {isRecording && (
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                    <span className="text-sm text-gray-500">Recording</span>
                  </div>
                )}
                <div className="text-xl font-mono">{formatTime(secondsElapsed)}</div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
              <p className="text-lg font-medium">
                {questions[currentQuestionIndex].text}
              </p>
            </div>
            
            <div className="text-gray-600">
              <p className="mb-2 font-medium">Tips:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {questions[currentQuestionIndex].tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
            
            {speechData.transcript && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm font-medium mb-2">Your response (transcribed):</p>
                <p className="text-sm text-gray-700">{speechData.transcript}</p>
              </div>
            )}
            
            {recordedVideoURL && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Interview Recording:</p>
                <video 
                  controls 
                  src={recordedVideoURL} 
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-bold text-xl mb-4">Real-time Feedback</h2>
            
            <div className="space-y-6">
              {/* Speech metrics */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Speech Analysis</h3>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Speaking Pace</span>
                    <span className="text-xs font-medium">
                      {userMetrics.speakingPace > 80 ? "Good" : userMetrics.speakingPace > 60 ? "Average" : "Needs Improvement"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${userMetrics.speakingPace > 80 ? "bg-green-500" : userMetrics.speakingPace > 60 ? "bg-amber-500" : "bg-red-500"}`} 
                      style={{ width: `${userMetrics.speakingPace}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Filler Words</span>
                    <span className="text-xs font-medium">{userMetrics.fillerWords} detected</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${userMetrics.fillerWords < 3 ? "bg-green-500" : userMetrics.fillerWords < 6 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, userMetrics.fillerWords * 10)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Facial metrics */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Facial Expression Analysis</h3>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Eye Contact</span>
                    <span className="text-xs font-medium">
                      {userMetrics.eyeContact > 80 ? "Excellent" : userMetrics.eyeContact > 60 ? "Good" : "Needs Improvement"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${userMetrics.eyeContact > 80 ? "bg-green-500" : userMetrics.eyeContact > 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${userMetrics.eyeContact}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Engagement</span>
                    <span className="text-xs font-medium">
                      {facialAnalysis.engagement > 80 ? "Excellent" : facialAnalysis.engagement > 60 ? "Good" : "Average"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${facialAnalysis.engagement > 80 ? "bg-green-500" : facialAnalysis.engagement > 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${facialAnalysis.engagement}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Confidence Expression</span>
                    <span className="text-xs font-medium">
                      {facialAnalysis.confidence > 80 ? "Excellent" : facialAnalysis.confidence > 60 ? "Good" : "Average"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${facialAnalysis.confidence > 80 ? "bg-green-500" : facialAnalysis.confidence > 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${facialAnalysis.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Voice metrics */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Voice Analysis</h3>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Clarity</span>
                    <span className="text-xs font-medium">
                      {voiceAnalysis.clarity > 80 ? "Excellent" : voiceAnalysis.clarity > 60 ? "Good" : "Average"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${voiceAnalysis.clarity > 80 ? "bg-green-500" : voiceAnalysis.clarity > 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${voiceAnalysis.clarity}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Tone</span>
                    <span className="text-xs font-medium">
                      {voiceAnalysis.tone > 80 ? "Excellent" : voiceAnalysis.tone > 60 ? "Good" : "Average"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${voiceAnalysis.tone > 80 ? "bg-green-500" : voiceAnalysis.tone > 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${voiceAnalysis.tone}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Brief feedback tips */}
              {isRecording && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-700 mb-1">Live Coaching Tips</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {userMetrics.eyeContact < 70 && (
                      <li className="text-xs text-blue-700">Try to look more directly at the camera</li>
                    )}
                    {userMetrics.fillerWords > 3 && (
                      <li className="text-xs text-blue-700">Try to reduce filler words like "um" and "uh"</li>
                    )}
                    {userMetrics.speakingPace < 65 && (
                      <li className="text-xs text-blue-700">Try to speak at a slightly faster pace</li>
                    )}
                    {facialAnalysis.engagement < 70 && (
                      <li className="text-xs text-blue-700">Show more engagement through facial expressions</li>
                    )}
                    {voiceAnalysis.tone < 70 && (
                      <li className="text-xs text-blue-700">Try to vary your tone more for emphasis</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSession;
