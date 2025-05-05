
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreColorClass } from "./utils";

interface AnalysisCardProps {
  title: string;
  data: Record<string, number>;
}

const AnalysisCard = ({ title, data }: AnalysisCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="flex justify-between items-center mb-1">
              <span className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="text-xs font-medium">{value}%</span>
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
