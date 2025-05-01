
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AIInterviewerProps {
  speaking: boolean;
  question: string;
  onFinishedSpeaking?: () => void;
}

const AIInterviewer = ({ speaking, question, onFinishedSpeaking }: AIInterviewerProps) => {
  const [mouthOpen, setMouthOpen] = useState(false);
  const { toast } = useToast();
  
  // Simulated speech animation
  useEffect(() => {
    if (!speaking) {
      setMouthOpen(false);
      return;
    }
    
    // Calculate speech duration based on question length
    // Roughly 100 ms per character for realistic speaking pace
    const speechDuration = question.length * 100;
    
    // Animate mouth movement while speaking
    const animationInterval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 150); // Switch mouth state every 150ms for natural look
    
    // Notify when speech is done
    const speechTimer = setTimeout(() => {
      clearInterval(animationInterval);
      setMouthOpen(false);
      if (onFinishedSpeaking) {
        onFinishedSpeaking();
      }
    }, speechDuration);
    
    return () => {
      clearInterval(animationInterval);
      clearTimeout(speechTimer);
    };
  }, [speaking, question, onFinishedSpeaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      {/* AI Face */}
      <div className={`relative ${speaking ? 'animate-pulse-subtle' : ''}`}>
        <img 
          src="/lovable-uploads/e17fb865-e969-4d79-9bea-d28635b9e195.png" 
          alt="AI Interviewer" 
          className="rounded-lg shadow-lg max-h-[80vh] object-cover"
        />
        
        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute bottom-4 right-4 flex items-center bg-black/30 px-2 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-xs text-white font-medium">Speaking</span>
          </div>
        )}
      </div>
      
      {/* Current question display (optional) */}
      <div className="absolute bottom-8 left-8 right-8 bg-black/60 p-3 rounded-lg">
        <p className="text-white text-sm md:text-base">{question}</p>
      </div>
    </div>
  );
};

export default AIInterviewer;
