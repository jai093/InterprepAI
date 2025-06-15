
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";
import { useInterviewData } from "./useInterviewData";
import { toast } from "@/components/ui/use-toast";

/**
 * Automatically shortlists a user if their average score ≥ 80.
 * Sends profile/resume/performance feedback to all recruiters if not yet shortlisted.
 */
export function useAutoShortlist() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { interviews, averageScore } = useInterviewData();

  useEffect(() => {
    const checkAndShortlist = async () => {
      if (!user?.id || !profile) return;
      // Only proceed if score is high enough and at least 1 interview exists
      if (!interviews || interviews.length === 0 || averageScore < 80) return;

      // Query shortlistings to see if user already shortlisted
      const { data: existing, error: shortlistErr } = await supabase
        .from("shortlistings")
        .select("*")
        .eq("user_id", user.id);

      if (shortlistErr) {
        toast({ title: "Error", description: "Failed to check shortlisting status.", variant: "destructive" });
        return;
      }
      if (existing && existing.length > 0) {
        // User is already shortlisted with at least one recruiter, do nothing
        return;
      }

      // Get all recruiters
      const { data: recruiters, error: recruiterErr } = await supabase
        .from("recruiters")
        .select("*");

      if (recruiterErr) {
        toast({ title: "Error", description: "Failed to get recruiters list.", variant: "destructive" });
        return;
      }
      if (!recruiters || recruiters.length === 0) return;

      // For each recruiter, add shortlist
      for (const hr of recruiters) {
        // Insert unless already exists (unique constraint will prevent duplicates)
        await supabase
          .from("shortlistings")
          .insert([{
            user_id: user.id,
            recruiter_id: hr.id,
            user_score: averageScore,
            feedback: interviews[0].feedback || "",
            status: "pending"
          }]);
      }
      // Optionally trigger "share" function (email/notification/etc)—stub
      // This would be replaced by integration with HR dashboard, email, etc.
      toast({
        title: "Congratulations!",
        description: "You've crossed 80% and have been shortlisted for recruiters. Your profile will be shared.",
      });
    };

    checkAndShortlist();
    // Run this whenever interviews or score change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, averageScore, interviews.length]);
}
