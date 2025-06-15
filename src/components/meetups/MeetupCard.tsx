
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, MapPin, Users, Clock, Share2 } from "lucide-react";
import { Meetup } from "@/hooks/useMeetups";
import { useMeetupAttendance } from "@/hooks/useMeetupAttendance";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface MeetupCardProps {
  meetup: Meetup;
  isOwnedByUser?: boolean;
}

const MeetupCard = ({ meetup, isOwnedByUser = false }: MeetupCardProps) => {
  const { rsvpMeetup, checkAttendance, getAttendanceCount, isLoading } = useMeetupAttendance();
  const [attendanceCount, setAttendanceCount] = useState(meetup.attendees);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get real-time attendance count
    getAttendanceCount(meetup.id).then(count => {
      setAttendanceCount(count);
    });
    
    // Check if user is registered
    checkAttendance(meetup.id).then(registered => {
      setIsRegistered(registered);
    });
  }, [meetup.id, getAttendanceCount, checkAttendance]);

  const handleRSVP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await rsvpMeetup(meetup.id);
    if (success) {
      setIsRegistered(true);
      setAttendanceCount(prev => prev + 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const meetupUrl = `${window.location.origin}/meetups/${meetup.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: meetup.title,
          text: meetup.description,
          url: meetupUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(meetupUrl);
        toast({
          title: "Link Copied",
          description: "Meetup link copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCardClick = () => {
    // Fix: route to /meetup/:id (NOT /meetups/:id)
    navigate(`/meetup/${meetup.id}`);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{meetup.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={meetup.avatar || ""} />
                <AvatarFallback className="text-xs">{meetup.host.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{meetup.host}</span>
              <span className="text-gray-400">•</span>
              <span>{meetup.host_title}</span>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-3">{meetup.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{meetup.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{meetup.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{meetup.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{attendanceCount}/{meetup.capacity} attendees</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {meetup.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {attendanceCount >= meetup.capacity ? (
              <span className="text-red-500 font-medium">Full</span>
            ) : (
              <span>{meetup.capacity - attendanceCount} spots left</span>
            )}
          </div>
          
          <div className="flex gap-2">
            {isOwnedByUser ? (
              <Badge variant="outline">Your Event</Badge>
            ) : !isRegistered ? (
              <Button 
                size="sm" 
                onClick={handleRSVP}
                disabled={isLoading || attendanceCount >= meetup.capacity}
              >
                {isLoading ? "Joining..." : "RSVP"}
              </Button>
            ) : (
              <Badge variant="secondary">Registered</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetupCard;
