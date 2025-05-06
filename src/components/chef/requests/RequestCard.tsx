import React, { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Clock, Truck, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateRequestStatus } from '@/services/requestsService';

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
    quoteDeadline?: Date;
    quotes?: {
      supplierId: string;
      supplierName: string;
      items: {
        itemId: string;
        price: number;
        quantity: number | string;
        notes?: string;
      }[];
      totalPrice: number;
      deliveryDate: Date;
      submittedDate: Date;
    }[];
    selectedQuote?: string; // ID of the selected quote
  };
  canEdit?: boolean;
  canApprove?: boolean;
  canReceive?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

export const RequestCard: React.FC<RequestProps> = ({ 
  request, 
  canEdit = false, 
  canApprove = false,
  canReceive = false,
  onStatusChange
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
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
      case 'awaiting_quotes':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Awaiting Quotes</Badge>;
      case 'quote_selected':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Quote Selected</Badge>;
      case 'ordered':
        return <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">Ordered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewRequest = () => {
    setShowDetails(true);
  };

  const handleMarkAsDelivered = async () => {
    try {
      setIsUpdating(true);
      await updateRequestStatus(request.id, 'delivered');
      toast.success(`Marked ${request.title} as delivered`);
      if (onStatusChange) onStatusChange('delivered');
      setShowDetails(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update request status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleApproveRequest = async () => {
    try {
      setIsUpdating(true);
      await updateRequestStatus(request.id, 'approved');
      toast.success(`Approved ${request.title}`);
      toast.info(`Request sent to suppliers for quotes`);
      if (onStatusChange) onStatusChange('approved');
      setShowDetails(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update request status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRejectRequest = async () => {
    try {
      setIsUpdating(true);
      await updateRequestStatus(request.id, 'rejected');
      toast.error(`Rejected ${request.title}`);
      if (onStatusChange) onStatusChange('rejected');
      setShowDetails(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update request status');
    } finally {
      setIsUpdating(false);
    }
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
    } else if (request.status === 'ordered' || request.status === 'quote_selected') {
      return (
        <div className="flex items-center gap-1 text-xs text-violet-600">
          <Truck className="h-3 w-3" />
          <span>Delivery expected by {format(request.dueDate, 'MMM d, yyyy')}</span>
        </div>
      );
    }
    return null;
  };
  
  // Quote deadline info
  const getQuoteDeadlineInfo = () => {
    if (request.quoteDeadline && (request.status === 'approved' || request.status === 'awaiting_quotes')) {
      const isUrgent = request.quoteDeadline && new Date(request.quoteDeadline) < new Date(Date.now() + 86400000); // 24 hours
      
      return (
        <div className={`flex items-center gap-1 text-xs ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
          {isUrgent ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          <span>Quote deadline: {format(request.quoteDeadline, 'MMM d, yyyy')}</span>
        </div>
      );
    }
    return null;
  };

  // Get quote information if available
  const getQuoteInfo = () => {
    if (request.quotes && request.quotes.length > 0) {
      return (
        <div className="mt-2">
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200">
            {request.quotes.length} quote{request.quotes.length > 1 ? 's' : ''} received
          </Badge>
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
                {getQuoteDeadlineInfo()}
                {getQuoteInfo()}
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
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{request.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {getStatusBadge(request.status)}
              <span className="text-xs text-gray-500">
                Requested for: {format(request.dueDate, 'MMM d, yyyy')}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {request.status === 'delivered' && (
                <div className="bg-teal-50 p-3 rounded-md text-sm flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-600" />
                  <span>Delivered on {format(request.deliveryDate!, 'MMM d, yyyy')}</span>
                </div>
              )}
              
              {/* Display quotes if available and user can approve */}
              {canApprove && request.quotes && request.quotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Quotes</h4>
                  <div className="space-y-3">
                    {request.quotes.map((quote, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{quote.supplierName}</p>
                            <p className="text-xs text-gray-500">
                              Delivery: {format(quote.deliveryDate, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <p className="font-medium text-green-700">${quote.totalPrice.toFixed(2)}</p>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full text-xs"
                          onClick={() => {
                            toast.success(`Selected quote from ${quote.supplierName}`);
                            setShowDetails(false);
                          }}
                        >
                          Select Quote
                        </Button>
                      </Card>
                    ))}
                  </div>
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
          </ScrollArea>
          
          <DialogFooter className="pt-2 border-t mt-4">
            {/* Role-specific actions */}
            {canApprove && request.status === 'pending' && (
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRejectRequest}
                  className="w-full"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Processing..." : "Reject"}
                </Button>
                <Button 
                  size="sm"
                  onClick={handleApproveRequest}
                  className="w-full"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Processing..." : "Approve & Request Quotes"}
                </Button>
              </div>
            )}
            
            {canReceive && request.status === 'ordered' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleMarkAsDelivered}
                className="w-full sm:w-auto"
                disabled={isUpdating}
              >
                {isUpdating ? "Processing..." : "Mark as Received"}
              </Button>
            )}
            
            {/* Default close button */}
            <Button 
              variant={canApprove || canReceive ? "outline" : "default"}
              size="sm"
              onClick={() => setShowDetails(false)}
              className="w-full sm:w-auto"
              disabled={isUpdating}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
