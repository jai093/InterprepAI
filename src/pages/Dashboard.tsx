import { useState, useEffect } from "react";
import { Profile } from "@/components/Profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChartBar, TrendingUp, BarChart } from "lucide-react";
import { useInterviewData } from "@/hooks/useInterviewData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { format, parseISO } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    interviews, 
    isLoading, 
    totalInterviews, 
    averageScore, 
    lastInterviewDate,
    skillScores,
    aiTips,
    refetch // <- make sure we keep refetch from useInterviewData()
  } = useInterviewData();

  // NEW: Refetch when returning from simulation or after an interview
  // (simplest way: use window focus)
  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  // Format interview data for chart
  const chartData = interviews.slice(0).reverse().map(interview => ({
    date: format(parseISO(interview.date), 'MM/dd'),
    score: interview.score,
    name: interview.type
  }));

  // Create skill improvement data
  const skillImprovements = [
    {
      name: "Body Language",
      improvement: interviews.length > 1 ? "+5%" : "N/A",
      value: skillScores.bodyLanguage,
      color: skillScores.bodyLanguage > 70 ? "bg-green-500" : "bg-amber-500"
    },
    {
      name: "Technical Depth",
      improvement: interviews.length > 1 ? "+3%" : "N/A",
      value: skillScores.technicalKnowledge,
      color: skillScores.technicalKnowledge > 70 ? "bg-green-500" : "bg-amber-500"
    },
    {
      name: "Communication",
      improvement: interviews.length > 1 ? "-5%" : "N/A",
      value: skillScores.communication,
      color: skillScores.communication > 70 ? "bg-green-500" : "bg-amber-500"
    }
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-interprepai-600"></div>
        </div>
      );
    }

    if (interviews.length === 0) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-4">No interview data available yet</h3>
          <p className="text-gray-500 mb-6">Complete your first interview to see statistics and insights.</p>
          <Button asChild>
            <Link to="/simulation">Start Your First Interview</Link>
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-8">
            <TabsList className="grid grid-cols-3 mb-4 sm:mb-6 w-full">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
              <TabsTrigger value="tips" className="text-xs sm:text-sm">AI Tips</TabsTrigger>
            </TabsList>
            
            {renderContent()}

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm sm:text-base flex items-center">
                      <ChartBar className="mr-2 h-4 w-4" /> Interview Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-500">Total Interviews</span>
                        <span className="font-medium text-sm sm:text-base">{totalInterviews}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-500">Average Score</span>
                        <span className="font-medium text-sm sm:text-base">
                          {averageScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-500">Last Interview</span>
                        <span className="font-medium text-xs sm:text-sm">
                          {lastInterviewDate ? format(parseISO(lastInterviewDate), 'MM/dd/yy') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm sm:text-base flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" /> Skill Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                       {Object.entries(skillScores).map(([skill, value]) => (
                         <div key={skill} className="space-y-1">
                           <div className="flex justify-between">
                             <span className="text-xs sm:text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                             <span className="text-xs sm:text-sm font-medium">{value || 0}%</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                             <div 
                               className="h-1.5 sm:h-2 rounded-full bg-interprepai-600" 
                               style={{ width: `${value || 0}%` }}
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
                    {interviews.slice(0, 3).map(interview => (
                      <div key={interview.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{interview.type} Interview - {interview.role}</p>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(interview.date), 'yyyy-MM-dd')} · {interview.duration}
                          </p>
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
                  <CardTitle className="text-sm sm:text-base">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="font-medium mb-2 text-sm sm:text-base">Score Trend</h3>
                      <div className="h-48 sm:h-64 w-full">
                        {chartData.length > 0 ? (
                          <div className="w-full h-full">
                            <ChartContainer
                              config={{
                                score: {
                                  label: "Score",
                                  theme: {
                                    light: "#3b82f6",
                                    dark: "#60a5fa",
                                  },
                                },
                              }}
                              className="h-full w-full"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                  <XAxis 
                                    dataKey="date" 
                                    fontSize={12}
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis 
                                    domain={[0, 100]} 
                                    fontSize={12}
                                    tick={{ fontSize: 12 }}
                                  />
                                  <Tooltip />
                                  <Line
                                    type="monotone"
                                    dataKey="score"
                                    name="Score"
                                    stroke="#3b82f6"
                                    activeDot={{ r: 6 }}
                                    strokeWidth={2}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                            <p className="text-gray-500 text-xs sm:text-sm text-center px-4">Complete more interviews to see your progress</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2 text-sm sm:text-base">Improvement Areas</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {skillImprovements.map((skill, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs sm:text-sm">{skill.name}</span>
                              <span className="text-xs">{skill.improvement}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                              <div className={`h-1.5 sm:h-2 rounded-full ${skill.color}`} style={{ width: `${skill.value}%` }}></div>
                            </div>
                          </div>
                        ))}
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
                      Based on your interview performance, here are personalized tips to help you improve:
                    </p>
                    
                    <div className="space-y-3">
                      {aiTips.map((tip, index) => (
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
