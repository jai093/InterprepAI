
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { Video } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedType, setSelectedType] = useState<"behavioral" | "technical" | "roleSpecific">("behavioral");
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [interviewerPersona, setInterviewerPersona] = useState<"friendly" | "neutral" | "strict">("neutral");
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const { stream, cameraReady, microphoneReady, error, requestMediaPermissions } = useMediaDevices();

  const handleStartInterview = () => {
    if (!cameraReady || !microphoneReady) {
      toast({
        title: "Device access required",
        description: "Please enable your camera and microphone to start the interview.",
        variant: "destructive"
      });
      return;
    }

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

  const testCamera = async () => {
    setIsCameraLoading(true);
    const newStream = await requestMediaPermissions();
    setIsCameraLoading(false);
    
    if (newStream && videoRef.current) {
      videoRef.current.srcObject = newStream;
    }
  };
  
  // Connect camera feed to video element when stream is available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

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
              <p className={`text-sm mt-1 ${cameraReady ? "text-green-600" : "text-amber-600"}`}>
                {cameraReady ? "Camera connected" : "Camera not connected"}
              </p>
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
              <p className={`text-sm mt-1 ${microphoneReady ? "text-green-600" : "text-amber-600"}`}>
                {microphoneReady ? "Microphone connected" : "Microphone not connected"}
              </p>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-6 relative">
            {!cameraReady ? (
              <div className="text-center">
                <Video className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <div className="text-gray-500 mb-2">Camera Preview</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testCamera}
                  disabled={isCameraLoading}
                >
                  {isCameraLoading ? "Connecting..." : "Test Camera"}
                </Button>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full rounded-lg object-cover"
              />
            )}
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Error accessing devices: {error}. Please check your permissions and try again.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <Button 
              className="bg-interprepai-700 hover:bg-interprepai-800"
              onClick={handleStartInterview}
              disabled={!cameraReady || !microphoneReady}
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
