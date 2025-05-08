
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Clock, MapPin, Users, Share2 } from "lucide-react";
import { Meetup, useMeetups } from "@/hooks/useMeetups";

interface MeetupCardProps {
  meetup: Meetup;
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { rsvpMeetup } = useMeetups();
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: meetup.title,
        text: `Join me at ${meetup.title}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{meetup.title}</CardTitle>
            <div className="flex items-center mt-1">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={meetup.avatar} />
                <AvatarFallback>{meetup.host.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-500">
                Hosted by {meetup.host}, {meetup.hostTitle}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge>{meetup.attendees}/{meetup.capacity} attending</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-4">{meetup.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span>{meetup.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{meetup.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{meetup.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span>{meetup.attendees} attending</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {meetup.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="justify-end border-t pt-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={() => rsvpMeetup(meetup.id)}>RSVP</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MeetupCard;
