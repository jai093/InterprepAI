
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Video, VideoOff, MicOff, Send, X, Volume2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import VoiceConfigDialog from "./VoiceConfigDialog";
import { useEleven } from "@/hooks/useElevenLabs"; 
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useIsMobile } from "@/hooks/use-mobile";
import { textToSpeech } from "@/utils/textToSpeech";

interface InterviewConfig {
  type: string;
  jobRole: string;
  duration: number;
  difficulty: string;
}

interface InterviewSessionProps {
  config: InterviewConfig;
  onEnd: (feedbackData: any) => void;
}

// Sample interview questions based on type
const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  behavioral: [
    "Tell me about a time when you had to deal with a difficult teammate.",
    "Describe a situation where you had to meet a tight deadline.",
    "Give an example of a time you showed leadership skills.",
    "Tell me about a time you failed and what you learned from it.",
    "How do you prioritize tasks when you have multiple deadlines?",
  ],
  technical: [
    "Explain how you would design a scalable web application.",
    "What's your approach to debugging a complex issue?",
    "How do you ensure code quality in your projects?",
    "Describe your experience with agile development methodologies.",
    "How do you stay updated with the latest technologies in your field?",
  ],
  "case-study": [
    "Our company is losing market share. How would you analyze this problem?",
    "How would you launch a new product in a competitive market?",
    "What metrics would you track to measure the success of a digital campaign?",
    "How would you optimize our customer acquisition costs?",
    "Our team is experiencing burnout. How would you address this issue?",
  ],
};

const InterviewSession: React.FC<InterviewSessionProps> = ({ config, onEnd }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { hasElevenApiKey, elevenVoiceId, elevenApiKey } = useEleven();
  const { requestMediaPermissions } = useMediaDevices();

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [chat, setChat] = useState<{type: 'interviewer' | 'user', message: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Get interview questions based on interview type
  const questions = INTERVIEW_QUESTIONS[config.type.toLowerCase()] || INTERVIEW_QUESTIONS.behavioral;
  
  // Initial setup
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        await requestMediaPermissions();
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoEnabled,
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        streamRef.current = stream;
        
        // Setup media recorder
        const options = { mimeType: 'video/webm' };
        try {
          const recorder = new MediaRecorder(stream, options);
          
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };
          
          mediaRecorderRef.current = recorder;
        } catch (e) {
          console.error('MediaRecorder error:', e);
          toast({
            title: "Error",
            description: "Could not initialize media recorder. Please try a different browser.",
            variant: "destructive",
          });
        }
        
        setIsInitializing(false);
        
        // Start by asking the first question
        setTimeout(() => {
          const introMessage = `Hello${user ? ' ' + user.email : ''}, welcome to your ${config.type} interview for the ${config.jobRole} position. Let's start with the first question.`;
          addMessage('interviewer', introMessage);
          speakMessage(introMessage);
          
          setTimeout(() => {
            addMessage('interviewer', questions[0]);
            speakMessage(questions[0]);
          }, 2000);
        }, 1000);
        
        // Start recording
        startRecording();
        
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast({
          title: "Permission Error",
          description: "Please allow access to your camera and microphone to start the interview.",
          variant: "destructive",
        });
      }
    };
    
    initializeMedia();
    
    // Clean up function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Function to add message to chat
  const addMessage = (type: 'interviewer' | 'user', message: string) => {
    setChat(prevChat => [...prevChat, {type, message}]);
  };
  
  // Function to speak message using ElevenLabs
  const speakMessage = async (message: string) => {
    if (hasElevenApiKey && elevenVoiceId) {
      try {
        await textToSpeech(message, elevenVoiceId, elevenApiKey || '');
      } catch (error) {
        console.error('Text to speech error:', error);
      }
    }
  };
  
  // Start recording
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
      // Clear previous recordings
      recordedChunksRef.current = [];
      
      // Start media recorder
      mediaRecorderRef.current.start(1000);
      
      // Start timer
      startTimer();
      
      setIsRecording(true);
    }
  };
  
  // Start timer
  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const startTime = Date.now() - elapsedTime * 1000;
    
    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsedSeconds);
      
      // Check if we've reached the time limit
      const timeLimit = config.duration * 60; // convert minutes to seconds
      if (elapsedSeconds >= timeLimit) {
        endInterview();
      }
    }, 1000);
  };
  
  // Toggle video
  const toggleVideo = async () => {
    if (!streamRef.current) return;
    
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    
    // Stop all video tracks
    streamRef.current.getVideoTracks().forEach(track => {
      track.enabled = newState;
    });
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (!streamRef.current) return;
    
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    
    // Stop all audio tracks
    streamRef.current.getAudioTracks().forEach(track => {
      track.enabled = newState;
    });
  };
  
  // Handle user response submission
  const handleSubmit = () => {
    if (userResponse.trim() === '') return;
    
    addMessage('user', userResponse);
    
    // Clear the text area
    setUserResponse('');
    
    // Process the next question after a brief pause
    setIsThinking(true);
    
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < questions.length) {
        // Ask the next question
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = questions[nextIndex];
        addMessage('interviewer', nextQuestion);
        speakMessage(nextQuestion);
      } else {
        // End the interview if we've asked all questions
        const finalMessage = "Thank you for your responses. That concludes our interview.";
        addMessage('interviewer', finalMessage);
        speakMessage(finalMessage);
        
        // End interview after 2 seconds
        setTimeout(() => endInterview(), 2000);
      }
      
      setIsThinking(false);
    }, 1500);
  };
  
  // Fix the problematic code in the endInterview function
  const endInterview = () => {
    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Create a blob from the recorded chunks
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const recordingUrl = URL.createObjectURL(blob);
    
    // Sample analysis data (in a real app, this would come from AI processing)
    const audioAnalysis = {
      pace: 85,
      clarity: 78,
      confidence: 82,
      volume: 75,
      filler_words: 68, 
    };
    
    const facialAnalysis = {
      eye_contact: 72,
      expressions: 80,
      engagement: 85,
    };
    
    const bodyLanguageAnalysis = {
      posture: 70,
      hand_gestures: 65,
      overall_presence: 75,
    };
    
    // Calculate overall score as the average of all metrics
    const audioAnalysisValues = Object.values(audioAnalysis);
    const facialAnalysisValues = Object.values(facialAnalysis);
    const bodyLanguageValues = Object.values(bodyLanguageAnalysis);
    
    const audioAnalysisAvg = audioAnalysisValues.reduce((a, b) => Number(a) + Number(b), 0) / 
                            audioAnalysisValues.length;
                            
    const facialAnalysisAvg = facialAnalysisValues.reduce((a, b) => Number(a) + Number(b), 0) / 
                             facialAnalysisValues.length;
                             
    const bodyLanguageAvg = bodyLanguageValues.reduce((a, b) => Number(a) + Number(b), 0) / 
                           bodyLanguageValues.length;
    
    // Prepare feedback data
    const feedbackData = {
      recordingUrl,
      interviewType: config.type,
      jobRole: config.jobRole,
      date: new Date().toISOString(),
      duration: elapsedTime,
      audioAnalysis,
      facialAnalysis,
      bodyLanguageAnalysis,
      questions,
      responses: chat,
      // Overall score - average of all metrics
      overallScore: Math.floor((audioAnalysisAvg + facialAnalysisAvg + bodyLanguageAvg) / 3)
    };
    
    // Call the onEnd callback with the feedback data
    onEnd(feedbackData);
  };
  
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Left side - Video feed */}
      <div className="lg:w-2/3 flex flex-col gap-4">
        <Card className="shadow-md overflow-hidden">
          <CardContent className="p-0 relative">
            {isInitializing ? (
              <div className="w-full aspect-video bg-muted flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-interprepai-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-center font-medium">Setting up your interview environment...</p>
                  <p className="text-sm text-muted-foreground">Please allow camera and microphone access when prompted</p>
                </div>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full aspect-video ${videoEnabled ? 'opacity-100' : 'opacity-0 bg-gray-900'}`}
                ></video>
                
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="shadow">
                    {isRecording ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        REC {formatTime(elapsedTime)}
                      </>
                    ) : 'Not Recording'}
                  </Badge>
                </div>
                
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <VideoOff size={48} className="text-gray-400" />
                      <p className="text-gray-400 mt-2">Video is turned off</p>
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button size="icon" variant="secondary" onClick={toggleAudio}>
                    {audioEnabled ? <Mic /> : <MicOff />}
                  </Button>
                  <Button size="icon" variant="secondary" onClick={toggleVideo}>
                    {videoEnabled ? <Video /> : <VideoOff />}
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => setVoiceDialogOpen(true)}>
                    <Volume2 />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Interview Progress
              </p>
              <Badge>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Time Remaining: {formatTime((config.duration * 60) - elapsedTime)}
            </p>
          </div>
          <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
        </div>
      </div>
      
      {/* Right side - Conversation */}
      <div className="lg:w-1/3 flex flex-col h-full">
        <Card className="shadow-md flex-1">
          <CardContent className="p-4 flex flex-col h-full">
            <Tabs defaultValue="conversation" className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="info">Interview Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversation" className="flex-1 flex flex-col space-y-0 data-[state=active]:flex-1">
                <div className="flex-1 overflow-y-auto py-2 space-y-4">
                  {chat.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] ${message.type === 'interviewer' ? 'bg-secondary' : 'bg-interprepai-600 text-white'} rounded-lg px-3 py-2`}>
                        {message.type === 'interviewer' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">AI Interviewer</span>
                          </div>
                        )}
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-lg px-3 py-2 max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">AI Interviewer</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Textarea 
                    placeholder="Type your response..." 
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    className="min-h-[100px] resize-none flex-1"
                  />
                  <Button 
                    onClick={handleSubmit} 
                    size="icon" 
                    className="self-end"
                  >
                    <Send />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="space-y-4 data-[state=active]:flex-1">
                <div>
                  <h3 className="font-semibold mb-1">Interview Type</h3>
                  <Badge variant="outline">{config.type}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Position</h3>
                  <p className="text-sm">{config.jobRole}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Difficulty</h3>
                  <Badge variant="outline">{config.difficulty}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Duration</h3>
                  <p className="text-sm">{config.duration} minutes</p>
                </div>
                
                <Alert>
                  <AlertDescription>
                    This interview session is being recorded for feedback purposes. You can end the interview at any time by clicking the "End Interview" button.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <Button variant="destructive" className="w-full" onClick={endInterview}>
                    <X className="mr-2 h-4 w-4" />
                    End Interview
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <VoiceConfigDialog
        open={voiceDialogOpen}
        onOpenChange={setVoiceDialogOpen}
      />
    </div>
  );
};

export default InterviewSession;
