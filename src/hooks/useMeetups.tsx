import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for our meetups
export interface Meetup {
  id: string;
  title: string;
  host: string;
  host_title: string; // Changed from hostTitle to host_title to match DB schema
  avatar: string | null;
  date: string;
  time: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  attendees: number;
  capacity: number;
  description: string;
  tags: string[];
  user_id?: string;
  created_at?: string;
}

export function useMeetups() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch meetups from Supabase
  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('meetups')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Process the data to match our Meetup interface
        if (data) {
          const processedData: Meetup[] = data.map(meetup => {
            // Parse coordinates if they exist as string or as json object
            let coordinates = null;
            if (meetup.coordinates) {
              // If coordinates is already an object, use it directly
              if (typeof meetup.coordinates === 'object') {
                coordinates = meetup.coordinates;
              } 
              // Otherwise, try to parse it as JSON string
              else if (typeof meetup.coordinates === 'string') {
                try {
                  coordinates = JSON.parse(meetup.coordinates);
                } catch (e) {
                  console.error('Failed to parse coordinates:', meetup.coordinates);
                }
              }
            }
            
            return {
              ...meetup,
              coordinates,
              // Ensure tags is an array
              tags: Array.isArray(meetup.tags) ? meetup.tags : []
            } as Meetup;
          });
          
          setMeetups(processedData);
        } else {
          setMeetups([]);
        }
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching meetups:", err);
        setError(err.message || "Failed to load meetups");
        setIsLoading(false);
      }
    };
    
    fetchMeetups();
    
    // Set up realtime subscription for meetups
    const channel = supabase
      .channel('public:meetups')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meetups' 
      }, (payload) => {
        console.log('Realtime update:', payload);
        fetchMeetups(); // Refresh the data when changes occur
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter meetups based on search query
  const filterMeetups = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      return meetups;
    }
    
    const query = searchQuery.toLowerCase();
    return meetups.filter(
      (meetup) =>
        meetup.title.toLowerCase().includes(query) ||
        meetup.description.toLowerCase().includes(query) ||
        meetup.host.toLowerCase().includes(query) ||
        meetup.location.toLowerCase().includes(query) ||
        meetup.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [meetups]);

  // RSVP for a meetup
  const rsvpMeetup = useCallback(async (meetupId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to RSVP for meetups.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First get the current meetup
      const { data: meetup, error: fetchError } = await supabase
        .from('meetups')
        .select('*')
        .eq('id', meetupId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Check if capacity has been reached
      if (meetup.attendees >= meetup.capacity) {
        toast({
          title: "Meetup Full",
          description: "This meetup has reached its capacity.",
          variant: "destructive"
        });
        return;
      }
      
      // Update attendee count
      const { error: updateError } = await supabase
        .from('meetups')
        .update({ attendees: meetup.attendees + 1 })
        .eq('id', meetupId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "RSVP Successful",
        description: "You've successfully registered for this meetup.",
      });
    } catch (err: any) {
      console.error("Error RSVPing for meetup:", err);
      toast({
        title: "RSVP Failed",
        description: err.message || "Failed to register for meetup.",
        variant: "destructive"
      });
    }
  }, [toast, user]);
  
  // Create a new meetup
  const createMeetup = useCallback(async (newMeetup: Omit<Meetup, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create meetups.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Process coordinates for storage
      const meetupData = {
        ...newMeetup,
        user_id: user.id,
        coordinates: newMeetup.coordinates ? newMeetup.coordinates : null
      };
      
      const { error } = await supabase
        .from('meetups')
        .insert([meetupData]);
      
      if (error) throw error;
      
      toast({
        title: "Meetup Created",
        description: "Your meetup has been successfully created.",
      });
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Failed to create meetup:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create meetup. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  }, [user, toast]);

  return {
    meetups,
    isLoading,
    error,
    filterMeetups,
    rsvpMeetup,
    createMeetup
  };
}
