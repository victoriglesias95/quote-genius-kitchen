
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface Request {
  id: string;
  title: string;
  supplier: string;
  requestDate: string;
  status: 'pending' | 'received' | 'expired';
  items: number;
}

interface RecentRequestsProps {
  requests: ReadonlyArray<Request> | Array<Request>;
  isLoading?: boolean;
}

export function RecentRequests({ requests, isLoading = false }: RecentRequestsProps) {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Quote Requests</CardTitle>
          <CardDescription>Latest quote requests sent to suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2 w-2/3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quote Requests</CardTitle>
        <CardDescription>Latest quote requests sent to suppliers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map(request => (
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
                    <Link to={`/quotes/detail/${request.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No recent quote requests found.</p>
              <Button variant="outline" className="mt-2" asChild>
                <Link to="/quotes/new">Create New Request</Link>
              </Button>
            </div>
          )}
          {requests.length > 0 && (
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link to="/quotes">View All Quote Requests</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
