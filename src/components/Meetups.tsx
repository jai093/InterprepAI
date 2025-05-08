
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, MapPin, Clock, Users, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock meetup data
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
  }
];

// Meetups component
const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter meetups based on search query
  const filteredMeetups = MOCK_MEETUPS.filter(
    (meetup) =>
      meetup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meetup.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meetup.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meetup.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <Button className="sm:w-auto w-full">Create Meetup</Button>
          </div>

          {/* Meetup tabs */}
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="your-meetups">Your Meetups</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <div className="space-y-6">
                {filteredMeetups.length > 0 ? (
                  filteredMeetups.map((meetup) => (
                    <Card key={meetup.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{meetup.title}</CardTitle>
                            <div className="flex items-center mt-1">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={meetup.avatar} />
                                <AvatarFallback>{meetup.host.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <CardDescription>
                                Hosted by {meetup.host}, {meetup.hostTitle}
                              </CardDescription>
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
                          <Button variant="outline">Share</Button>
                          <Button>RSVP</Button>
                        </div>
                      </CardFooter>
                    </Card>
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
    </div>
  );
};

export default Meetups;
