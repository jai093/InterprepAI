
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const Profile = () => {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [skills, setSkills] = useState(profile?.skills || "");
  const [languages, setLanguages] = useState(profile?.languages || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || "");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhoneNumber(profile.phone_number || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setSkills(profile.skills || "");
      setLanguages(profile.languages || "");
      setAvatarUrl(profile.avatar_url || "");
      setResumeUrl(profile.resume_url || "");
    }
  }, [profile]);

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'resume') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${type}s/${fileName}`;

    try {
      // Handle file upload logic here
      toast({
        title: "File uploaded successfully",
        description: `Your ${type} has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: `Error uploading ${type}`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      full_name: fullName,
      phone_number: phoneNumber,
      linkedin_url: linkedinUrl,
      skills,
      languages,
      avatar_url: avatarUrl,
      resume_url: resumeUrl,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{fullName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar">Profile Photo</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'avatar')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
            <Input
              id="linkedinUrl"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="Enter your LinkedIn profile URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'resume')}
            />
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                View current resume
              </a>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Enter your skills (separated by commas)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages</Label>
            <Textarea
              id="languages"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="Enter languages you speak"
            />
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
