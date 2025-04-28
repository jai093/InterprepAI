
import { useState } from "react";
import { Profile } from "@/components/Profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChartBar, TrendingUp } from "lucide-react";

// Mock data for progress tracking
const mockInterviewHistory = [
  {
    id: 1,
    date: "2023-06-15",
    type: "Behavioral",
    role: "Product Manager",
    score: 78,
    duration: "18 minutes"
  },
  {
    id: 2,
    date: "2023-06-21",
    type: "Technical",
    role: "Software Engineer",
    score: 65,
    duration: "22 minutes"
  },
  {
    id: 3,
    date: "2023-07-02",
    type: "Behavioral",
    role: "Software Engineer",
    score: 82,
    duration: "15 minutes"
  }
];

const mockSkillsData = {
  communication: 75,
  technicalKnowledge: 68,
  problemSolving: 82,
  confidence: 70,
  bodyLanguage: 65
};

const mockAITips = [
  "Try using the STAR method (Situation, Task, Action, Result) for behavioral questions.",
  "For technical interviews, explain your thought process out loud as you solve problems.",
  "Maintain eye contact with the camera to demonstrate confidence and engagement.",
  "Prepare 3-5 concrete examples from your past experience to illustrate key skills.",
  "Practice concise answers that stay on topic and directly address the question."
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="tips">AI Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <ChartBar className="mr-2 h-4 w-4" /> Interview Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Interviews</span>
                        <span className="font-medium">{mockInterviewHistory.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Average Score</span>
                        <span className="font-medium">
                          {Math.round(mockInterviewHistory.reduce((acc, item) => acc + item.score, 0) / mockInterviewHistory.length)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last Interview</span>
                        <span className="font-medium">{mockInterviewHistory[mockInterviewHistory.length - 1].date}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" /> Skill Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(mockSkillsData).map(([skill, value]) => (
                        <div key={skill} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-xs font-medium">{value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-interprepai-600" 
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockInterviewHistory.slice(0).reverse().map(interview => (
                      <div key={interview.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{interview.type} Interview - {interview.role}</p>
                          <p className="text-sm text-gray-500">{interview.date} · {interview.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-interprepai-700">{interview.score}%</p>
                          <Button variant="link" className="text-xs p-0 h-auto">View Report</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button asChild>
                      <Link to="/simulation">Start New Interview</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Score Trend</h3>
                      <div className="h-40 bg-gray-100 flex items-end justify-between px-2 rounded-md">
                        {mockInterviewHistory.map((interview, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div 
                              className="w-10 bg-interprepai-600 rounded-t-sm" 
                              style={{ height: `${interview.score * 0.4}%` }}
                            ></div>
                            <p className="text-xs mt-2">{interview.date.split('-')[2]}/{interview.date.split('-')[1]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Improvement Areas</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Body Language</span>
                            <span className="text-xs">+5% since last interview</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-green-500" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Technical Depth</span>
                            <span className="text-xs">+3% since last interview</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-amber-500" style={{ width: '58%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Filler Words</span>
                            <span className="text-xs">-20% since last interview</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-green-500" style={{ width: '72%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tips">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Interview Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Based on your past interview performance, here are personalized tips to help you improve:
                    </p>
                    
                    <div className="space-y-3">
                      {mockAITips.map((tip, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-interprepai-100 text-interprepai-700 flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Practice Recommendations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button variant="outline" className="justify-start" asChild>
                          <Link to="/simulation">
                            Technical Interview Practice
                          </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                          <Link to="/simulation">
                            Behavioral Question Practice
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Profile />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
