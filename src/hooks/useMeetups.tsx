
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

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
}

// Mock meetup data - in a real app, this would come from your backend
const MOCK_MEETUPS = [
  {
    id: 1,
    title: "Tech Interview Strategies Workshop",
    host: "Sarah Chen",
    hostTitle: "Senior Engineering Manager at TechCorp",
    avatar: "",
    date: "Oct 15, 2023",
    time: "6:00 PM - 8:00 PM",
    location: "Virtual",
    attendees: 45,
    capacity: 100,
    description: "Join us for an interactive workshop on mastering technical interviews. We'll cover common questions, live coding exercises, and strategies for explaining complex concepts.",
    tags: ["Technical", "Engineering", "Coding"]
  },
  {
    id: 2,
    title: "Behavioral Interview Masterclass",
    host: "James Wilson",
    hostTitle: "HR Director at Global Innovations",
    avatar: "",
    date: "Oct 18, 2023",
    time: "5:30 PM - 7:30 PM",
    location: "San Francisco, CA",
    attendees: 28,
    capacity: 50,
    description: "Learn how to effectively respond to behavioral questions using the STAR method. This session includes practice rounds and personalized feedback.",
    tags: ["Behavioral", "Leadership", "HR"]
  },
  {
    id: 3,
    title: "Finance Industry Interview Prep",
    host: "Priya Mehta",
    hostTitle: "Investment Banking VP at FinTech Solutions",
    avatar: "",
    date: "Oct 21, 2023",
    time: "4:00 PM - 5:30 PM",
    location: "New York, NY",
    attendees: 35,
    capacity: 40,
    description: "Specifically tailored for finance professionals, this meetup covers technical finance questions, market knowledge assessments, and industry-specific behavioral questions.",
    tags: ["Finance", "Investment", "Banking"]
  },
  {
    id: 4,
    title: "Product Management Interview Deep Dive",
    host: "Alex Thompson",
    hostTitle: "Senior PM at ProductHub",
    avatar: "",
    date: "Oct 25, 2023",
    time: "7:00 PM - 9:00 PM",
    location: "Virtual",
    attendees: 32,
    capacity: 60,
    description: "Prepare for product management interviews with this comprehensive workshop covering product sense, analytical thinking, and execution questions.",
    tags: ["Product", "Strategy", "Analytics"]
  },
  {
    id: 5,
    title: "Healthcare Industry Interview Strategies",
    host: "Dr. Maria Rodriguez",
    hostTitle: "Director of Operations at HealthFirst",
    avatar: "",
    date: "Nov 2, 2023",
    time: "6:30 PM - 8:00 PM",
    location: "Chicago, IL",
    attendees: 22,
    capacity: 40,
    description: "Focus on healthcare-specific interview questions and scenarios. Learn how to effectively communicate your experience in patient care, healthcare regulations, and medical technologies.",
    tags: ["Healthcare", "Medical", "Compliance"]
  }
];

export function useMeetups() {
  const [meetups, setMeetups] = useState<Meetup[]>(MOCK_MEETUPS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter meetups based on search query
  const filterMeetups = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      return MOCK_MEETUPS;
    }
    
    const query = searchQuery.toLowerCase();
    return MOCK_MEETUPS.filter(
      (meetup) =>
        meetup.title.toLowerCase().includes(query) ||
        meetup.description.toLowerCase().includes(query) ||
        meetup.host.toLowerCase().includes(query) ||
        meetup.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, []);

  // RSVP for a meetup
  const rsvpMeetup = useCallback((meetupId: number) => {
    setMeetups(prevMeetups => 
      prevMeetups.map(meetup => 
        meetup.id === meetupId && meetup.attendees < meetup.capacity
          ? { ...meetup, attendees: meetup.attendees + 1 }
          : meetup
      )
    );
    
    toast({
      title: "RSVP Successful",
      description: "You've successfully registered for this meetup.",
    });
  }, [toast]);
  
  // Create a new meetup
  const createMeetup = useCallback((newMeetup: Omit<Meetup, 'id'>) => {
    setIsLoading(true);
    
    try {
      // In a real application, this would be an API call
      const meetupWithId = {
        ...newMeetup,
        id: meetups.length + 1 // Simple ID generation for mock
      };
      
      setMeetups(prevMeetups => [meetupWithId, ...prevMeetups]);
      
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
  }, [meetups, toast]);

  return {
    meetups,
    isLoading,
    error,
    filterMeetups,
    rsvpMeetup,
    createMeetup
  };
}
