
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface AIInterviewerProps {
  speaking: boolean;
  question: string;
  onFinishedSpeaking?: () => void;
}

const AIInterviewer = ({ speaking, question, onFinishedSpeaking }: AIInterviewerProps) => {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [mouthOpenAmount, setMouthOpenAmount] = useState(0);
  const { toast } = useToast();
  const animationFrameRef = useRef<number | null>(null);
  
  // Dynamic mouth animation based on speech patterns
  useEffect(() => {
    if (!speaking) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMouthOpenAmount(0);
      return;
    }
    
    let lastTime = 0;
    let mouthCycle = 0;
    
    // Calculate speech duration based on question length (approximately 100ms per character)
    const speechDuration = question.length * 100;
    
    // More natural-looking mouth animation with variable opening amounts
    const animateMouth = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;
      
      // Update mouth cycle - different speeds for different speech parts
      mouthCycle += delta * 0.01;
      
      // Calculate mouth openness with natural variability
      // Using sine waves of different frequencies for more natural movement
      const primary = Math.sin(mouthCycle * 0.5) * 0.5 + 0.5;
      const secondary = Math.sin(mouthCycle * 0.8) * 0.3;
      const tertiary = Math.sin(mouthCycle * 1.2) * 0.2;
      
      // Combine waves and scale
      const openAmount = (primary + secondary + tertiary) * 0.7;
      
      // Apply with smoothing
      setMouthOpenAmount(prev => prev * 0.7 + openAmount * 0.3);
      setMouthOpen(openAmount > 0.3);
      
      lastTime = time;
      
      animationFrameRef.current = requestAnimationFrame(animateMouth);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateMouth);
    
    // Notify when speech is done
    const speechTimer = setTimeout(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMouthOpenAmount(0);
      setMouthOpen(false);
      if (onFinishedSpeaking) {
        onFinishedSpeaking();
      }
    }, speechDuration);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(speechTimer);
    };
  }, [speaking, question, onFinishedSpeaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      {/* AI Face with container for better positioning */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className={`relative transform ${speaking ? 'animate-pulse-subtle' : ''}`}>
          <img 
            src="/lovable-uploads/e17fb865-e969-4d79-9bea-d28635b9e195.png" 
            alt="AI Interviewer" 
            className="max-h-[85vh] object-cover z-10"
          />
          
          {/* Mouth overlay - positioned absolutely to create lip-sync effect */}
          {speaking && (
            <div 
              className="absolute bottom-[30%] left-1/2 transform -translate-x-1/2 w-[25%] bg-black rounded-full z-20"
              style={{ 
                height: `${mouthOpenAmount * 15}px`,
                opacity: mouthOpen ? 0.7 : 0,
                transition: 'height 0.05s ease-out, opacity 0.05s ease-out'
              }}
            ></div>
          )}
        </div>
        
        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute bottom-4 right-4 flex items-center bg-black/30 px-2 py-1 rounded-full z-30">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-xs text-white font-medium">Speaking</span>
          </div>
        )}
      </div>
      
      {/* Current question display - improved styling */}
      <div className="absolute bottom-8 left-8 right-8 bg-black/60 p-4 rounded-lg backdrop-blur-sm z-40">
        <p className="text-white text-sm md:text-base">{question}</p>
      </div>
    </div>
  );
};

export default AIInterviewer;
