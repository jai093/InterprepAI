import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Mail, Calendar, User, Send, Plus } from "lucide-react";

interface AssessmentInvite {
  id: string;
  assessment_id: string;
  candidate_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  link: string | null;
  assessments: {
    title: string;
    description: string;
  };
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function InvitesPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<AssessmentInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");

  useEffect(() => {
    if (user) {
      fetchInvites();
      fetchAssessments();
    }
  }, [user]);

  const fetchInvites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("assessment_invites")
        .select(`
          id,
          assessment_id,
          candidate_id,
          status,
          created_at,
          completed_at,
          link,
          assessments (
            title,
            description
          ),
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error: any) {
      console.error("Error fetching invites:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load invites",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, title, description")
        .eq("recruiter_id", user.id);

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  const sendInvite = async () => {
    if (!candidateEmail || !selectedAssessment) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter candidate email and select an assessment",
      });
      return;
    }

    try {
      // First, find the candidate profile by email
      let { data: candidateData, error: candidateError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("email", candidateEmail)
        .single();

      if (candidateError && candidateError.code !== 'PGRST116') {
        throw candidateError;
      }

      if (!candidateData) {
        toast({
          variant: "destructive",
          title: "No user found with this email!",
          description: "Double-check user exists and email is correct.",
        });
        return;
      }

      // Generate invite link
      const inviteLink = `${window.location.origin}/candidate-interview?assessment=${selectedAssessment}&invite=${Date.now()}`;

      // Create the invite
      const { error: inviteError } = await supabase
        .from("assessment_invites")
        .insert({
          assessment_id: selectedAssessment,
          recruiter_id: user.id,
          candidate_id: candidateData.id,
          link: inviteLink,
          status: "sent"
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Invite Sent",
        description: `Assessment invitation sent to ${candidateEmail}`,
      });

      setShowInviteDialog(false);
      setCandidateEmail("");
      setSelectedAssessment("");
      fetchInvites();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast({
        variant: "destructive",
        title: "Error Sending Invite",
        description: error.message || "Failed to send assessment invitation",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "sent": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Interview Invites</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Interview Invites</h1>
          <p className="text-gray-600">Manage assessment invitations sent to candidates</p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Assessment Invite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Candidate Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="candidate@example.com"
                />
              </div>
              <div>
                <Label htmlFor="assessment">Select Assessment</Label>
                <select
                  id="assessment"
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose an assessment...</option>
                  {assessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={sendInvite} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invites sent yet</h3>
            <p className="text-gray-600 mb-4">Start by sending your first assessment invitation to a candidate</p>
            <Button onClick={() => setShowInviteDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Send First Invite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invites.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {invite.profiles?.full_name || "Unknown Candidate"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Assessment: {invite.assessments?.title}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Sent: {new Date(invite.created_at).toLocaleDateString()}
                        </span>
                        {invite.completed_at && (
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Completed: {new Date(invite.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(invite.status)}>
                      {invite.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    {invite.link && (
                      <Button variant="outline" size="sm" onClick={() => {
                        navigator.clipboard.writeText(invite.link!);
                        toast({ title: "Link copied to clipboard" });
                      }}>
                        Copy Link
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}