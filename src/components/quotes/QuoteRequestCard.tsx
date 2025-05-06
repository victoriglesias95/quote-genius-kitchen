
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updateQuoteStatus } from '@/services/quoteRequestsService';

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
  onStatusChange?: (id: string, newStatus: string) => void;
}

export const QuoteRequestCard = ({ request, onStatusChange }: QuoteRequestCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const handleViewFullDetails = () => {
    setShowDetails(false);
    navigate(`/quotes/detail/${request.id}`);
  };

  const getNextStatus = (currentStatus: string) => {
    switch(currentStatus) {
      case 'pending': return 'sent';
      case 'sent': return 'received';
      case 'received': return 'ordered';
      default: return currentStatus;
    }
  };

  const getActionButtonLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'Mark as Sent';
      case 'sent': return 'Mark as Received';
      case 'received': return 'Mark as Ordered';
      default: return '';
    }
  };

  const handleStatusChange = async () => {
    if (request.status === 'ordered') return;
    
    const newStatus = getNextStatus(request.status);
    setIsProcessing(true);
    
    try {
      await updateQuoteStatus(request.id, newStatus);
      toast.success(`Quote ${request.title} marked as ${newStatus}`);
      
      if (onStatusChange) {
        onStatusChange(request.id, newStatus);
      }
      
      setShowDetails(false);
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Failed to update quote status');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
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
            <Button size="sm" variant="outline" onClick={handleViewDetails}>View Details</Button>
          </div>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{request.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
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
              <span>Due: {format(request.dueDate, 'MMM d, yyyy')}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-1">Supplier</h3>
              <p className="text-sm">{request.supplier}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-1">Category</h3>
              <p className="text-sm">{request.category}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Items</h3>
              <p className="text-sm">{request.items} items in this quote</p>
              <p className="text-xs mt-1 text-gray-500">Click "View Full Details" to see all items</p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {request.status !== 'ordered' && (
              <Button 
                onClick={handleStatusChange}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                {isProcessing ? 'Processing...' : getActionButtonLabel(request.status)}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleViewFullDetails}
              className="w-full sm:w-auto"
            >
              View Full Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
