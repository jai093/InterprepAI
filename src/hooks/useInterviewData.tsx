import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export interface InterviewSession {
  id: string;
  date: string;
  type: string;
  role: string;
  score: number;
  duration: string;
  voice_analysis: {
    clarity: number;
    pace: number;
    pitch: number;
    tone: number;
    confidence: number;
  };
  facial_analysis: {
    smile: number;
    eyeContact: number;
    engagement: number;
    neutrality: number;
    confidence: number;
    facialExpressions: number;
  };
  body_analysis?: {
    posture: number;
    gestures: number;
    movement: number;
    presence: number;
  };
  response_analysis?: {
    clarity: number;
    relevance: number;
    structure: number;
    examples: number;
  };
  transcript?: string;
  feedback?: string;
  video_url?: string;
  // Database fields for skill calculations
  voice_modulation?: number;
  body_language?: number;
  problem_solving?: number;
  communication_style?: number;
  example_usage?: number;
  tone_language?: number;
  structure?: number;
  confidence?: number;
  relevance?: number;
  clarity?: number;
}

export const useInterviewData = () => {
  const { user } = useAuth();

  const { data: interviews, isLoading, error, refetch } = useQuery({
    queryKey: ['interviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching interviews:', error);
        throw error;
      }

      // Transform the data to match our expected types
      return data.map(interview => {
        // Cast Json types to object types with proper TypeScript handling
        const voiceAnalysis = interview.voice_analysis as Record<string, number>;
        const facialAnalysis = interview.facial_analysis as Record<string, number>;
        
        // Since we've now added these columns to the database, we can safely access them
        // But we still need to handle the case where they might be null (for older records)
        const bodyAnalysis = interview.body_analysis ? interview.body_analysis as Record<string, number> : {};
        const responseAnalysis = interview.response_analysis ? interview.response_analysis as Record<string, number> : {};
        
        return {
          ...interview,
          voice_analysis: {
            clarity: voiceAnalysis?.clarity || 0,
            pace: voiceAnalysis?.pace || 0,
            pitch: voiceAnalysis?.pitch || 0,
            tone: voiceAnalysis?.tone || 0,
            confidence: voiceAnalysis?.confidence || 0,
          },
          facial_analysis: {
            smile: facialAnalysis?.smile || 0,
            eyeContact: facialAnalysis?.eyeContact || 0,
            engagement: facialAnalysis?.engagement || 0,
            neutrality: facialAnalysis?.neutrality || 0,
            confidence: facialAnalysis?.confidence || 0,
            facialExpressions: facialAnalysis?.facialExpressions || 0,
          },
          body_analysis: {
            posture: bodyAnalysis?.posture || 0,
            gestures: bodyAnalysis?.gestures || 0,
            movement: bodyAnalysis?.movement || 0,
            presence: bodyAnalysis?.presence || 0,
          },
          response_analysis: {
            clarity: responseAnalysis?.clarity || 0,
            relevance: responseAnalysis?.relevance || 0, 
            structure: responseAnalysis?.structure || 0,
            examples: responseAnalysis?.examples || 0,
          }
        };
      }) as InterviewSession[];
    },
    enabled: !!user?.id,
  });

  const calculateSkillScores = () => {
    if (!interviews || interviews.length === 0) return {
      communication: 0,
      technicalKnowledge: 0,
      problemSolving: 0,
      confidence: 0,
      bodyLanguage: 0
    };

    // Calculate average scores using actual database columns for more accurate data
    const avgCommunication = interviews.reduce((sum, i) => sum + (i.communication_style || 0), 0) / interviews.length;
    const avgTechnical = interviews.reduce((sum, i) => sum + (i.clarity || 0), 0) / interviews.length;
    const avgProblemSolving = interviews.reduce((sum, i) => sum + (i.problem_solving || 0), 0) / interviews.length;
    const avgConfidence = interviews.reduce((sum, i) => sum + (i.confidence || 0), 0) / interviews.length;
    const avgBodyLanguage = interviews.reduce((sum, i) => sum + (i.body_language || 0), 0) / interviews.length;
    
    return {
      communication: Math.round(avgCommunication) || 0,
      technicalKnowledge: Math.round(avgTechnical) || 0,
      problemSolving: Math.round(avgProblemSolving) || 0,
      confidence: Math.round(avgConfidence) || 0,
      bodyLanguage: Math.round(avgBodyLanguage) || 0
    };
  };

  const calculateAverageSkill = (analysisType: 'voice_analysis' | 'facial_analysis' | 'body_analysis', metric: string) => {
    if (!interviews || interviews.length === 0) return 0;
    
    const total = interviews.reduce((sum, interview) => {
      // Try to get from the specific columns first, then from analysis objects
      if (analysisType === 'voice_analysis' && metric === 'clarity' && typeof interview.clarity === 'number') {
        return sum + interview.clarity;
      }
      if (analysisType === 'voice_analysis' && metric === 'confidence' && typeof interview.confidence === 'number') {
        return sum + interview.confidence;
      }
      
      const analysis = interview[analysisType] as any;
      return sum + (analysis && analysis[metric] ? analysis[metric] : 0);
    }, 0);
    
    return Math.round(total / interviews.length);
  };

  const generateAITips = () => {
    if (!interviews || interviews.length === 0) {
      return [
        "Complete your first interview to get personalized AI tips!",
        "Practice regularly to build confidence and improve your skills.",
        "Start with behavioral interviews to get comfortable with the format."
      ];
    }

    const skills = calculateSkillScores();
    const tips: string[] = [];

    if (skills.communication < 70) {
      tips.push("Work on speaking clearly and at a moderate pace to improve communication.");
    }

    if (skills.confidence < 70) {
      tips.push("Practice your answers out loud to build confidence before interviews.");
    }

    if (skills.bodyLanguage < 70) {
      tips.push("Focus on maintaining good posture and make appropriate eye contact during interviews.");
    }

    if (tips.length < 3) {
      tips.push("Try using the STAR method (Situation, Task, Action, Result) for behavioral questions.");
      tips.push("Before interviews, research the company and prepare questions to ask the interviewer.");
    }

    if (tips.length < 5) {
      tips.push("Review your past interviews to identify patterns and areas for improvement.");
      tips.push("Practice concise answers that stay on topic and directly address the question.");
    }

    return tips.slice(0, 5);
  };

  // Add auto-shortlist effect here
  // (Require optional import to not break code if hook not present in all contexts)
  try {
    // Dynamically import the auto shortlist logic if present
    // This avoids infinite loop if not wrapped in provider
    require("./useAutoShortlist").useAutoShortlist?.();
  } catch {}

  return {
    interviews: interviews || [],
    isLoading,
    error,
    refetch,
    totalInterviews: interviews?.length || 0,
    averageScore: interviews && interviews.length > 0
      ? Math.round(interviews.reduce((sum, interview) => sum + interview.score, 0) / interviews.length)
      : 0,
    lastInterviewDate: interviews && interviews.length > 0 ? interviews[0].date : null,
    skillScores: calculateSkillScores(),
    aiTips: generateAITips(),
  };
};
