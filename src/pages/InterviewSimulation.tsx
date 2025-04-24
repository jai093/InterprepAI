
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeedbackReport from "@/components/FeedbackReport";

const InterviewSimulation = () => {
  const { toast } = useToast();
  
  // States for different interview stages
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const [selectedType, setSelectedType] = useState("behavioral");
  const [isRecording, setIsRecording] = useState(false);
  
  // Mock interview question data
  const questions = {
    behavioral: [
      "Tell me about yourself.",
      "Describe a challenging situation at work and how you handled it.",
      "What is your greatest professional achievement?",
      "How do you handle stress and pressure?",
      "Tell me about a time you demonstrated leadership skills."
    ],
    technical: [
      "Explain how you would approach solving a complex technical problem.",
      "Describe your experience with agile development methodologies.",
      "How do you stay updated with the latest industry trends?",
      "Tell me about a project where you implemented a technical solution.",
      "How do you ensure quality in your work?"
    ],
    roleSpecific: [
      "Why are you interested in this specific role?",
      "How does your previous experience prepare you for this position?",
      "What unique skills would you bring to this role?",
      "How would you handle a challenging stakeholder in this position?",
      "Where do you see yourself in 5 years in this career path?"
    ]
  };
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Mock feedback data
  const mockFeedback = {
    date: "April 24, 2025",
    duration: "15 minutes",
    overallScore: 78,
    responsesAnalysis: {
      clarity: 82,
      relevance: 75,
      structure: 68,
      examples: 80
    },
    nonVerbalAnalysis: {
      eyeContact: 65,
      facialExpressions: 72,
      bodyLanguage: 68
    },
    voiceAnalysis: {
      pace: 85,
      tone: 75,
      clarity: 80,
      confidence: 72
    },
    strengths: [
      "Strong use of concrete examples",
      "Clear communication style",
      "Appropriate response length",
      "Maintained positive demeanor"
    ],
    improvements: [
      "Maintain more consistent eye contact",
      "Reduce filler words like 'um' and 'uh'",
      "Improve structure in longer responses",
      "Use more hand gestures to emphasize points"
    ],
    recommendations: [
      "Practice the STAR method for behavioral questions",
      "Record yourself to monitor eye contact patterns",
      "Try speaking more slowly during technical explanations",
      "Prepare 2-3 more examples for common questions"
    ]
  };
  
  const startInterview = () => {
    setStage("interview");
    setCurrentQuestionIndex(0);
    toast({
      title: "Interview Started",
      description: "Your camera and microphone are now active.",
    });
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Paused" : "Recording Started",
      description: isRecording ? "Your response recording has been paused." : "Your response is now being recorded.",
    });
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions[selectedType as keyof typeof questions].length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      endInterview();
    }
  };
  
  const endInterview = () => {
    setStage("feedback");
    setIsRecording(false);
    toast({
      title: "Interview Completed",
      description: "Generating your feedback report...",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {stage === "setup" && (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-2">Practice Interview</h1>
              <p className="text-gray-600 mb-6">Configure your interview session</p>
              
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="font-bold text-xl mb-4">Select Interview Type</h2>
                  
                  <Tabs defaultValue={selectedType} className="mb-6" onValueChange={setSelectedType}>
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                      <TabsTrigger value="roleSpecific">Role-Specific</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="behavioral">
                      <p className="mb-4">Focus on your past experiences, behaviors, and soft skills with questions about how you've handled specific situations.</p>
                      <div className="font-medium mb-2">Example Questions:</div>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600">
                        <li>Tell me about a challenge you faced at work and how you overcame it.</li>
                        <li>Describe a situation where you had to work under pressure.</li>
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="technical">
                      <p className="mb-4">Assess your technical knowledge and problem-solving abilities with field-specific questions.</p>
                      <div className="font-medium mb-2">Example Questions:</div>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600">
                        <li>Explain how you would approach solving a complex technical problem.</li>
                        <li>Describe your experience with relevant technologies.</li>
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="roleSpecific">
                      <p className="mb-4">Tailored questions specific to the role you're applying for, focusing on relevant skills and expertise.</p>
                      <div className="font-medium mb-2">Example Questions:</div>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600">
                        <li>Why are you interested in this specific role?</li>
                        <li>How does your previous experience qualify you for this position?</li>
                      </ul>
                    </TabsContent>
                  </Tabs>
                  
                  <Separator className="my-6" />
                  
                  <h2 className="font-bold text-xl mb-4">Device Setup</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="font-medium mb-2 block">Camera</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Default Camera</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-medium mb-2 block">Microphone</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Default Microphone</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-6">
                    <div className="text-gray-500 mb-2">Camera Preview</div>
                    <Button variant="outline" size="sm">
                      Test Camera
                    </Button>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-interprepai-700 hover:bg-interprepai-800"
                      onClick={startInterview}
                    >
                      Start Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {stage === "interview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-black rounded-lg aspect-video relative overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white">Video feed would appear here</div>
                  </div>
                  
                  {/* Interview controls overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex justify-center space-x-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={toggleRecording}
                      >
                        {isRecording ? "Pause" : "Record"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={nextQuestion}
                      >
                        {currentQuestionIndex < questions[selectedType as keyof typeof questions].length - 1 ? "Next Question" : "End Interview"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-red-500/80 hover:bg-red-500 text-white"
                        onClick={endInterview}
                      >
                        End Session
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="font-bold text-xl">Current Question</h2>
                        <p className="text-sm text-gray-500">
                          Question {currentQuestionIndex + 1} of {questions[selectedType as keyof typeof questions].length}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {isRecording && (
                          <div className="flex items-center mr-4">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                            <span className="text-sm text-gray-500">Recording</span>
                          </div>
                        )}
                        <div className="text-xl font-mono">00:45</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                      <p className="text-lg font-medium">
                        {questions[selectedType as keyof typeof questions][currentQuestionIndex]}
                      </p>
                    </div>
                    
                    <div className="text-gray-600">
                      <p className="mb-2 font-medium">Tips:</p>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Use concrete examples from your experience</li>
                        <li>Structure your answer using the STAR method</li>
                        <li>Speak clearly and maintain good eye contact</li>
                        <li>Keep your answer concise (1-2 minutes)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-bold text-xl mb-4">Real-time Feedback</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Speaking Pace</span>
                          <span className="text-xs font-medium">Good</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Eye Contact</span>
                          <span className="text-xs font-medium">Needs Improvement</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full w-1/2"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Filler Words</span>
                          <span className="text-xs font-medium">5 detected</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full w-1/4"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Engagement</span>
                          <span className="text-xs font-medium">Excellent</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-11/12"></div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <h3 className="font-medium text-amber-800 mb-1">Suggestion</h3>
                        <p className="text-sm text-amber-700">Try to maintain more consistent eye contact with the camera. Currently looking away frequently.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {stage === "feedback" && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
                <p className="text-gray-600">Review your performance and areas for improvement</p>
              </div>
              
              <FeedbackReport interviewData={mockFeedback} />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InterviewSimulation;
