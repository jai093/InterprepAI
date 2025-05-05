
import { Card, CardContent } from "@/components/ui/card";
import { getScoreColorClass } from "./utils";

interface FacialAnalysisCardProps {
  label: string;
  value: number;
}

const FacialAnalysisCard = ({ label, value }: FacialAnalysisCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs">{value}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getScoreColorClass(value)}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacialAnalysisCard;
