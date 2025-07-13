import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { User, Building, Bell, Shield, Save, Mail } from "lucide-react";

interface HRProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  created_at: string;
}

interface Settings {
  emailNotifications: boolean;
  candidateAutoReject: boolean;
  assessmentReminders: boolean;
  weeklyReports: boolean;
}

export default function HRSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HRProfile | null>(null);
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    candidateAutoReject: false,
    assessmentReminders: true,
    weeklyReports: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("recruiters")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create initial recruiter profile
        const { data: newProfile, error: createError } = await supabase
          .from("recruiters")
          .insert({
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || "HR Manager",
            company: ""
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile information",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("recruiters")
        .update({
          name: profile.name,
          company: profile.company,
          email: profile.email
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile information",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your HR profile and platform preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile?.name || ""}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profile?.company || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, company: e.target.value } : null)}
                placeholder="Enter your company name"
              />
            </div>
            <Button onClick={saveProfile} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(value) => updateSetting("emailNotifications", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Assessment Reminders</h4>
                <p className="text-sm text-gray-600">Get reminders for pending assessments</p>
              </div>
              <Switch
                checked={settings.assessmentReminders}
                onCheckedChange={(value) => updateSetting("assessmentReminders", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-gray-600">Receive weekly hiring analytics</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(value) => updateSetting("weeklyReports", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assessment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Assessment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-reject Failed Assessments</h4>
                <p className="text-sm text-gray-600">Automatically reject candidates who score below threshold</p>
              </div>
              <Switch
                checked={settings.candidateAutoReject}
                onCheckedChange={(value) => updateSetting("candidateAutoReject", value)}
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="passing-score">Minimum Passing Score (%)</Label>
              <Input
                id="passing-score"
                type="number"
                min="0"
                max="100"
                defaultValue="70"
                className="w-32"
              />
            </div>
            <div>
              <Label htmlFor="time-limit">Default Assessment Time Limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                min="15"
                max="180"
                defaultValue="60"
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Account Created:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Plan:</strong> Professional</p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="ml-2">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}