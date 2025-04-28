
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InterviewConfig } from "@/components/InterviewSetup";
import { MicOff, Mic } from "lucide-react";

interface InterviewSessionProps {
  config: InterviewConfig;
  onEnd: (feedbackData: any) => void;
}

interface Question {
  id: number;
  text: string;
  tips: string[];
}

// New speech recognition interface
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
  
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
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
    };
  }, [toast]);
  
  // Set up speech recognition
  const startSpeechRecognition = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
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
        }
      }
      
      setSpeechData(prev => ({
        ...prev,
        transcript: prev.transcript + transcript
      }));
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
    
    const options = { mimeType: 'video/webm; codecs=vp9,opus' };
    try {
      const mediaRecorder = new MediaRecorder(mediaStream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.start(1000); // Collect data in 1-second chunks
      mediaRecorderRef.current = mediaRecorder;
      
      // Start speech recognition
      const recognition = startSpeechRecognition();
      
      // Update state
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Your response is now being recorded.",
      });
      
      return () => {
        mediaRecorder.stop();
        stopSpeechRecognition(recognition);
      };
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
    
    // Stop speech recognition
    setSpeechData(prev => ({ ...prev, isListening: false }));
    
    setIsRecording(false);
    
    toast({
      title: "Recording Paused",
      description: "Your response recording has been paused.",
    });
  };
  
  // Mock analytics update
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        
        // Simulate analysis updates with slightly more realistic values
        setUserMetrics(prev => ({
          speakingPace: Math.min(100, Math.floor(65 + Math.sin(secondsElapsed * 0.1) * 15)),
          eyeContact: Math.min(100, Math.floor(70 + Math.cos(secondsElapsed * 0.05) * 15)),
          fillerWords: prev.fillerWords, // This is updated by speech recognition
          engagement: Math.min(100, Math.floor(75 + Math.sin(secondsElapsed * 0.08) * 10))
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRecording, secondsElapsed]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const nextQuestion = () => {
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
    
    // Save recorded video as a blob if needed
    let recordedBlob = null;
    if (recordedChunks.length > 0) {
      recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
      // Could save video for later if needed
    }
    
    // Generate mock feedback data
    const mockFeedback = {
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      duration: `${Math.floor(secondsElapsed / 60)} minutes ${secondsElapsed % 60} seconds`,
      overallScore: Math.floor(65 + Math.random() * 20),
      responsesAnalysis: {
        clarity: Math.floor(70 + Math.random() * 20),
        relevance: Math.floor(65 + Math.random() * 25),
        structure: Math.floor(60 + Math.random() * 20),
        examples: Math.floor(70 + Math.random() * 20)
      },
      nonVerbalAnalysis: {
        eyeContact: userMetrics.eyeContact,
        facialExpressions: Math.floor(65 + Math.random() * 20),
        bodyLanguage: Math.floor(60 + Math.random() * 15)
      },
      voiceAnalysis: {
        pace: userMetrics.speakingPace,
        tone: Math.floor(70 + Math.random() * 20),
        clarity: Math.floor(75 + Math.random() * 15),
        confidence: Math.floor(65 + Math.random() * 20)
      },
      strengths: [
        "Strong use of concrete examples",
        "Clear communication style",
        "Appropriate response length",
        "Maintained positive demeanor"
      ],
      improvements: [
        userMetrics.eyeContact < 70 ? "Maintain more consistent eye contact" : "Continue with strong eye contact",
        userMetrics.fillerWords > 5 ? "Reduce filler words like 'um' and 'uh'" : "Good control of filler words",
        "Improve structure in longer responses",
        "Use more hand gestures to emphasize points"
      ],
      recommendations: [
        "Practice the STAR method for behavioral questions",
        "Record yourself to monitor eye contact patterns",
        "Try speaking more slowly during technical explanations",
        "Prepare 2-3 more examples for common questions"
      ],
      transcripts: [
        {
          question: questions[currentQuestionIndex].text,
          answer: speechData.transcript || "No transcript available"
        }
      ]
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
                className="bg-white/20 hover:bg-white/30 text-white flex items-center"
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" /> Record
                  </>
                )}
              </Button>
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
                <p className="text-sm font-medium mb-2">Your response:</p>
                <p className="text-sm text-gray-700">{speechData.transcript}</p>
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
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Eye Contact</span>
                  <span className="text-xs font-medium">
                    {userMetrics.eyeContact > 80 ? "Good" : userMetrics.eyeContact > 60 ? "Average" : "Needs Improvement"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${userMetrics.eyeContact > 80 ? "bg-green-500" : userMetrics.eyeContact > 60 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${userMetrics.eyeContact}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
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
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Engagement</span>
                  <span className="text-xs font-medium">
                    {userMetrics.engagement > 80 ? "Excellent" : userMetrics.engagement > 60 ? "Good" : "Average"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${userMetrics.engagement > 80 ? "bg-green-500" : userMetrics.engagement > 60 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${userMetrics.engagement}%` }}
                  ></div>
                </div>
              </div>
              
              {userMetrics.eyeContact < 60 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <h3 className="font-medium text-amber-800 mb-1">Suggestion</h3>
                  <p className="text-sm text-amber-700">Try to maintain more consistent eye contact with the camera. Currently looking away frequently.</p>
                </div>
              )}
              
              {userMetrics.fillerWords > 5 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                  <h3 className="font-medium text-amber-800 mb-1">Suggestion</h3>
                  <p className="text-sm text-amber-700">You're using several filler words like "um" and "uh". Try pausing briefly instead when gathering your thoughts.</p>
                </div>
              )}
              
              {speechData.transcript && userMetrics.speakingPace < 60 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                  <h3 className="font-medium text-amber-800 mb-1">Suggestion</h3>
                  <p className="text-sm text-amber-700">Your speaking pace is a bit slow. Try to maintain a more conversational rhythm.</p>
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
