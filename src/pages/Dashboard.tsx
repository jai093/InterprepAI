
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Dashboard = () => {
  // Mock data for past interviews
  const pastInterviews = [
    {
      id: 1,
      date: "April 22, 2025",
      type: "Behavioral Interview",
      score: 85,
      strengths: ["Communication", "Problem Solving"],
      improvements: ["Body Language", "Conciseness"]
    },
    {
      id: 2,
      date: "April 18, 2025",
      type: "Technical Interview",
      score: 72,
      strengths: ["Technical Knowledge", "Confidence"],
      improvements: ["Communication", "Pacing"]
    },
    {
      id: 3,
      date: "April 10, 2025",
      type: "Behavioral Interview",
      score: 78,
      strengths: ["Engagement", "Examples Used"],
      improvements: ["Eye Contact", "Voice Projection"]
    }
  ];

  // Mock data for recommended practices
  const recommendedPractices = [
    {
      id: 1,
      title: "Behavioral Interview",
      description: "Practice answering common behavioral questions using the STAR method.",
      difficulty: "Medium",
      duration: "20 min"
    },
    {
      id: 2,
      title: "Technical Interview",
      description: "Test your technical knowledge with role-specific questions.",
      difficulty: "Hard",
      duration: "30 min"
    },
    {
      id: 3,
      title: "Salary Negotiation",
      description: "Practice discussing compensation expectations confidently.",
      difficulty: "Medium",
      duration: "15 min"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Your Dashboard</h1>
              <p className="text-gray-600">Track your progress and practice for your next interview</p>
            </div>
            <Button className="mt-4 md:mt-0 bg-interprepai-700 hover:bg-interprepai-800" asChild>
              <Link to="/simulation">Start New Interview</Link>
            </Button>
          </div>
          
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-xs text-gray-500 mt-1">+3 this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78%</div>
                <p className="text-xs text-green-500 mt-1">+5% improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Practice Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5 days</div>
                <p className="text-xs text-gray-500 mt-1">Keep it up!</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="past" className="mb-8">
            <TabsList>
              <TabsTrigger value="past">Past Interviews</TabsTrigger>
              <TabsTrigger value="recommended">Recommended Practice</TabsTrigger>
            </TabsList>
            
            <TabsContent value="past" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {pastInterviews.map((interview) => (
                  <Card key={interview.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{interview.type}</h3>
                          <p className="text-gray-500">{interview.date}</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center">
                          <div className="w-12 h-12 rounded-full bg-interprepai-100 flex items-center justify-center mr-4">
                            <span className="font-bold text-interprepai-700">{interview.score}%</span>
                          </div>
                          <Button variant="outline" size="sm">View Report</Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Strengths</h4>
                          <div className="flex flex-wrap gap-2">
                            {interview.strengths.map((strength, i) => (
                              <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Areas for Improvement</h4>
                          <div className="flex flex-wrap gap-2">
                            {interview.improvements.map((improvement, i) => (
                              <span key={i} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                                {improvement}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recommended" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedPractices.map((practice) => (
                  <Card key={practice.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">{practice.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{practice.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>Difficulty: {practice.difficulty}</span>
                          <span>{practice.duration}</span>
                        </div>
                        <Button className="w-full bg-interprepai-700 hover:bg-interprepai-800">Start Practice</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Skills Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Your Skills</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { skill: "Communication", score: 85 },
                    { skill: "Body Language", score: 70 },
                    { skill: "Technical Knowledge", score: 90 },
                    { skill: "Problem Solving", score: 80 },
                    { skill: "Confidence", score: 75 },
                    { skill: "Adaptability", score: 65 }
                  ].map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span>{skill.skill}</span>
                        <span className="text-sm font-medium">{skill.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-interprepai-600 h-2 rounded-full" 
                          style={{ width: `${skill.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
