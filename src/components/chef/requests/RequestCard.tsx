
import React, { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Clock } from 'lucide-react';

interface RequestItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
}

interface RequestProps {
  request: {
    id: string;
    title: string;
    status: string;
    dueDate: Date;
    deliveryDate?: Date;
    category: string;
    items: RequestItem[];
    notes?: string;
  };
}

export const RequestCard: React.FC<RequestProps> = ({ request }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewRequest = () => {
    setShowDetails(true);
  };

  // Format delivery info
  const getDeliveryInfo = () => {
    if (request.status === 'delivered' && request.deliveryDate) {
      return (
        <div className="flex items-center gap-1 text-xs text-emerald-600">
          <Check className="h-3 w-3" />
          <span>Delivered on {format(request.deliveryDate, 'MMM d, yyyy')}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-sm mb-3">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{request.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <Clock className="inline-block h-3 w-3 mr-1" />
                  Due: {format(request.dueDate, 'MMM d, yyyy')}
                </p>
                {getDeliveryInfo()}
              </div>
              {getStatusBadge(request.status)}
            </div>
            
            <div className="text-sm">
              <p className="text-gray-500">{request.items.length} items</p>
              <ul className="mt-1 text-gray-700">
                {request.items.slice(0, 2).map(item => (
                  <li key={item.id} className="text-xs">• {item.name} ({item.quantity} {item.unit})</li>
                ))}
                {request.items.length > 2 && (
                  <li className="text-xs text-gray-500">• and {request.items.length - 2} more...</li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleViewRequest}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{request.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {getStatusBadge(request.status)}
              <span className="text-xs text-gray-500">
                Requested for: {format(request.dueDate, 'MMM d, yyyy')}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {request.status === 'delivered' && (
              <div className="bg-teal-50 p-3 rounded-md text-sm flex items-center gap-2">
                <Check className="h-4 w-4 text-teal-600" />
                <span>Delivered on {format(request.deliveryDate!, 'MMM d, yyyy')}</span>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-2">Items</h4>
              <ul className="space-y-2">
                {request.items.map(item => (
                  <li key={item.id} className="text-sm flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-gray-600">{item.quantity} {item.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {request.notes && (
              <div>
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{request.notes}</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-2">
            {request.status !== 'delivered' && request.status !== 'rejected' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast.success(`Marked ${request.title} as delivered`);
                  setShowDetails(false);
                }}
                className="w-full sm:w-auto"
              >
                Mark as Delivered
              </Button>
            )}
            <Button 
              size="sm"
              onClick={() => setShowDetails(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
