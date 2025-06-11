
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BatchCallSession } from '@/types/batchCall';

export const useBatchCallSessions = () => {
  const [sessions, setSessions] = useState<BatchCallSession[]>([]);

  const fetchSessions = async () => {
    try {
      // Use rpc call to get batch call sessions
      const { data, error } = await supabase.rpc('get_batch_call_sessions');
      
      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }
      
      setSessions((data as BatchCallSession[]) || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

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

  return { sessions, fetchSessions };
};
