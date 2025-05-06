
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RequestCard } from './RequestCard';
import { Request } from './types';

interface RequestsTabContentProps {
  requests: Request[];
  status?: string;
}

export const RequestsTabContent: React.FC<RequestsTabContentProps> = ({ requests, status }) => {
  // Filter by status if provided
  const filteredRequests = status ? 
    requests.filter(request => request.status === status) : 
    requests;
  
  return (
    <div className="space-y-4">
      {filteredRequests.length > 0 ? (
        filteredRequests.map(request => (
          <RequestCard key={request.id} request={request} />
        ))
      ) : (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-gray-500">
              No {status ? status + " " : ""}requests found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
