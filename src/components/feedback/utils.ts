
export const getScoreColorClass = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
};

export const createSafeInterviewData = (interviewData: any) => {
  // Ensure we have default values for all data with more robust fallbacks
  return {
    ...interviewData,
    responsesAnalysis: interviewData.responsesAnalysis || {
      clarity: 0,
      relevance: 0,
      structure: 0,
      examples: 0
    },
    nonVerbalAnalysis: interviewData.nonVerbalAnalysis || {
      eyeContact: 0,
      facialExpressions: 0,
      bodyLanguage: 0
    },
    voiceAnalysis: interviewData.voiceAnalysis || {
      pace: 0,
      tone: 0,
      clarity: 0,
      confidence: 0
    },
    facialAnalysis: interviewData.facialAnalysis || {
      smile: 0,
      neutrality: 0,
      confidence: 0,
      engagement: 0,
      eyeContact: 0,
      facialExpressions: 0
    },
    bodyAnalysis: interviewData.bodyAnalysis || {
      posture: 0,
      gestures: 0,
      movement: 0,
      presence: 0
    },
    strengths: interviewData.strengths || [],
    improvements: interviewData.improvements || [],
    recommendations: interviewData.recommendations || [],
    transcripts: interviewData.transcripts || []
  };
};
