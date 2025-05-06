
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat } from 'lucide-react';
import { format } from 'date-fns';

interface QuoteRequest {
  id: string;
  title: string;
  supplier: string;
  status: string;
  dueDate: Date;
  fromChefRequest: boolean;
  chefName?: string;
  items: number;
  category: string;
}

interface QuoteRequestCardProps {
  request: QuoteRequest;
}

export const QuoteRequestCard = ({ request }: QuoteRequestCardProps) => {
  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{request.title}</h3>
            <p className="text-sm text-gray-500">{request.supplier}</p>
            {request.fromChefRequest && (
              <div className="flex items-center gap-1 text-xs mt-1 text-gray-600">
                <ChefHat className="h-3 w-3" />
                <span>From {request.chefName || 'kitchen'} request</span>
              </div>
            )}
          </div>
          <Badge 
            variant="outline" 
            className={`
              ${request.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
              ${request.status === 'sent' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
              ${request.status === 'received' ? 'bg-green-50 text-green-700 border-green-200' : ''}
              ${request.status === 'ordered' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
            `}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm">
            <p>Due: {format(request.dueDate, 'MMM d, yyyy')}</p>
            <p className="text-xs text-gray-500">{request.items} items • {request.category}</p>
          </div>
          <Button size="sm" variant="outline">View Details</Button>
        </div>
      </div>
    </Card>
  );
};
