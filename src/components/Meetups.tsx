
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPin, Search, Filter, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeetups } from "@/hooks/useMeetups";
import MeetupCard from "./meetups/MeetupCard";
import CreateMeetupDialog from "./meetups/CreateMeetupDialog";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Meetups component
const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { meetups, isLoading, filterMeetups } = useMeetups();
  const { user } = useAuth();
  const location = useLocation();
  
  // Get selected meetup ID from URL query params
  const searchParams = new URLSearchParams(location.search);
  const selectedMeetupId = searchParams.get('selected');

  // Filter meetups based on search query
  const filteredMeetups = filterMeetups(searchQuery);
  
  // User's created meetups
  const userMeetups = meetups.filter(meetup => 
    meetup.user_id === user?.id
  );
  
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
      <Header>
        <div className="lg:hidden">
          <SidebarTrigger />
        </div>
      </Header>
      
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
                          <MeetupCard meetup={meetup} />
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
                      <MeetupCard key={meetup.id} meetup={meetup} isOwnedByUser />
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
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg text-gray-500">Past events will appear here.</p>
                    <p className="text-gray-400 mt-1">Check back later for event recordings and notes.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            {/* Host spotlight */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Host</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarImage src="" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-sm text-gray-500">Technical Recruiting Lead at BigTech</p>
                <p className="text-sm mt-3 text-gray-600">
                  15 years experience in technical recruiting with expertise in software engineering interviews.
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View Profile
                </Button>
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

            {/* Upcoming featured events */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-b border-gray-100 pb-2">
                  <p className="font-medium">Resume Workshop</p>
                  <p className="text-sm text-gray-500 mt-1">May 25, 2025 • Virtual</p>
                </div>
                <div className="border-b border-gray-100 pb-2">
                  <p className="font-medium">LinkedIn Profile Building</p>
                  <p className="text-sm text-gray-500 mt-1">May 30, 2025 • Virtual</p>
                </div>
                <div>
                  <p className="font-medium">FAANG Interview Prep</p>
                  <p className="text-sm text-gray-500 mt-1">June 5, 2025 • San Francisco</p>
                </div>
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
