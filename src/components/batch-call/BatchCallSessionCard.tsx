
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Phone, AudioLines, CheckCircle, Clock } from 'lucide-react';
import { BatchCallSession } from '@/types/batchCall';

interface BatchCallSessionCardProps {
  session: BatchCallSession;
}

const BatchCallSessionCard: React.FC<BatchCallSessionCardProps> = ({ session }) => {
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
    <div className="border rounded-lg p-4">
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
  );
};

export default BatchCallSessionCard;
