
import { Card, CardContent } from "@/components/ui/card";
import { getScoreColorClass } from "./utils";
import { Smile, Eye, Brain, Sparkles, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface FacialAnalysisCardProps {
  label: string;
  value: number;
  icon?: 'smile' | 'eye' | 'brain' | 'engagement';
  description?: string;
}

const FacialAnalysisCard = ({ 
  label, 
  value, 
  icon, 
  description 
}: FacialAnalysisCardProps) => {
  // Function to get descriptive text based on score
  const getScoreDescription = (score: number): string => {
    if (score > 85) return "Excellent";
    if (score > 70) return "Good";
    if (score > 50) return "Average";
    return "Needs Improvement";
  };

  // Function to get advice based on the score and label
  const getAdvice = (score: number, label: string): string => {
    switch (label.toLowerCase()) {
      case 'smile':
        return score < 70 ? "Consider smiling more to appear approachable and confident." : 
               "Good job maintaining appropriate facial expressions.";
      case 'eye contact':
        return score < 70 ? "Try to maintain more consistent eye contact with the interviewer." : 
               "Great job with maintaining good eye contact.";
      case 'confidence':
        return score < 70 ? "Work on appearing more confident through your facial expressions." : 
               "You project good confidence through your facial expressions.";
      case 'engagement':
        return score < 70 ? "Show more engagement through animated facial expressions when appropriate." : 
               "Good level of engagement shown through your expressions.";
      default:
        return score < 70 ? "Consider working on this aspect of your non-verbal communication." : 
               "You're performing well in this area.";
    }
  };

  // Select icon based on prop
  const getIcon = () => {
    switch (icon) {
      case 'smile':
        return <Smile className="h-5 w-5 text-blue-500" />;
      case 'eye':
        return <Eye className="h-5 w-5 text-green-500" />;
      case 'brain':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'engagement':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-sm font-medium">{label}</span>
            
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className="text-xs font-semibold">{value}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5">
          <div 
            className={`h-2 rounded-full ${getScoreColorClass(value)}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {description ? label : `${label} analysis`}
          </span>
          <span className="text-xs font-medium text-gray-700">
            {getScoreDescription(value)}
          </span>
        </div>
        
        {/* Add advice section */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600 italic">
            {getAdvice(value, label)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacialAnalysisCard;
