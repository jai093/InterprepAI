
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BatchCallFormData } from '@/types/batchCall';
import { useBatchCallSessions } from '@/hooks/useBatchCallSessions';
import { useAuth } from '@/contexts/AuthContext';
import BatchCallForm from './batch-call/BatchCallForm';
import BatchCallSessionsList from './batch-call/BatchCallSessionsList';

const BatchCallManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { sessions, fetchSessions } = useBatchCallSessions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BatchCallFormData>({
    candidateId: '',
    phoneNumber: '',
    interviewPrompts: [
      'Hello, welcome to your AI interview. Could you please introduce yourself?',
      'Can you tell me about your previous work experience?',
      'What are your key strengths and how do they relate to this position?',
      'Thank you for your time. We will be in touch with the results soon.'
    ],
  });

  const startBatchCall = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to start a batch call.',
        variant: 'destructive',
      });
      return;
    }

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
          initiatorId: user.id, // Add the authenticated user as initiator
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <BatchCallForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={startBatchCall}
        isLoading={isLoading}
      />
      <BatchCallSessionsList sessions={sessions} />
    </div>
  );
};

export default BatchCallManager;
