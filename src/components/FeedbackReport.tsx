
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface FeedbackReportProps {
  interviewData: {
    date: string;
    duration: string;
    overallScore: number;
    responsesAnalysis: {
      clarity: number;
      relevance: number;
      structure: number;
      examples: number;
    };
    nonVerbalAnalysis: {
      eyeContact: number;
      facialExpressions: number;
      bodyLanguage: number;
    };
    voiceAnalysis: {
      pace: number;
      tone: number;
      clarity: number;
      confidence: number;
    };
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

const FeedbackReport = ({ interviewData }: FeedbackReportProps) => {
  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Interview Feedback Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Date: {interviewData.date}</p>
              <p className="text-sm text-gray-500">Duration: {interviewData.duration}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="w-20 h-20 rounded-full border-4 border-interprepai-500 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-interprepai-700">{interviewData.overallScore}%</span>
              </div>
              <div>
                <p className="font-medium">Overall Score</p>
                <p className="text-sm text-gray-500">Above average</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AnalysisCard 
              title="Response Quality" 
              data={interviewData.responsesAnalysis} 
            />
            <AnalysisCard 
              title="Non-verbal Communication" 
              data={interviewData.nonVerbalAnalysis} 
            />
            <AnalysisCard 
              title="Voice Analysis" 
              data={interviewData.voiceAnalysis} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {interviewData.strengths.map((strength, i) => (
                    <li key={i} className="text-sm">{strength}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {interviewData.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm">{improvement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {interviewData.recommendations.map((recommendation, i) => (
                    <li key={i} className="text-sm">{recommendation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 sm:flex-row">
          <Button className="w-full sm:w-auto bg-interprepai-700 hover:bg-interprepai-800">
            Download Report
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">View Interview Recording</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Interview Recording</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Video recording would appear here</p>
              </div>
              <DialogFooter>
                <Button variant="outline">Download Recording</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link to="/simulation">Start New Interview</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

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

const getScoreColorClass = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
};

export default FeedbackReport;
