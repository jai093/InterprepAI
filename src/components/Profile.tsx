
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
import { supabase } from "@/integrations/supabase/client";

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
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'resume') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const bucketId = type === 'avatar' ? 'avatars' : 'resumes';
    const filePath = `${user?.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    try {
      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);

      if (type === 'avatar') {
        setAvatarUrl(publicUrl);
      } else {
        setResumeUrl(publicUrl);
      }

      toast({
        title: `${type === 'avatar' ? 'Profile photo' : 'Resume'} uploaded`,
        description: "Your file has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we save the email as well - always update email from auth
    updateProfile.mutate({
      full_name: fullName,
      phone_number: phoneNumber,
      linkedin_url: linkedinUrl,
      skills,
      languages,
      avatar_url: avatarUrl,
      resume_url: resumeUrl,
      email: user?.email || "",
    });
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

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
                disabled={uploading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
            <Input
              id="linkedinUrl"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="Enter your LinkedIn profile URL"
            />
          </div>

          <div>
            <Label htmlFor="resume">Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'resume')}
              disabled={uploading}
            />
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                View current resume
              </a>
            )}
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Enter your skills (separated by commas)"
            />
          </div>

          <div>
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
            disabled={updateProfile.isPending || uploading}
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
