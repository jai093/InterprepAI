
import AnalysisCard from "./AnalysisCard";
import FacialAnalysisCard from "./FacialAnalysisCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SafeInterviewData } from "./types";

interface PerformanceAnalysisTabProps {
  safeInterviewData: SafeInterviewData;
}

const PerformanceAnalysisTab = ({ safeInterviewData }: PerformanceAnalysisTabProps) => {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AnalysisCard 
          title="Response Quality" 
          data={safeInterviewData.responsesAnalysis} 
        />
        <AnalysisCard 
          title="Non-verbal Communication" 
          data={{
            eyeContact: safeInterviewData.facialAnalysis?.eyeContact || safeInterviewData.nonVerbalAnalysis?.eyeContact || 0,
            facialExpressions: safeInterviewData.facialAnalysis?.facialExpressions || 
                              safeInterviewData.facialAnalysis?.smile || 
                              safeInterviewData.nonVerbalAnalysis?.facialExpressions || 0,
            bodyLanguage: safeInterviewData.bodyAnalysis?.posture || 
                         safeInterviewData.nonVerbalAnalysis?.bodyLanguage || 0
          }} 
        />
        <AnalysisCard 
          title="Voice Analysis" 
          data={safeInterviewData.voiceAnalysis} 
        />
      </div>

      {safeInterviewData.facialAnalysis && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Facial Expression Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FacialAnalysisCard 
              label="Smile" 
              value={safeInterviewData.facialAnalysis.smile} 
              icon="smile" 
              description="Measures positive facial expressions during the interview" 
            />
            <FacialAnalysisCard 
              label="Neutrality" 
              value={safeInterviewData.facialAnalysis.neutrality} 
              description="Measures appropriate neutral expressions" 
            />
            <FacialAnalysisCard 
              label="Confidence" 
              value={safeInterviewData.facialAnalysis.confidence} 
              icon="brain" 
              description="Visual indicators of confidence" 
            />
            <FacialAnalysisCard 
              label="Engagement" 
              value={safeInterviewData.facialAnalysis.engagement} 
              icon="engagement" 
              description="Visual attentiveness and interest" 
            />
          </div>
        </div>
      )}
      
      {safeInterviewData.bodyAnalysis && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Body Language Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FacialAnalysisCard 
              label="Posture" 
              value={safeInterviewData.bodyAnalysis.posture} 
              description="Measures how upright and confident your sitting position is" 
            />
            <FacialAnalysisCard 
              label="Gestures" 
              value={safeInterviewData.bodyAnalysis.gestures} 
              description="Effectiveness of hand movements during speaking" 
            />
            <FacialAnalysisCard 
              label="Movement" 
              value={safeInterviewData.bodyAnalysis.movement} 
              description="Appropriate level of physical animation" 
            />
            <FacialAnalysisCard 
              label="Presence" 
              value={safeInterviewData.bodyAnalysis.presence} 
              description="Overall impression of confidence and authority" 
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {safeInterviewData.strengths?.map((strength, i) => (
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
              {safeInterviewData.improvements?.map((improvement, i) => (
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
              {safeInterviewData.recommendations?.map((recommendation, i) => (
                <li key={i} className="text-sm">{recommendation}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceAnalysisTab;
