
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, MessageCircle, Users, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock community data
const MOCK_DISCUSSIONS = [
  {
    id: 1,
    title: "How to answer 'Tell me about yourself'?",
    author: "Alex Johnson",
    avatar: "",
    content: "I always struggle with this common interview question. Any tips on structuring a concise yet comprehensive answer?",
    likes: 24,
    comments: 8,
    date: "2 days ago"
  },
  {
    id: 2,
    title: "Technical interview preparation for software engineers",
    author: "Priya Mehta",
    avatar: "",
    content: "I have a technical interview coming up for a senior developer role. What are some effective ways to prepare for coding challenges?",
    likes: 36,
    comments: 12,
    date: "1 day ago"
  },
  {
    id: 3,
    title: "Behavioral questions in finance interviews",
    author: "Michael Chen",
    avatar: "",
    content: "Could anyone share common behavioral questions asked in investment banking interviews and strategies to answer them effectively?",
    likes: 18,
    comments: 7,
    date: "4 hours ago"
  }
];

// Component for the community section
const Community = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="container mx-auto px-4 pt-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Main discussion area */}
        <div className="w-full md:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Community Discussions</h1>
              <p className="text-gray-600 mt-1">Connect with others preparing for interviews</p>
            </div>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" /> New Post
            </Button>
          </div>

          <Tabs defaultValue="trending">
            <TabsList className="mb-4">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="answered">Answered</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trending">
              <div className="space-y-4">
                {MOCK_DISCUSSIONS.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={discussion.avatar} />
                            <AvatarFallback>{discussion.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{discussion.author}</p>
                            <p className="text-xs text-gray-500">{discussion.date}</p>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{discussion.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{discussion.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-3">
                      <div className="flex space-x-3">
                        <Button variant="ghost" size="sm" className="text-gray-600">
                          <ThumbsUp className="h-4 w-4 mr-1" /> {discussion.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600">
                          <MessageCircle className="h-4 w-4 mr-1" /> {discussion.comments}
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">View Discussion</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">Recent discussions will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="answered">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">Answered discussions will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/4 space-y-6">
          {/* Community stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" /> Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-medium">1,243</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discussions:</span>
                  <span className="font-medium">387</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Online now:</span>
                  <span className="font-medium">42</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick chat */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Chat</CardTitle>
              <CardDescription>Ask a question to the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] overflow-y-auto bg-gray-50 p-3 rounded-md mb-3">
                <p className="text-center text-gray-500 text-sm">Start a conversation with the community</p>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your message..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trending topics */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  #TechnicalInterviews
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  #BehavioralQuestions
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  #SalaryNegotiation
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  #RemoteWork
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;
