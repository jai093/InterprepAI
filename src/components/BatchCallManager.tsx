
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, AudioLines, CheckCircle, Clock } from 'lucide-react';

interface BatchCallSession {
  id: string;
  candidate_id: string;
  phone_number: string;
  voice_id: string;
  prompts: string[];
  audio_urls: string[];
  status: 'ready' | 'calling' | 'completed' | 'failed';
  callback_url?: string;
  webhook_data?: any;
  created_at: string;
  completed_at?: string;
}

const BatchCallManager: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<BatchCallSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    candidateId: '',
    phoneNumber: '',
    interviewPrompts: [
      'Hello, welcome to your AI interview. Could you please introduce yourself?',
      'Can you tell me about your previous work experience?',
      'What are your key strengths and how do they relate to this position?',
      'Thank you for your time. We will be in touch with the results soon.'
    ],
  });

  useEffect(() => {
    fetchSessions();
    
    // Set up real-time subscription for session updates
    const channel = supabase.channel('batch-call-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'batch_call_sessions' },
        (payload) => {
          console.log('Session update:', payload);
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('batch_call_sessions' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions((data as BatchCallSession[]) || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const startBatchCall = async () => {
    if (!formData.candidateId || !formData.phoneNumber) {
      toast({
        title: 'Missing Information',
        description: 'Please provide candidate ID and phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-batch-call', {
        body: {
          candidateId: formData.candidateId,
          phoneNumber: formData.phoneNumber,
          interviewPrompts: formData.interviewPrompts,
          callbackUrl: 'https://interprep-ai.vercel.app/webhook/elevenlabs',
        },
      });

      if (error) throw error;

      toast({
        title: 'Batch Call Started',
        description: 'Audio generation and call preparation in progress.',
      });

      // Clear form
      setFormData({
        candidateId: '',
        phoneNumber: '',
        interviewPrompts: formData.interviewPrompts, // Keep prompts as template
      });

      fetchSessions();
    } catch (error) {
      console.error('Error starting batch call:', error);
      toast({
        title: 'Error',
        description: 'Failed to start batch call. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...formData.interviewPrompts];
    newPrompts[index] = value;
    setFormData({ ...formData, interviewPrompts: newPrompts });
  };

  const addPrompt = () => {
    setFormData({
      ...formData,
      interviewPrompts: [...formData.interviewPrompts, ''],
    });
  };

  const removePrompt = (index: number) => {
    const newPrompts = formData.interviewPrompts.filter((_, i) => i !== index);
    setFormData({ ...formData, interviewPrompts: newPrompts });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <Clock className="h-4 w-4" />;
      case 'calling':
        return <Phone className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AudioLines className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'calling':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ElevenLabs Batch Call Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="candidateId">Candidate ID</Label>
              <Input
                id="candidateId"
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                placeholder="Enter candidate ID"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <Label>Interview Prompts</Label>
            {formData.interviewPrompts.map((prompt, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => updatePrompt(index, e.target.value)}
                  placeholder={`Interview prompt ${index + 1}`}
                  className="flex-1"
                />
                {formData.interviewPrompts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePrompt(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPrompt}
              className="mt-2"
            >
              Add Prompt
            </Button>
          </div>

          <Button onClick={startBatchCall} disabled={isLoading} className="w-full">
            {isLoading ? 'Starting Batch Call...' : 'Start Batch Call'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch Call Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No batch call sessions yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(session.status)}
                      <span className="font-medium">Candidate: {session.candidate_id}</span>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Phone: {session.phone_number}</p>
                    <p>Prompts: {session.prompts?.length || 0}</p>
                    <p>Audio Files: {session.audio_urls?.length || 0}</p>
                    <p>Created: {new Date(session.created_at).toLocaleString()}</p>
                    {session.completed_at && (
                      <p>Completed: {new Date(session.completed_at).toLocaleString()}</p>
                    )}
                  </div>
                  {session.audio_urls && session.audio_urls.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Generated Audio:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        {session.audio_urls.map((url, index) => (
                          <audio key={index} controls className="w-full">
                            <source src={url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchCallManager;
