import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPin, Search, Filter, Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeetups } from "@/hooks/useMeetups";
import MeetupCard from "./meetups/MeetupCard";
import CreateMeetupDialog from "./meetups/CreateMeetupDialog";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { MeetupSidebarCard } from "./meetups/MeetupSidebarCard";

// Meetups component
const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { meetups, isLoading, filterMeetups } = useMeetups();
  const { user } = useAuth();
  const location = useLocation();
  
  // Get selected meetup ID and search term from URL query params
  const searchParams = new URLSearchParams(location.search);
  const selectedMeetupId = searchParams.get('selected');
  const searchFilterFromQuery = searchParams.get('search') || "";

  // Prepopulate search box on mount if search query param exists
  useEffect(() => {
    if (searchFilterFromQuery) {
      setSearchQuery(searchFilterFromQuery);
    }
  }, [searchFilterFromQuery]);

  // Filter meetups based on search query
  const filteredMeetups = filterMeetups(searchQuery);
  
  // User's created meetups
  const userMeetups = meetups.filter(meetup => 
    meetup.user_id === user?.id
  );

  // Get top hosts (based on number of meetups created)
  const getTopHosts = () => {
    const hostCounts = meetups.reduce((acc, meetup) => {
      acc[meetup.host] = (acc[meetup.host] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(hostCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1)
      .map(([host]) => {
        const hostMeetup = meetups.find(m => m.host === host);
        return hostMeetup ? {
          name: host,
          title: hostMeetup.host_title || "",
          avatar: hostMeetup.avatar || "",
          meetupCount: hostCounts[host]
        } : null;
      }).filter(Boolean)[0];
  };

  // Get featured meetups
  const getFeaturedMeetups = () => {
    return meetups
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 3);
  };

  const featuredHost = getTopHosts();
  const featuredMeetups = getFeaturedMeetups();
  
  // Scroll to selected meetup if any
  useEffect(() => {
    if (selectedMeetupId) {
      const element = document.getElementById(`meetup-${selectedMeetupId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedMeetupId]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Interview Prep Meetups</h1>
          <p className="text-gray-600 mt-1">Connect with professionals and peers for interview practice and guidance</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Main meetups area */}
          <div className="w-full md:w-3/4">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search meetups..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="sm:w-auto w-full">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Button 
                className="sm:w-auto w-full"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Meetup
              </Button>
            </div>

            {/* Meetup tabs */}
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="your-meetups">Your Meetups</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                {isLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-20 mb-4" />
                          <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-4" />
                            <Skeleton className="h-4" />
                            <Skeleton className="h-4" />
                            <Skeleton className="h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredMeetups.length > 0 ? (
                      filteredMeetups.map((meetup) => (
                        <div 
                          id={`meetup-${meetup.id}`} 
                          key={meetup.id}
                          className={selectedMeetupId === meetup.id.toString() ? 'ring-2 ring-interprepai-500 rounded-lg' : ''}
                        >
                          <MeetupCard meetup={meetup} isOwnedByUser={meetup.user_id === user?.id} />
                        </div>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <Search className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg text-gray-500">No meetups found matching your search.</p>
                          <p className="text-gray-400 mt-1">Try adjusting your search terms or filters.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="your-meetups">
                {userMeetups.length > 0 ? (
                  <div className="space-y-6">
                    {userMeetups.map((meetup) => (
                      <MeetupCard key={meetup.id} meetup={meetup} isOwnedByUser={true} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg text-gray-500">You haven't created any meetups yet.</p>
                      <p className="text-gray-400 mt-1">Create your first meetup to see it here.</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        Create a Meetup
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="past">
                {/* List past events with their location and a small static map */}
                {isLoading ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg text-gray-500">Loading past events...</p>
                    </CardContent>
                  </Card>
                ) : (() => {
                  // Get past meetups (date < today)
                  const today = new Date();
                  const pastMeetups = meetups.filter((meetup) => {
                    // Dates are stored as strings YYYY-MM-DD
                    // Handle timezone edge case by comparing date only
                    return new Date(meetup.date) < new Date(today.toISOString().slice(0, 10));
                  });

                  if (pastMeetups.length === 0) {
                    return (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <CalendarIcon className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg text-gray-500">No past events yet.</p>
                          <p className="text-gray-400 mt-1">Check back later for event recordings and notes.</p>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {pastMeetups.map((meetup) => (
                        <Card key={meetup.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{meetup.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={meetup.avatar || ""} />
                                <AvatarFallback className="text-xs">
                                  {meetup.host.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{meetup.host}</span>
                              <span className="text-gray-400">•</span>
                              <span>{meetup.host_title}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-2">
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
                            </div>
                            {meetup.coordinates && meetup.coordinates.lat && meetup.coordinates.lng && (
                              <div className="mt-2">
                                <GoogleMapsStaticEmbed
                                  lat={meetup.coordinates.lat}
                                  lng={meetup.coordinates.lng}
                                  address={meetup.location}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            {/* Host spotlight - dynamic based on database */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Host</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                {isLoading || !featuredHost ? (
                  <>
                    <Skeleton className="h-16 w-16 rounded-full mb-3" />
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-40 mb-3" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : (
                  <>
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarImage src={featuredHost.avatar || ""} />
                      <AvatarFallback>{featuredHost.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">{featuredHost.name}</h3>
                    <p className="text-sm text-gray-500">{featuredHost.title}</p>
                    <p className="text-sm mt-3 text-gray-600">
                      Host of {featuredHost.meetupCount} {featuredHost.meetupCount === 1 ? 'meetup' : 'meetups'}
                    </p>
                    {/* Make this button link to /meetups?search=host */}
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <a href={`/meetups?search=${encodeURIComponent(featuredHost.name)}`}>
                        View Meetups
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Meetup Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Technical Interviews
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Behavioral Questions
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Case Studies
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Mock Interviews
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Resume Workshops
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured events - now dynamic based on database */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <>
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                  </>
                ) : featuredMeetups && featuredMeetups.length > 0 ? (
                  <div className="space-y-2">
                    {featuredMeetups.map((meetup) => (
                      <MeetupSidebarCard key={meetup.id} meetup={meetup} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No featured events available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Create Meetup Dialog */}
        <CreateMeetupDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
};

export default Meetups;
