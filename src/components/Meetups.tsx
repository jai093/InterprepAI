
import { useState } from "react";
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

// Meetups component
const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { meetups, isLoading, filterMeetups } = useMeetups();

  // Filter meetups based on search query
  const filteredMeetups = filterMeetups(searchQuery);

  return (
    <div className="container mx-auto px-4 pt-6 pb-12">
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
                      <MeetupCard key={meetup.id} meetup={meetup} />
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500">You haven't joined any meetups yet.</p>
                  <p className="text-gray-400 mt-1">RSVP to meetups to see them here.</p>
                  <Button className="mt-4">Browse All Meetups</Button>
                </CardContent>
              </Card>
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
                <p className="text-sm text-gray-500 mt-1">Oct 25, 2023 • Virtual</p>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <p className="font-medium">LinkedIn Profile Building</p>
                <p className="text-sm text-gray-500 mt-1">Oct 30, 2023 • Virtual</p>
              </div>
              <div>
                <p className="font-medium">FAANG Interview Prep</p>
                <p className="text-sm text-gray-500 mt-1">Nov 5, 2023 • San Francisco</p>
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
  );
};

export default Meetups;
