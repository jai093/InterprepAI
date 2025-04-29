
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
    posture: number;
    gestures: number;
  };
  transcript?: string;
  feedback?: string;
  video_url?: string;
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
      return data.map(interview => ({
        ...interview,
        voice_analysis: {
          clarity: interview.voice_analysis?.clarity || 0,
          pace: interview.voice_analysis?.pace || 0,
          pitch: interview.voice_analysis?.pitch || 0,
          tone: interview.voice_analysis?.tone || 0,
          confidence: interview.voice_analysis?.confidence || 0,
        },
        facial_analysis: {
          smile: interview.facial_analysis?.smile || 0,
          eyeContact: interview.facial_analysis?.eyeContact || 0,
          engagement: interview.facial_analysis?.engagement || 0,
          posture: interview.facial_analysis?.posture || 0,
          gestures: interview.facial_analysis?.gestures || 0,
        }
      })) as InterviewSession[];
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

    // Calculate average scores across all interviews
    return {
      communication: calculateAverageSkill('voice_analysis', 'clarity'),
      technicalKnowledge: calculateAverageSkill('voice_analysis', 'tone'),
      problemSolving: calculateAverageSkill('voice_analysis', 'pace'),
      confidence: calculateAverageSkill('voice_analysis', 'confidence'),
      bodyLanguage: calculateAverageSkill('facial_analysis', 'posture')
    };
  };

  const calculateAverageSkill = (analysisType: 'voice_analysis' | 'facial_analysis', metric: string) => {
    if (!interviews || interviews.length === 0) return 0;
    
    const total = interviews.reduce((sum, interview) => {
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
