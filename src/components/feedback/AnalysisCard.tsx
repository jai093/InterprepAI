
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreColorClass } from "./utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AnalysisCardProps {
  title: string;
  data: Record<string, number>;
  descriptions?: Record<string, string>;
  icon?: React.ReactNode;
}

const AnalysisCard = ({ title, data, descriptions = {}, icon }: AnalysisCardProps) => {
  // Helper function to get score description
  const getScoreDescription = (score: number): string => {
    if (score > 85) return "Excellent";
    if (score > 70) return "Good";
    if (score > 50) return "Average";
    return "Needs Improvement";
  };
  
  // Format key into a readable label
  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon && <span className="text-interprepai-500">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <span className="capitalize text-sm">{formatKey(key)}</span>
                
                {descriptions[key] && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Info className="h-3.5 w-3.5 text-gray-400 ml-1.5 cursor-help" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">{descriptions[key]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{getScoreDescription(value)}</span>
                <span className="text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded">{value}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getScoreColorClass(value)}`}
                style={{ width: `${value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
