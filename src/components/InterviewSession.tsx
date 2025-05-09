
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Camera, CameraOff, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useTextToSpeech, ELEVEN_LABS_VOICES } from "@/utils/textToSpeech";
import { useElevenLabs } from "@/contexts/ElevenLabsContext";

interface InterviewSessionProps {
  config: {
    type: string;
    jobRole: string;
    duration: number;
    difficulty: string;
  };
  onEnd: (feedbackData: any) => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onEnd }) => {
  const { toast } = useToast();
  const { requestMediaPermissions, stopMediaStream, stream, cameraReady, microphoneReady } = useMediaDevices();
  const { apiKey, currentVoice } = useElevenLabs();
  const { speak, stopSpeaking, isSpeaking } = useTextToSpeech();
  
  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxTime] = useState(config.duration * 60); // Convert minutes to seconds
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userResponse, setUserResponse] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [audioAnalysis, setAudioAnalysis] = useState<any>({});
  const [facialAnalysis, setFacialAnalysis] = useState<any>({});
  const [bodyLanguageAnalysis, setBodyLanguageAnalysis] = useState<any>({});
  const [listeningToUser, setListeningToUser] = useState(false);
  const [questionList, setQuestionList] = useState<string[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<string>("");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  
  // Mock questions based on job type
  const generateQuestionsFromResume = (resumeText: string, jobRole: string) => {
    // In a real app, this would use AI to analyze the resume
    // For now, we'll use some mock questions based on job role
    const baseQuestions = [
      `Tell me about your experience with ${jobRole}.`,
      "What are your greatest strengths?",
      "Can you describe a challenging project you worked on?",
      "How do you handle tight deadlines?",
      "Where do you see yourself in five years?",
      "Why are you interested in this position?",
      "How do you stay updated with industry trends?",
      "Tell me about a time you failed and what you learned."
    ];
    
    // Add some resume-specific questions
    const specificQuestions = [];
    
    if (resumeText.toLowerCase().includes("leadership")) {
      specificQuestions.push("I see you have leadership experience. Can you describe your leadership style?");
    }
    
    if (resumeText.toLowerCase().includes("project")) {
      specificQuestions.push("Tell me more about one of the key projects mentioned in your resume.");
    }
    
    if (resumeText.toLowerCase().includes("communication")) {
      specificQuestions.push("How do you ensure effective communication in a team setting?");
    }
    
    return [...specificQuestions, ...baseQuestions];
  };
  
  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      
      speechRecognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setUserResponse(transcript);
        
        // Real-time analysis of response
        if (transcript.length > 20 && !isAnalyzing) {
          performRealTimeAnalysis(transcript);
        }
      };
      
      speechRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Try again or check your microphone.`,
          variant: "destructive",
        });
      };
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
    }
  };
  
  // Process resume text
  const processResume = async (file: File) => {
    try {
      const text = await file.text();
      setResumeText(text);
      // Generate questions based on resume
      const questions = generateQuestionsFromResume(text, config.jobRole);
      setQuestionList(questions);
      return text;
    } catch (error) {
      console.error("Error processing resume:", error);
      toast({
        title: "Resume Processing Error",
        description: "Could not process the resume.",
        variant: "destructive",
      });
      return "";
    }
  };
  
  // Perform real-time analysis of user's speech and video
  const performRealTimeAnalysis = (transcript: string) => {
    setIsAnalyzing(true);
    
    // In a real app, this would call an AI service
    // Here we'll generate mock analysis
    
    // Audio analysis
    const mockAudioAnalysis = {
      clarity: Math.floor(Math.random() * 30) + 70, // 70-100
      pace: Math.floor(Math.random() * 40) + 60,    // 60-100
      tone: Math.floor(Math.random() * 25) + 75,    // 75-100
      confidence: Math.floor(Math.random() * 35) + 65 // 65-100
    };
    
    // Facial analysis
    const mockFacialAnalysis = {
      smile: Math.floor(Math.random() * 40) + 60,     // 60-100
      eyeContact: Math.floor(Math.random() * 30) + 70, // 70-100
      neutrality: Math.floor(Math.random() * 25) + 75, // 75-100
      engagement: Math.floor(Math.random() * 35) + 65  // 65-100
    };
    
    // Body language analysis
    const mockBodyLanguageAnalysis = {
      posture: Math.floor(Math.random() * 30) + 70,   // 70-100
      gestures: Math.floor(Math.random() * 35) + 65,  // 65-100
      movement: Math.floor(Math.random() * 25) + 75,  // 75-100
      presence: Math.floor(Math.random() * 40) + 60   // 60-100
    };
    
    // Update state with analysis results
    setAudioAnalysis(mockAudioAnalysis);
    setFacialAnalysis(mockFacialAnalysis);
    setBodyLanguageAnalysis(mockBodyLanguageAnalysis);
    
    // Generate feedback based on analysis
    let feedback = "";
    
    if (mockAudioAnalysis.pace < 70) {
      feedback += "Try speaking a bit slower to improve clarity. ";
    }
    
    if (mockFacialAnalysis.eyeContact < 75) {
      feedback += "Maintain more eye contact with the camera. ";
    }
    
    if (mockBodyLanguageAnalysis.posture < 75) {
      feedback += "Improve your posture to appear more confident. ";
    }
    
    if (feedback === "") {
      feedback = "You're doing well! Keep it up.";
    }
    
    setCurrentFeedback(feedback);
    setIsAnalyzing(false);
  };
  
  // Start the interview
  const startInterview = async () => {
    try {
      await requestMediaPermissions();
      
      if (!stream) {
        throw new Error("Failed to get media stream");
      }
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize speech recognition
      initializeSpeechRecognition();
      
      // Start recording
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setRecordedChunks(chunks);
        
        if (recordedVideoRef.current) {
          recordedVideoRef.current.src = url;
        }
      };
      
      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxTime) {
            if (timerRef.current) clearInterval(timerRef.current);
            mediaRecorder.stop();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      mediaRecorder.start();
      setIsRecording(true);
      setInterviewStarted(true);
      
      // Start with first question using text-to-speech
      if (questionList.length > 0) {
        await askQuestion(0);
      }
      
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Error Starting Interview",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  // Ask a question using text-to-speech
  const askQuestion = async (index: number) => {
    if (index < questionList.length) {
      setCurrentQuestion(index);
      
      // Only use text-to-speech if we have API key
      if (apiKey) {
        try {
          await speak(questionList[index], currentVoice, apiKey);
          // After speaking, start listening
          setTimeout(() => {
            startListeningToUser();
          }, 1000);
        } catch (error) {
          console.error("Error with text-to-speech:", error);
          toast({
            title: "Text-to-Speech Error",
            description: "Failed to speak the question.",
            variant: "destructive",
          });
          // If TTS fails, still listen to user
          startListeningToUser();
        }
      } else {
        // If no API key, just proceed with listening
        startListeningToUser();
      }
    } else {
      // End of interview
      endInterview();
    }
  };
  
  // Start listening to user's response
  const startListeningToUser = () => {
    if (speechRecognitionRef.current) {
      setListeningToUser(true);
      setUserResponse("");
      speechRecognitionRef.current.start();
      
      // Set a timeout to stop listening and move to next question
      setTimeout(() => {
        stopListeningToUser();
      }, 60000); // Listen for 1 minute max
    }
  };
  
  // Stop listening and proceed to next question
  const stopListeningToUser = async () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setListeningToUser(false);
      
      // Analyze final response
      performRealTimeAnalysis(userResponse);
      
      // Provide feedback via speech
      if (apiKey && currentFeedback) {
        try {
          await speak(currentFeedback, currentVoice, apiKey);
        } catch (error) {
          console.error("Error with feedback speech:", error);
        }
      }
      
      // Wait a moment before next question
      setTimeout(() => {
        askQuestion(currentQuestion + 1);
      }, 3000);
    }
  };
  
  // End the interview
  const endInterview = () => {
    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        console.log("Speech recognition already stopped");
      }
    }
    
    // Stop media stream
    stopMediaStream();
    
    setIsRecording(false);
    
    // Generate final feedback data
    const feedbackData = {
      duration: `${Math.floor(recordingTime / 60)} minutes ${recordingTime % 60} seconds`,
      videoURL: videoURL,
      timestamp: new Date().toISOString(),
      
      // Overall score - average of all metrics
      overallScore: Math.floor(
        (
          Object.values(audioAnalysis).reduce((a: number, b: number) => a + b, 0) / 
          (Object.keys(audioAnalysis).length || 1) +
          Object.values(facialAnalysis).reduce((a: number, b: number) => a + b, 0) / 
          (Object.keys(facialAnalysis).length || 1) +
          Object.values(bodyLanguageAnalysis).reduce((a: number, b: number) => a + b, 0) / 
          (Object.keys(bodyLanguageAnalysis).length || 1)
        ) / 3
      ),
      
      // Detailed analysis
      voiceAnalysis: audioAnalysis,
      facialAnalysis: facialAnalysis,
      bodyAnalysis: bodyLanguageAnalysis,
      
      // Transcript of the interview
      transcript: userResponse,
      
      // Recommendations based on analysis
      recommendations: [
        "Practice speaking more clearly and confidently.",
        "Work on maintaining consistent eye contact.",
        "Be mindful of your posture during interviews.",
        "Use hand gestures purposefully to emphasize key points.",
        "Vary your tone to keep the interviewer engaged."
      ]
    };
    
    // Pass feedback data to parent component
    onEnd(feedbackData);
  };
  
  // Handle file upload (resume)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedResume(file);
      await processResume(file);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          console.log("Speech recognition already stopped");
        }
      }
      
      stopMediaStream();
      stopSpeaking();
      
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, [stopMediaStream, stopSpeaking, videoURL]);
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {config.jobRole} {config.type} Interview
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{config.type}</Badge>
          <Badge variant="outline">{config.difficulty} Difficulty</Badge>
          <Badge variant="outline">{config.duration} min</Badge>
        </div>
      </div>
      
      {/* Pre-interview setup */}
      {!interviewStarted && (
        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Upload Your Resume</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your resume so the AI interviewer can ask relevant questions.
                </p>
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-interprepai-50 file:text-interprepai-700
                    hover:file:bg-interprepai-100"
                />
              </div>
              
              <Button 
                onClick={startInterview} 
                disabled={(!uploadedResume && questionList.length === 0) || !cameraReady || !microphoneReady}
                className="w-full"
              >
                Start Interview
              </Button>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${microphoneReady ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">{microphoneReady ? 'Microphone ready' : 'Microphone not available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${cameraReady ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">{cameraReady ? 'Camera ready' : 'Camera not available'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Active interview */}
      {interviewStarted && (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-black/60 rounded-md px-3 py-1 text-white">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-black/60 rounded-full p-2">
                      {microphoneReady ? (
                        <Mic className="h-5 w-5 text-white" />
                      ) : (
                        <MicOff className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="bg-black/60 rounded-full p-2">
                      {cameraReady ? (
                        <Camera className="h-5 w-5 text-white" />
                      ) : (
                        <CameraOff className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="mb-2 flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">Interview Progress</p>
                  <span className="text-sm text-gray-500">
                    Question {currentQuestion + 1} of {questionList.length}
                  </span>
                </div>
                <Progress value={(currentQuestion / Math.max(1, questionList.length - 1)) * 100} />
              </div>
            </div>
            
            <div>
              <Card className="h-full">
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">Current Question</h3>
                    <p className="text-sm">{questionList[currentQuestion] || "Loading question..."}</p>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-1">Real-time Analysis</h3>
                    
                    {/* Audio Analysis */}
                    <div className="mb-2">
                      <p className="text-sm font-medium">Voice Tone</p>
                      <Progress value={audioAnalysis.tone || 0} className="h-1.5 mb-1" />
                    </div>
                    
                    {/* Facial Analysis */}
                    <div className="mb-2">
                      <p className="text-sm font-medium">Eye Contact</p>
                      <Progress value={facialAnalysis.eyeContact || 0} className="h-1.5 mb-1" />
                    </div>
                    
                    {/* Body Language */}
                    <div className="mb-2">
                      <p className="text-sm font-medium">Posture</p>
                      <Progress value={bodyLanguageAnalysis.posture || 0} className="h-1.5 mb-1" />
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold mb-1">Feedback</h3>
                      <p className="text-xs text-gray-600">{currentFeedback || "Analyzing your performance..."}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={endInterview}
                        className="w-full"
                      >
                        End Interview
                      </Button>
                    </div>
                    
                    {listeningToUser && (
                      <p className="text-center text-xs mt-2 text-green-600">Listening to your answer...</p>
                    )}
                    {isSpeaking && (
                      <p className="text-center text-xs mt-2 text-blue-600">AI interviewer is speaking...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;
