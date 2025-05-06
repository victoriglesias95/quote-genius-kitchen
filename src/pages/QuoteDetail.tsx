
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChefHat, ClipboardCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuoteRequestById, updateQuoteStatus } from '@/services/quoteRequestsService';
import { toast } from 'sonner';

const QuoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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

  useEffect(() => {
    if (error) {
      toast.error("Failed to load quote details");
      console.error("Error fetching quote details:", error);
    }
  }, [error]);

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

  const handleStatusChange = async () => {
    if (!quote || quote.status === 'ordered') return;
    
    const newStatus = getNextStatus(quote.status);
    setIsProcessing(true);
    
    try {
      await updateQuoteStatus(quote.id, newStatus);
      toast.success(`Quote ${quote.title} marked as ${newStatus}`);
      refetch();
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Failed to update quote status');
    } finally {
      setIsProcessing(false);
    }
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
                </div>
              </div>
              
              {quote.status !== 'ordered' && (
                <Button
                  onClick={handleStatusChange}
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
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Items</h3>
                    <p>{quote.items} items in this quote</p>
                  </div>
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
                <div className="text-center text-gray-500">
                  <p>Detailed quote items will be displayed here in the future.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default QuoteDetail;
