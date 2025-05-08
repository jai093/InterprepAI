
import { SafeInterviewData } from "./types";
import { MessageSquare, Award, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface TranscriptTabProps {
  safeInterviewData: SafeInterviewData;
}

const TranscriptTab = ({ safeInterviewData }: TranscriptTabProps) => {
  const [showAnalysis, setShowAnalysis] = useState<boolean>(true);

  // Helper function to get quality indicators for answers
  const getAnswerQuality = (answer: string) => {
    if (!answer) return { score: 0, feedback: "No answer recorded" };
    
    // Basic analysis of answer quality based on length and content
    const wordCount = answer.split(/\s+/).length;
    let score = 0;
    let feedback = "";
    
    if (wordCount < 10) {
      score = 30;
      feedback = "Answer is too brief. Provide more details.";
    } else if (wordCount < 30) {
      score = 50;
      feedback = "Answer could be more detailed. Consider using the STAR method.";
    } else if (wordCount < 60) {
      score = 70;
      feedback = "Good length, but consider adding specific examples.";
    } else if (wordCount < 120) {
      score = 85;
      feedback = "Great answer with good detail.";
    } else {
      score = 90;
      feedback = "Excellent, comprehensive answer.";
    }
    
    // Check for filler words
    const fillerWords = ["um", "uh", "like", "you know", "actually", "basically"];
    const fillerWordMatches = answer.toLowerCase().match(new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'g')) || [];
    const fillerCount = fillerWordMatches.length;
    
    if (fillerCount > 5) {
      score -= 10;
      feedback += " Watch out for filler words.";
    }
    
    // Check for concrete examples
    if (/for example|instance|specifically|particularly|case|situation/i.test(answer)) {
      score += 5;
      feedback += " Good use of examples.";
    }
    
    return { 
      score: Math.min(100, Math.max(0, score)), 
      feedback 
    };
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-interprepai-600" /> 
          Interview Transcript
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          {showAnalysis ? "Hide Analysis" : "Show Analysis"}
        </Button>
      </div>
      
      {safeInterviewData.transcripts && safeInterviewData.transcripts.length > 0 ? (
        safeInterviewData.transcripts.map((transcript, index) => {
          const quality = getAnswerQuality(transcript.answer);
          
          return (
            <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
              <div className="bg-white p-3 rounded-lg border border-gray-100 mb-3">
                <p className="font-semibold text-gray-800 mb-1">Q: {transcript.question}</p>
                <Separator className="my-2" />
                <p className="text-gray-700 whitespace-pre-wrap">{transcript.answer || "No answer recorded"}</p>
              </div>
              
              {showAnalysis && (
                <div className={`p-3 rounded-lg ${quality.score >= 70 ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <div className="flex items-start">
                    {quality.score >= 70 ? (
                      <Award className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        Response Quality: 
                        <span className={`ml-1 ${quality.score >= 70 ? 'text-green-600' : quality.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {quality.score}%
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{quality.feedback}</p>
                      
                      {transcript.answer && (
                        <ul className="text-xs text-gray-600 mt-2 space-y-1">
                          <li>• Words: {transcript.answer.split(/\s+/).length}</li>
                          <li>• Filler words: {(transcript.answer.toLowerCase().match(/\b(um|uh|like|you know|actually|basically)\b/g) || []).length}</li>
                          <li>• Has examples: {/for example|instance|specifically|particularly|case|situation/i.test(transcript.answer) ? 'Yes' : 'No'}</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">No transcript available</p>
      )}
    </div>
  );
};

export default TranscriptTab;
