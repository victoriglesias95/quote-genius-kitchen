
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Request {
  id: string;
  title: string;
  supplier: string;
  requestDate: string;
  status: 'pending' | 'received' | 'expired';
  items: number;
}

interface RecentRequestsProps {
  requests: Request[];
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'received':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Received</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quote Requests</CardTitle>
        <CardDescription>Latest quote requests sent to suppliers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">{request.title}</div>
                <div className="text-sm text-muted-foreground">
                  {request.supplier} • {request.items} items • {request.requestDate}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(request.status)}
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/quotes/${request.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" asChild>
            <Link to="/quotes">View All Quote Requests</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
