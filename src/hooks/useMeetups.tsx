
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for our meetups
export interface Meetup {
  id: number;
  title: string;
  host: string;
  hostTitle: string;
  avatar: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  capacity: number;
  description: string;
  tags: string[];
  user_id?: string;
}

export function useMeetups() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch meetups from local storage or initialize with empty array
  useEffect(() => {
    const fetchMeetups = () => {
      try {
        const storedMeetups = localStorage.getItem('meetups');
        if (storedMeetups) {
          setMeetups(JSON.parse(storedMeetups));
        } else {
          // Initialize with some sample meetups if none exist
          const initialMeetups = [
            {
              id: 1,
              title: "Tech Interview Strategies Workshop",
              host: "Sarah Chen",
              hostTitle: "Senior Engineering Manager at TechCorp",
              avatar: "",
              date: "May 15, 2025",
              time: "6:00 PM - 8:00 PM",
              location: "Virtual",
              attendees: 45,
              capacity: 100,
              description: "Join us for an interactive workshop on mastering technical interviews. We'll cover common questions, live coding exercises, and strategies for explaining complex concepts.",
              tags: ["Technical", "Engineering", "Coding"],
              user_id: "sample-user-1"
            },
            {
              id: 2,
              title: "Behavioral Interview Masterclass",
              host: "James Wilson",
              hostTitle: "HR Director at Global Innovations",
              avatar: "",
              date: "May 18, 2025",
              time: "5:30 PM - 7:30 PM",
              location: "San Francisco, CA",
              attendees: 28,
              capacity: 50,
              description: "Learn how to effectively respond to behavioral questions using the STAR method. This session includes practice rounds and personalized feedback.",
              tags: ["Behavioral", "Leadership", "HR"],
              user_id: "sample-user-2"
            },
            {
              id: 3,
              title: "Finance Industry Interview Prep",
              host: "Priya Mehta",
              hostTitle: "Investment Banking VP at FinTech Solutions",
              avatar: "",
              date: "May 21, 2025",
              time: "4:00 PM - 5:30 PM",
              location: "New York, NY",
              attendees: 35,
              capacity: 40,
              description: "Specifically tailored for finance professionals, this meetup covers technical finance questions, market knowledge assessments, and industry-specific behavioral questions.",
              tags: ["Finance", "Investment", "Banking"],
              user_id: "sample-user-3"
            }
          ];
          
          setMeetups(initialMeetups);
          localStorage.setItem('meetups', JSON.stringify(initialMeetups));
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching meetups:", err);
        setError("Failed to load meetups");
        setIsLoading(false);
      }
    };
    
    fetchMeetups();
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
        meetup.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [meetups]);

  // RSVP for a meetup
  const rsvpMeetup = useCallback((meetupId: number) => {
    setMeetups(prevMeetups => {
      const updatedMeetups = prevMeetups.map(meetup => 
        meetup.id === meetupId && meetup.attendees < meetup.capacity
          ? { ...meetup, attendees: meetup.attendees + 1 }
          : meetup
      );
      
      localStorage.setItem('meetups', JSON.stringify(updatedMeetups));
      return updatedMeetups;
    });
    
    toast({
      title: "RSVP Successful",
      description: "You've successfully registered for this meetup.",
    });
  }, [toast]);
  
  // Create a new meetup
  const createMeetup = useCallback((newMeetup: Omit<Meetup, 'id' | 'user_id'>) => {
    setIsLoading(true);
    
    try {
      setMeetups(prevMeetups => {
        const meetupId = prevMeetups.length > 0 
          ? Math.max(...prevMeetups.map(m => m.id)) + 1 
          : 1;
        
        const meetupWithId = {
          ...newMeetup,
          id: meetupId,
          user_id: user?.id || 'unknown'
        };
        
        const updatedMeetups = [meetupWithId, ...prevMeetups];
        localStorage.setItem('meetups', JSON.stringify(updatedMeetups));
        
        return updatedMeetups;
      });
      
      toast({
        title: "Meetup Created",
        description: "Your meetup has been successfully created.",
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setError("Failed to create meetup");
      toast({
        title: "Error",
        description: "Failed to create meetup. Please try again.",
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
