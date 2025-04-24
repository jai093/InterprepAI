
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InterviewSetupProps {
  onStart: (config: InterviewConfig) => void;
}

export interface InterviewConfig {
  type: "behavioral" | "technical" | "roleSpecific";
  difficultyLevel: "easy" | "medium" | "hard";
  interviewerPersona: "friendly" | "neutral" | "strict";
  jobRole: string;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart }) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<"behavioral" | "technical" | "roleSpecific">("behavioral");
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [interviewerPersona, setInterviewerPersona] = useState<"friendly" | "neutral" | "strict">("neutral");
  const [jobRole, setJobRole] = useState("Software Engineer");

  const handleStartInterview = () => {
    const config: InterviewConfig = {
      type: selectedType,
      difficultyLevel,
      interviewerPersona,
      jobRole,
    };
    
    toast({
      title: "Interview Setup Complete",
      description: "Your interview session is being prepared.",
    });
    
    onStart(config);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Practice Interview</h1>
      <p className="text-gray-600 mb-6">Configure your interview session</p>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="font-bold text-xl mb-4">Select Interview Type</h2>
          
          <Tabs defaultValue={selectedType} className="mb-6" onValueChange={(value) => setSelectedType(value as any)}>
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
          
          <h2 className="font-bold text-xl mb-4">Interview Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-medium mb-2 block">Difficulty Level</label>
              <Select defaultValue={difficultyLevel} onValueChange={(value) => setDifficultyLevel(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="font-medium mb-2 block">Interviewer Persona</label>
              <Select defaultValue={interviewerPersona} onValueChange={(value) => setInterviewerPersona(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interviewer style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="font-medium mb-2 block">Job Role/Industry</label>
            <Select defaultValue={jobRole} onValueChange={setJobRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select job role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="UX Designer">UX Designer</SelectItem>
                <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-6" />
          
          <h2 className="font-bold text-xl mb-4">Device Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="font-medium mb-2 block">Camera</label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Camera</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium mb-2 block">Microphone</label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Microphone</SelectItem>
                </SelectContent>
              </Select>
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
              onClick={handleStartInterview}
            >
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewSetup;
