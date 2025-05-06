
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChefHat, ClipboardCheck, Calendar, Check, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuoteRequestById, fetchQuoteItems, updateQuoteStatus, QuoteItemWithPrice } from '@/services/quoteRequestsService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DateSelector } from '@/components/quotes/DateSelector';
import { ScrollArea } from '@/components/ui/scroll-area';

const QuoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [validUntil, setValidUntil] = useState<Date>(new Date());
  const [quoteItems, setQuoteItems] = useState<QuoteItemWithPrice[]>([]);

  // Fetch quote request data
  const { 
    data: quote, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['quoteRequest', id],
    queryFn: () => fetchQuoteRequestById(id as string),
    enabled: !!id,
  });

  // Fetch quote items with prices
  const { 
    data: items,
    isLoading: itemsLoading,
    error: itemsError
  } = useQuery({
    queryKey: ['quoteItems', id],
    queryFn: () => fetchQuoteItems(id as string),
    enabled: !!id,
  });

  // When items are loaded, initialize the state
  useEffect(() => {
    if (items) {
      setQuoteItems([...items]);
    }
  }, [items]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load quote details");
      console.error("Error fetching quote details:", error);
    }
    if (itemsError) {
      console.error("Error fetching quote items:", itemsError);
    }
  }, [error, itemsError]);

  const handleBack = () => {
    navigate('/quotes');
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

  const handleOpenStatusChange = () => {
    if (!quote || quote.status === 'ordered') return;
    
    if (quote.status === 'sent') {
      setShowPriceDialog(true);
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
    if (!quote || quote.status === 'ordered') return;
    
    const newStatus = getNextStatus(quote.status);
    setIsProcessing(true);
    
    try {
      await updateQuoteStatus(quote.id, newStatus, priceData);
      toast.success(`Quote ${quote.title} marked as ${newStatus}`);
      setShowPriceDialog(false);
      refetch();
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

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <SidebarToggle />
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !quote) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <SidebarToggle />
            <div className="p-6 md:p-8">
              <Button variant="outline" onClick={handleBack} className="mb-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Quotes
              </Button>
              <div className="text-center text-red-500 p-4">
                Failed to load quote details. Please try again later.
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Quotes
            </Button>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-navy">{quote.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline" 
                    className={`
                      ${quote.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${quote.status === 'sent' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      ${quote.status === 'received' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${quote.status === 'ordered' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                    `}
                  >
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                  {quote.fromChefRequest && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <ChefHat className="h-3 w-3" />
                      <span>From {quote.chefName || 'kitchen'} request</span>
                    </div>
                  )}
                  
                  {/* Price validity indicator */}
                  {quote.status === 'received' && (
                    <div className="flex items-center gap-1 text-xs">
                      {quote.isValid ? (
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Price valid until {quote.validUntil ? format(quote.validUntil, 'MMM d, yyyy') : 'N/A'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Price expired</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {quote.status !== 'ordered' && (
                <Button
                  onClick={handleOpenStatusChange}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {isProcessing ? 'Processing...' : getActionButtonLabel(quote.status)}
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 md:col-span-2">
                <h2 className="font-semibold mb-4">Quote Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                    <p>{quote.supplier}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p>{quote.category}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                    <p>{format(quote.dueDate, 'MMMM d, yyyy')}</p>
                  </div>
                  
                  {quote.status === 'received' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Price</h3>
                      <p className="font-medium text-lg">${quote.totalPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="p-4">
                <h2 className="font-semibold mb-4">Status Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      ['pending', 'sent', 'received', 'ordered'].includes(quote.status) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <p>Created</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      ['sent', 'received', 'ordered'].includes(quote.status) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <p>Sent to Supplier</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      ['received', 'ordered'].includes(quote.status) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <p>Quote Received</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      quote.status === 'ordered' ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <p>Order Placed</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 md:col-span-3">
                <h2 className="font-semibold mb-4">Quote Items</h2>
                {itemsLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : items && items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Item</th>
                          <th className="text-right pb-2">Quantity</th>
                          <th className="text-right pb-2">Unit</th>
                          <th className="text-right pb-2">Price</th>
                          <th className="text-right pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-3">{item.name}</td>
                            <td className="py-3 text-right">{item.quantity}</td>
                            <td className="py-3 text-right">{item.unit}</td>
                            <td className="py-3 text-right">
                              {item.price 
                                ? `$${Number(item.price).toFixed(2)}`
                                : quote.isValid === false 
                                  ? 'N/A'
                                  : '-'
                              }
                            </td>
                            <td className="py-3 text-right">
                              {item.price 
                                ? `$${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
                                : quote.isValid === false 
                                  ? 'N/A'
                                  : '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {quote.status === 'received' && (
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="pt-3 text-right font-medium">Total:</td>
                            <td className="pt-3 text-right font-medium">${quote.totalPrice?.toFixed(2) || '0.00'}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    <p>No items found for this quote request.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Price Entry Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
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
              onClick={() => setShowPriceDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default QuoteDetail;
