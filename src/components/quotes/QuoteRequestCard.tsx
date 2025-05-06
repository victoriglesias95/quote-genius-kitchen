
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat, Check, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updateQuoteStatus, fetchQuoteItems, QuoteItemWithPrice } from '@/services/quoteRequestsService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateSelector } from '@/components/quotes/DateSelector';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  isValid?: boolean;
  validUntil?: Date;
}

interface QuoteRequestCardProps {
  request: QuoteRequest;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export const QuoteRequestCard = ({ request, onStatusChange }: QuoteRequestCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showPriceEntry, setShowPriceEntry] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validUntil, setValidUntil] = useState<Date>(new Date());
  const [quoteItems, setQuoteItems] = useState<QuoteItemWithPrice[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
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

  const handleOpenPriceDialog = async () => {
    if (request.status === 'sent') {
      setShowDetails(false);
      setIsLoadingItems(true);
      
      try {
        // Fetch items with their current prices
        const items = await fetchQuoteItems(request.id);
        setQuoteItems(items);
        setShowPriceEntry(true);
      } catch (error) {
        console.error("Error fetching quote items:", error);
        toast.error("Failed to load quote items");
      } finally {
        setIsLoadingItems(false);
      }
    } else {
      handleStatusChange();
    }
  };

  const updateItemPrice = (itemId: string, price: number) => {
    setQuoteItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, price } : item
      )
    );
  };

  const handleStatusChange = async (priceData?: { items: { itemId: string, price: number }[], validUntil: Date }) => {
    if (request.status === 'ordered') return;
    
    const newStatus = getNextStatus(request.status);
    setIsProcessing(true);
    
    try {
      await updateQuoteStatus(request.id, newStatus, priceData);
      toast.success(`Quote ${request.title} marked as ${newStatus}`);
      
      if (onStatusChange) {
        onStatusChange(request.id, newStatus);
      }
      
      setShowDetails(false);
      setShowPriceEntry(false);
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Failed to update quote status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePriceSubmit = () => {
    // Validate all prices are entered
    const missingPrices = quoteItems.some(item => !item.price || isNaN(Number(item.price)));
    
    if (missingPrices) {
      toast.error('Please enter prices for all items');
      return;
    }

    if (!validUntil) {
      toast.error('Please select a valid until date');
      return;
    }

    handleStatusChange({
      items: quoteItems.map(item => ({ 
        itemId: item.id, 
        price: Number(item.price) 
      })),
      validUntil
    });
  };

  const calculateTotalPrice = () => {
    return quoteItems.reduce((total, item) => {
      return total + (Number(item.price) || 0) * Number(item.quantity);
    }, 0).toFixed(2);
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
              {request.status === 'received' && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  {request.isValid ? (
                    <div className="text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      <span>Valid until {request.validUntil ? format(request.validUntil, 'MMM d') : 'N/A'}</span>
                    </div>
                  ) : (
                    <div className="text-red-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Price expired</span>
                    </div>
                  )}
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

      {/* Details Dialog */}
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
                onClick={handleOpenPriceDialog}
                disabled={isProcessing || isLoadingItems}
                className="w-full sm:w-auto"
              >
                {isProcessing ? 'Processing...' : 
                 isLoadingItems ? 'Loading Items...' : 
                 getActionButtonLabel(request.status)}
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

      {/* Price Entry Dialog */}
      <Dialog open={showPriceEntry} onOpenChange={setShowPriceEntry}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Quote Item Prices</DialogTitle>
            <DialogDescription>
              Please enter the price for each item and the price validity date provided by the supplier.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <ScrollArea className="h-[200px] pr-4">
              {quoteItems.map((item) => (
                <div key={item.id} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <Label htmlFor={`price-${item.id}`}>{item.name}</Label>
                    <span className="text-sm text-gray-500">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      id={`price-${item.id}`}
                      type="number"
                      step="0.01"
                      placeholder="Enter price"
                      value={item.price || ''}
                      onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value))}
                      className="flex-grow"
                    />
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-medium">${calculateTotalPrice()}</span>
              </div>
              
              <DateSelector
                label="Prices Valid Until"
                date={validUntil}
                setDate={setValidUntil}
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handlePriceSubmit}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'Save and Mark as Received'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowPriceEntry(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
