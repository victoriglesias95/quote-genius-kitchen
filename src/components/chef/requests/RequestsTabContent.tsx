
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RequestCard } from './RequestCard';
import { Request } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequestsTabContentProps {
  requests: Request[];
  status?: string;
  onStatusChange?: () => void;
}

export const RequestsTabContent: React.FC<RequestsTabContentProps> = ({ requests, status, onStatusChange }) => {
  const { user, hasPermission } = useAuth();
  
  // Filter by status if provided
  const filteredRequests = status ? 
    requests.filter(request => request.status === status) : 
    requests;
  
  // Additional role-based filtering
  // For example, if the user is a purchaser, they might only see requests assigned to them
  const roleFilteredRequests = user?.role === 'purchasing' && user.id
    ? filteredRequests.filter(request => !request.assignedTo || request.assignedTo === user.id)
    : filteredRequests;
  
  return (
    <div className="space-y-4">
      {roleFilteredRequests.length > 0 ? (
        <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {roleFilteredRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                canEdit={user?.role === 'chef' || user?.role === 'purchasing'}
                canApprove={hasPermission('canApproveRequest')}
                canReceive={hasPermission('canReceiveOrder')}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </ScrollArea>
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
