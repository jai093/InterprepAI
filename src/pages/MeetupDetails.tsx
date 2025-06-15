import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { useMeetups } from "@/hooks/useMeetups";
import { useMeetupAttendance } from "@/hooks/useMeetupAttendance";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import GoogleMapsStaticEmbed from "@/components/meetups/GoogleMapsStaticEmbed";

const MeetupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meetups, isLoading } = useMeetups();
  const { rsvpMeetup, checkAttendance, getAttendanceCount, isLoading: isRsvpLoading } = useMeetupAttendance();
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);

  const meetup = meetups.find(m => m.id === id);

  useEffect(() => {
    if (id && meetup) {
      // Get attendance count
      getAttendanceCount(id).then(count => {
        setAttendanceCount(count);
      });
      
      // Check if user is registered
      checkAttendance(id).then(registered => {
        setIsRegistered(registered);
      });
    }
  }, [id, meetup, getAttendanceCount, checkAttendance]);

  const handleRSVP = async () => {
    if (id) {
      const success = await rsvpMeetup(id);
      if (success) {
        setIsRegistered(true);
        setAttendanceCount(prev => prev + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h1 className="text-2xl font-bold mb-4">Meetup Not Found</h1>
              <p className="text-gray-600 mb-4">The meetup you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/meetups')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Meetups
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button 
          variant="outline" 
          onClick={() => navigate('/meetups')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetups
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{meetup.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {meetup.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {meetup.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {attendanceCount}/{meetup.capacity} attendees
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {!isRegistered ? (
                  <Button 
                    onClick={handleRSVP}
                    disabled={isRsvpLoading || attendanceCount >= meetup.capacity}
                    className="ml-4"
                  >
                    {isRsvpLoading ? "Registering..." : "RSVP"}
                  </Button>
                ) : (
                  <Badge variant="secondary" className="ml-4">
                    Registered
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Host Information */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={meetup.avatar || ""} />
                <AvatarFallback>{meetup.host.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{meetup.host}</h3>
                <p className="text-sm text-gray-600">{meetup.host_title}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">About this meetup</h3>
              <p className="text-gray-700">{meetup.description}</p>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              <p className="text-gray-700">{meetup.location}</p>
              {meetup.coordinates && meetup.coordinates.lat && meetup.coordinates.lng && (
                <div className="mt-2">
                  <GoogleMapsStaticEmbed
                    lat={meetup.coordinates.lat}
                    lng={meetup.coordinates.lng}
                    address={meetup.location}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            {meetup.tags && meetup.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {meetup.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeetupDetails;
