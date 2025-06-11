
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BatchCallSession } from '@/types/batchCall';
import BatchCallSessionCard from './BatchCallSessionCard';

interface BatchCallSessionsListProps {
  sessions: BatchCallSession[];
}

const BatchCallSessionsList: React.FC<BatchCallSessionsListProps> = ({ sessions }) => {
  return (
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
              <BatchCallSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchCallSessionsList;
