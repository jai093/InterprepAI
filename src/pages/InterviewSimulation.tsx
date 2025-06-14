import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InterviewSetup from "@/components/InterviewSetup";
import InterviewSession from "@/components/InterviewSession";
import FeedbackReport from "@/components/FeedbackReport";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import ElevenLabsInterviewWidget from "@/components/ElevenLabsInterviewWidget";

// Define the expected config type to match what InterviewSession expects
interface FullInterviewConfig {
  type: string;
  jobRole: string;
  duration: number;
  difficulty: string;
}

// Interface for the config from InterviewSetup
interface InterviewConfig {
  type: string;
  jobRole: string;
}

const InterviewSimulation = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Remove legacy interview states (setup/interview/feedback) and only show widget
  return (
    <ElevenLabsInterviewWidget />
  );
};

export default InterviewSimulation;
