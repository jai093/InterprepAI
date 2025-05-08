
import { Card, CardContent } from "@/components/ui/card";
import { getScoreColorClass } from "./utils";
import { Smile, Eye, Brain, Sparkles } from "lucide-react";

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
            {description || `${label} analysis`}
          </span>
          <span className="text-xs font-medium text-gray-700">
            {getScoreDescription(value)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacialAnalysisCard;
