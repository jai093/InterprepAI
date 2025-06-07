
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AttendeeRecord {
  id: string;
  meetup_id: string;
  user_id: string;
  created_at: string;
}

export function useMeetupAttendance() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is already registered for a meetup
  const checkAttendance = useCallback(async (meetupId: string) => {
    if (!user) return false;
    
    try {
      // Use type assertion to work with the meetup_attendees table
      const { data, error } = await (supabase as any)
        .from('meetup_attendees')
        .select('id')
        .eq('meetup_id', meetupId)
        .eq('user_id', user.id)
        .single();
      
      return !!data && !error;
    } catch (error) {
      return false;
    }
  }, [user]);

  // Get attendance count for a meetup
  const getAttendanceCount = useCallback(async (meetupId: string) => {
    try {
      const { count, error } = await (supabase as any)
        .from('meetup_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('meetup_id', meetupId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting attendance count:', error);
      return 0;
    }
  }, []);

  // RSVP for a meetup
  const rsvpMeetup = useCallback(async (meetupId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to RSVP for meetups.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Check if already registered
      const isAlreadyRegistered = await checkAttendance(meetupId);
      if (isAlreadyRegistered) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this meetup.",
          variant: "destructive"
        });
        setIsLoading(false);
        return false;
      }

      // Get current meetup details
      const { data: meetup, error: fetchError } = await supabase
        .from('meetups')
        .select('capacity')
        .eq('id', meetupId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Get current attendance count
      const currentAttendees = await getAttendanceCount(meetupId);
      
      // Check if capacity has been reached
      if (currentAttendees >= meetup.capacity) {
        toast({
          title: "Meetup Full",
          description: "This meetup has reached its capacity.",
          variant: "destructive"
        });
        setIsLoading(false);
        return false;
      }
      
      // Add user to attendees using type assertion
      const { error: insertError } = await (supabase as any)
        .from('meetup_attendees')
        .insert([
          {
            meetup_id: meetupId,
            user_id: user.id
          }
        ]);
      
      if (insertError) throw insertError;
      
      toast({
        title: "RSVP Successful",
        description: "You've successfully registered for this meetup.",
      });
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error RSVPing for meetup:", err);
      toast({
        title: "RSVP Failed",
        description: err.message || "Failed to register for meetup.",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  }, [toast, user, checkAttendance, getAttendanceCount]);

  return {
    rsvpMeetup,
    checkAttendance,
    getAttendanceCount,
    isLoading
  };
}
