
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

interface TranscriptData {
  question: string;
  answer: string;
  quality: number; // 0-100 score of answer quality
  keywords: string[]; // Keywords detected in the answer
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
  
  // Track user participation more accurately
  const [hasParticipated, setHasParticipated] = useState(false);
  const [responseQuality, setResponseQuality] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptData[]>([]);
  const [activeParticipationTime, setActiveParticipationTime] = useState(0);
  
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
  
  // Speech activity detection
  const lastActivityTimestamp = useRef<number>(0);
  const speechActivityInterval = useRef<number | null>(null);
  
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
  
  // Enhanced speech recognition with better participation tracking
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
          
          // Update last activity timestamp
          lastActivityTimestamp.current = Date.now();
          
          // Detect filler words
          const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
          const words = transcript.toLowerCase().split(' ');
          const fillerCount = words.filter(word => fillerWords.includes(word)).length;
          
          setUserMetrics(prev => ({
            ...prev,
            fillerWords: prev.fillerWords + fillerCount
          }));
          
          // Detect keywords related to the question
          const questionText = questions[currentQuestionIndex].text.toLowerCase();
          const keywordMatches = analyzeKeywordMatches(transcript.toLowerCase(), questionText);
          
          // If user speaks more than 20 characters, mark as participated
          if (transcript.length > 20) {
            // Mark as participated if not already
            if (!hasParticipated) {
              setHasParticipated(true);
            }
            
            // Add current question to answered questions if not already there
            if (!answeredQuestions.includes(currentQuestionIndex)) {
              setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
              
              // Increase active participation time
              setActiveParticipationTime(prev => prev + 5);
            } else {
              // Still increase active time for continuing to speak
              setActiveParticipationTime(prev => prev + 2);
            }
            
            // Calculate response quality based on:
            // 1. Length of response (word count)
            // 2. Lack of filler words
            // 3. Presence of relevant keywords
            // 4. Complete sentences
            const wordsSpoken = transcript.split(' ').length;
            const hasSentenceStructure = transcript.includes('.') || transcript.includes('?') || transcript.includes('!');
            
            // Base quality on various factors
            let qualityScore = Math.min(100, Math.max(10,
              Math.floor((wordsSpoken - fillerCount) * 3) + 
              (keywordMatches * 10) +
              (hasSentenceStructure ? 15 : 0)
            ));
            
            // Cap quality based on thresholds
            if (wordsSpoken < 5) qualityScore = Math.min(qualityScore, 30);
            else if (wordsSpoken < 15) qualityScore = Math.min(qualityScore, 60);
            
            // Update the response quality
            setResponseQuality(prev => Math.max(prev, qualityScore));
          }
        }
      }
      
      setSpeechData(prev => ({
        ...prev,
        transcript: prev.transcript + transcript
      }));

      // Simulate voice analysis based on actual transcript content
      simulateVoiceAnalysis(transcript);
    };
    
    recognition.onend = () => {
      if (speechData.isListening) {
        recognition.start();
      }
    };
    
    recognition.start();
    setSpeechData(prev => ({ ...prev, isListening: true }));
    
    // Start the speech activity monitoring
    monitorSpeechActivity();
    
    return recognition;
  };
  
  // Analyze keyword matches between transcript and question
  const analyzeKeywordMatches = (transcript: string, questionText: string): number => {
    // Extract key terms from the question
    const jobRoleTerms = config.jobRole.toLowerCase().split(' ');
    
    // Common keywords for interviews based on question type
    const commonTerms = {
      behavioral: ['experience', 'situation', 'challenge', 'action', 'result', 'team', 'problem', 'solution', 'handled', 'example'],
      technical: ['approach', 'solution', 'method', 'implement', 'design', 'technology', 'tool', 'process', 'system', 'evaluate'],
      roleSpecific: ['skills', 'background', 'qualification', 'knowledge', 'responsibility', 'goal', 'expectation']
    };
    
    // Get relevant terms for this question type
    const relevantTerms = commonTerms[config.type as keyof typeof commonTerms] || commonTerms.behavioral;
    
    // Count matches
    let matchCount = 0;
    
    // Check job role terms
    jobRoleTerms.forEach(term => {
      if (term.length > 3 && transcript.includes(term)) {
        matchCount++;
      }
    });
    
    // Check for relevant terms
    relevantTerms.forEach(term => {
      if (transcript.includes(term)) {
        matchCount++;
      }
    });
    
    return Math.min(10, matchCount); // Cap at 10 matches
  };
  
  // Monitor for periods of speech activity/inactivity
  const monitorSpeechActivity = () => {
    if (speechActivityInterval.current) {
      clearInterval(speechActivityInterval.current);
    }
    
    lastActivityTimestamp.current = Date.now();
    
    speechActivityInterval.current = window.setInterval(() => {
      if (isRecording) {
        const now = Date.now();
        const silentTime = now - lastActivityTimestamp.current;
        
        // If silent for more than 3 seconds, update voice metrics to reflect this
        if (silentTime > 3000) {
          setVoiceAnalysis(prev => ({
            ...prev,
            clarity: Math.max(0, prev.clarity - 1),
            confidence: Math.max(0, prev.confidence - 1)
          }));
        }
      }
    }, 2000);
  };
  
  const simulateVoiceAnalysis = (transcript: string) => {
    if (transcript && transcript.length > 0) {
      // Reset last activity timestamp
      lastActivityTimestamp.current = Date.now();
      
      // Base the analysis on actual speech content
      const wordCount = transcript.split(' ').length;
      const sentenceStructure = transcript.includes('.') || transcript.includes('?') || transcript.includes('!');
      const hasKeywords = transcript.toLowerCase().includes(config.jobRole.toLowerCase());
      
      // Calculate more realistic scores based on speech quality
      const clarityScore = Math.min(100, Math.max(20, 30 + (wordCount / 8)));
      const paceScore = Math.min(100, Math.max(20, 40 + (sentenceStructure ? 20 : 0)));
      const confidenceScore = Math.min(100, Math.max(20, 30 + (hasKeywords ? 30 : 0) + (wordCount / 12)));
      
      setVoiceAnalysis({
        clarity: Math.floor(clarityScore),
        pace: Math.floor(paceScore),
        pitch: Math.min(100, Math.floor(50 + Math.sin(transcript.length * 0.06) * 15)),
        tone: Math.min(100, Math.floor(40 + Math.cos(transcript.length * 0.04) * 10)),
        confidence: Math.floor(confidenceScore)
      });
    }
  };
  
  const stopSpeechRecognition = (recognition: any) => {
    if (recognition) {
      recognition.stop();
      setSpeechData(prev => ({ ...prev, isListening: false }));
    }
    
    // Clear speech activity interval
    if (speechActivityInterval.current) {
      clearInterval(speechActivityInterval.current);
      speechActivityInterval.current = null;
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
      
      // Reset participation metrics for new recording
      setActiveParticipationTime(0);
      
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
    
    // Save transcript for current question
    updateTranscriptForCurrentQuestion();
    
    toast({
      title: "Recording Complete",
      description: "Your response recording has been saved.",
    });
  };
  
  // Update transcript for the current question
  const updateTranscriptForCurrentQuestion = () => {
    if (!speechData.transcript) return;
    
    // Analyze transcript quality
    const questionText = questions[currentQuestionIndex].text.toLowerCase();
    const keywordMatches = analyzeKeywordMatches(speechData.transcript.toLowerCase(), questionText);
    const wordsSpoken = speechData.transcript.split(' ').length;
    const hasSentenceStructure = speechData.transcript.includes('.') || 
                                speechData.transcript.includes('?') || 
                                speechData.transcript.includes('!');
    
    // Calculate quality score
    const qualityScore = Math.min(100, Math.max(10,
      Math.floor(wordsSpoken * 2) + 
      (keywordMatches * 10) +
      (hasSentenceStructure ? 15 : 0) - 
      (userMetrics.fillerWords * 5)
    ));
    
    // Extract keywords from transcript
    const keywords = extractKeywordsFromTranscript(speechData.transcript, questionText);
    
    const newTranscript: TranscriptData = {
      question: questions[currentQuestionIndex].text,
      answer: speechData.transcript,
      quality: qualityScore,
      keywords
    };
    
    setTranscripts(prev => {
      // Check if this question already has a transcript
      const existingIndex = prev.findIndex(t => 
        t.question === questions[currentQuestionIndex].text
      );
      
      if (existingIndex >= 0) {
        // Update existing transcript
        const updated = [...prev];
        updated[existingIndex] = newTranscript;
        return updated;
      } else {
        // Add new transcript
        return [...prev, newTranscript];
      }
    });
  };
  
  // Extract keywords from transcript
  const extractKeywordsFromTranscript = (transcript: string, questionText: string): string[] => {
    const keywords: string[] = [];
    const text = transcript.toLowerCase();
    
    // Job role terms
    const jobRoleTerms = config.jobRole.toLowerCase().split(' ');
    jobRoleTerms.forEach(term => {
      if (term.length > 3 && text.includes(term)) {
        keywords.push(term);
      }
    });
    
    // Common interview keywords
    const commonKeywords = [
      'experience', 'challenge', 'solution', 'project', 'team',
      'success', 'failure', 'learned', 'skill', 'achieve',
      'improve', 'responsibility', 'manage', 'lead', 'collaborate'
    ];
    
    commonKeywords.forEach(word => {
      if (text.includes(word)) {
        keywords.push(word);
      }
    });
    
    // Technical terms if it's a technical interview
    if (config.type === 'technical') {
      const technicalKeywords = [
        'algorithm', 'architecture', 'framework', 'database',
        'system', 'implementation', 'design', 'process', 'technology'
      ];
      
      technicalKeywords.forEach(word => {
        if (text.includes(word)) {
          keywords.push(word);
        }
      });
    }
    
    // Remove duplicates and return
    return [...new Set(keywords)];
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
  
  // Enhanced analytics update with better participation tracking
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        
        // Update metrics based on participation
        updateMetricsBasedOnParticipation();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRecording, secondsElapsed, hasParticipated, activeParticipationTime]);
  
  // Update metrics based on actual participation
  const updateMetricsBasedOnParticipation = () => {
    // Calculate participation ratio (active speaking time / total elapsed time)
    const participationRatio = secondsElapsed > 0 
      ? Math.min(1, activeParticipationTime / secondsElapsed) 
      : 0;
    
    // If user has been speaking actively (high participation ratio)
    if (participationRatio > 0.3) {
      // Higher metrics for engaged users
      setUserMetrics(prev => ({
        speakingPace: Math.min(95, 50 + Math.floor(participationRatio * 50)),
        eyeContact: Math.min(90, 60 + Math.floor(participationRatio * 30)),
        fillerWords: prev.fillerWords,
        engagement: Math.min(95, 50 + Math.floor(participationRatio * 45))
      }));
      
      // Update facial analysis for engaged users
      setFacialAnalysis({
        smile: Math.min(90, 40 + Math.floor(participationRatio * 50)),
        neutrality: Math.min(80, 50 + Math.floor(Math.cos(secondsElapsed * 0.05) * 30)),
        confidence: Math.min(95, 50 + Math.floor(participationRatio * 45)),
        engagement: Math.min(95, 60 + Math.floor(participationRatio * 35))
      });
    } 
    // Moderate participation
    else if (participationRatio > 0.1) {
      // Moderate metrics for somewhat engaged users
      setUserMetrics(prev => ({
        speakingPace: Math.min(70, 30 + Math.floor(participationRatio * 100)),
        eyeContact: Math.min(65, 40 + Math.floor(participationRatio * 60)),
        fillerWords: prev.fillerWords,
        engagement: Math.min(70, 30 + Math.floor(participationRatio * 100))
      }));
      
      // Update facial analysis for somewhat engaged users
      setFacialAnalysis({
        smile: Math.min(70, 30 + Math.floor(participationRatio * 100)),
        neutrality: Math.min(80, 50 + Math.floor(Math.cos(secondsElapsed * 0.05) * 30)),
        confidence: Math.min(65, 30 + Math.floor(participationRatio * 90)),
        engagement: Math.min(70, 30 + Math.floor(participationRatio * 100))
      });
    }
    // Low or no participation
    else {
      // Lower metrics for disengaged users
      setUserMetrics(prev => ({
        speakingPace: Math.min(30, 10 + Math.floor(participationRatio * 100)),
        eyeContact: Math.min(40, 20 + Math.floor(participationRatio * 100)),
        fillerWords: prev.fillerWords,
        engagement: Math.min(30, 10 + Math.floor(participationRatio * 100))
      }));
      
      // Update facial analysis for disengaged users
      setFacialAnalysis({
        smile: Math.min(30, 10 + Math.floor(participationRatio * 100)),
        neutrality: Math.min(60, 30 + Math.floor(Math.cos(secondsElapsed * 0.05) * 30)),
        confidence: Math.min(40, 20 + Math.floor(participationRatio * 100)),
        engagement: Math.min(30, 10 + Math.floor(participationRatio * 100))
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const nextQuestion = () => {
    // Save transcript for current question before moving on
    updateTranscriptForCurrentQuestion();
    
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
    
    // Calculate overall participation metrics
    const participationRate = (answeredQuestions.length / questions.length) * 100;
    
    // Calculate average transcript quality
    const avgQuality = transcripts.length > 0
      ? transcripts.reduce((sum, t) => sum + t.quality, 0) / transcripts.length
      : 0;
    
    // Calculate more accurate scores based on actual participation and quality
    const hasAnyParticipation = hasParticipated || answeredQuestions.length > 0;
    const participationFactor = hasAnyParticipation ? Math.max(0.2, participationRate / 100) : 0.1;
    const qualityFactor = hasAnyParticipation ? Math.max(0.2, avgQuality / 100) : 0.1;
    
    // Base score heavily influenced by actual participation
    const baseScore = hasAnyParticipation 
      ? 20 + (participationRate / 5) 
      : 10;
    
    // Generate truly realistic feedback data
    const overallScore = Math.floor(baseScore + (participationFactor * 20) + (qualityFactor * 30));
    
    // Generate personalized feedback based on actual participation
    let feedback = [];
    let recommendations = [];
    
    // Adjust feedback based on participation
    if (hasAnyParticipation) {
      // Feedback for users who participated
      feedback = [
        "You showed engagement with the interview process",
        transcripts.length > 0 ? "Your answers demonstrated understanding of the questions" : "Try to provide more detailed answers",
        userMetrics.fillerWords > 5 ? "Be mindful of filler words in your responses" : "You maintained good verbal clarity",
        avgQuality > 50 ? "Your answers were relevant and on-topic" : "Try to focus more directly on answering the questions"
      ];
      
      recommendations = [
        "Practice the STAR method for behavioral questions",
        "Prepare more concrete examples for your experiences",
        "Record yourself to improve body language awareness",
        userMetrics.fillerWords > 5 ? "Practice reducing filler words like 'um' and 'uh'" : "Continue maintaining clear speech patterns"
      ];
    } else {
      // Feedback for users who didn't participate
      feedback = [
        "Try to provide verbal responses to interview questions",
        "Engagement is a critical part of the interview process",
        "Even short answers are better than no response",
        "Practice speaking more confidently in interview settings"
      ];
      
      recommendations = [
        "Start with brief responses if you feel nervous",
        "Prepare short answers to common interview questions",
        "Practice interviewing with friends or family",
        "Use video recording to become more comfortable with your presentation"
      ];
    }
    
    // Calculate duration in minutes and seconds
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    const duration = `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    // Create comprehensive feedback data
    const feedbackData = {
      duration,
      overallScore,
      scoreRating: overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : overallScore >= 40 ? "Average" : "Needs Improvement",
      answeredQuestions: answeredQuestions.length,
      totalQuestions: questions.length,
      participationRate,
      avgAnswerQuality: avgQuality,
      userMetrics,
      facialAnalysis,
      voiceAnalysis,
      transcripts,
      feedback,
      recommendations,
      videoURL: recordedVideoURL,
      audioURL: audioURL,
      date: new Date().toISOString()
    };
    
    // Return feedback data to parent
    onEnd(feedbackData);
  };
  
  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Render UI
  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video preview and controls */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-video bg-gray-950 rounded-lg overflow-hidden relative mb-4">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                ></video>
                <canvas 
                  ref={canvasRef} 
                  className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0"
                ></canvas>
                <div className="absolute bottom-4 left-4 bg-black/70 rounded-md px-3 py-1 text-white text-sm">
                  {formatTime(secondsElapsed)}
                </div>
              </div>
              
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex space-x-2">
                  <Button 
                    onClick={toggleRecording} 
                    variant={isRecording ? "destructive" : "default"}
                  >
                    {isRecording ? (
                      <><MicOff className="mr-2 h-4 w-4" /> Stop Recording</>
                    ) : (
                      <><Mic className="mr-2 h-4 w-4" /> Start Recording</>
                    )}
                  </Button>
                  
                  <Button
                    onClick={nextQuestion}
                    variant="outline"
                    disabled={currentQuestionIndex >= questions.length - 1}
                  >
                    Next Question
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  {recordedVideoURL && (
                    <Button onClick={downloadVideo} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Video
                    </Button>
                  )}
                  
                  {audioURL && (
                    <Button onClick={downloadAudio} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Audio
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => onEnd({
                      overallScore: 0,
                      feedback: ["Interview was ended early"],
                      duration: formatTime(secondsElapsed)
                    })}
                    variant="outline"
                    size="sm"
                  >
                    End Interview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Question and analytics */}
        <div>
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-2">Current Question</h3>
              <p className="text-gray-800 mb-4">{questions[currentQuestionIndex].text}</p>
              
              <h4 className="font-medium text-sm mb-1 text-gray-500">Tips:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {questions[currentQuestionIndex].tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
              
              <div className="mt-4 text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-4">Real-time Feedback</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Speech Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Speaking Pace</p>
                      <p className={`font-medium ${userMetrics.speakingPace > 70 ? 'text-green-600' : userMetrics.speakingPace > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {userMetrics.speakingPace > 70 ? 'Good' : userMetrics.speakingPace > 40 ? 'Average' : 'Needs Improvement'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Filler Words</p>
                      <p className={`font-medium ${userMetrics.fillerWords < 3 ? 'text-green-600' : userMetrics.fillerWords < 8 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {userMetrics.fillerWords} detected
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Facial Expression Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Eye Contact</p>
                      <p className={`font-medium ${facialAnalysis.confidence > 70 ? 'text-green-600' : facialAnalysis.confidence > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {facialAnalysis.confidence > 70 ? 'Good' : facialAnalysis.confidence > 40 ? 'Average' : 'Needs Improvement'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Engagement</p>
                      <p className={`font-medium ${facialAnalysis.engagement > 70 ? 'text-green-600' : facialAnalysis.engagement > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {facialAnalysis.engagement > 70 ? 'Good' : facialAnalysis.engagement > 40 ? 'Average' : 'Needs Improvement'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confidence Expression</p>
                      <p className={`font-medium ${facialAnalysis.confidence > 70 ? 'text-green-600' : facialAnalysis.confidence > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {facialAnalysis.confidence > 70 ? 'Good' : facialAnalysis.confidence > 40 ? 'Average' : 'Needs Improvement'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Voice Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Clarity</p>
                      <p className={`font-medium ${voiceAnalysis.clarity > 70 ? 'text-green-600' : voiceAnalysis.clarity > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {voiceAnalysis.clarity > 70 ? 'Good' : voiceAnalysis.clarity > 40 ? 'Average' : 'Needs Improvement'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tone</p>
                      <p className={`font-medium ${voiceAnalysis.tone > 70 ? 'text-green-600' : voiceAnalysis.tone > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {voiceAnalysis.tone > 70 ? 'Good' : voiceAnalysis.tone > 40 ? 'Average' : 'Needs Improvement'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Transcript section */}
      {speechData.transcript && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-2">Current Response</h3>
            <p className="text-gray-800 whitespace-pre-wrap">
              {speechData.transcript || 'No transcript available yet. Start speaking after you click "Record"'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewSession;
