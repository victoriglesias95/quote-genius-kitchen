
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { QuoteRequestsList } from '@/components/quotes/QuoteRequestsList';
import { useQuery } from '@tanstack/react-query';
import { fetchQuoteRequests } from '@/services/quoteRequestsService';

const Quotes = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use React Query to fetch quote requests data from Supabase
  const { data: quoteRequests = [], isLoading, error } = useQuery({
    queryKey: ['quoteRequests'],
    queryFn: fetchQuoteRequests,
  });

  // Filter quotes based on search term
  const filteredQuotes = quoteRequests.filter(quote => 
    quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by status
  const getQuotesByStatus = (status?: string) => {
    if (!status || status === 'all') return filteredQuotes;
    return filteredQuotes.filter(quote => quote.status === status);
  };

  // Count quotes by status
  const allCount = filteredQuotes.length;
  const pendingCount = filteredQuotes.filter(q => q.status === 'pending').length;
  const sentCount = filteredQuotes.filter(q => q.status === 'sent').length;
  const receivedCount = filteredQuotes.filter(q => q.status === 'received').length;
  const orderedCount = filteredQuotes.filter(q => q.status === 'ordered').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-navy">Quote Requests</h1>
                <p className="text-dark-gray">Manage and track quote requests with suppliers</p>
              </div>
              {hasPermission('canPlaceOrder') && (
                <Button onClick={() => navigate('/quotes/new')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>New Quote Request</span>
                </Button>
              )}
            </div>
            
            {/* Search bar */}
            <div className="mb-6">
              <Input
                placeholder="Search quotes by title or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">
                Failed to load quote requests. Please try again later.
              </div>
            ) : (
              <>
                {/* Tabs */}
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList>
                    <TabsTrigger value="all">All ({allCount})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                    <TabsTrigger value="sent">Sent ({sentCount})</TabsTrigger>
                    <TabsTrigger value="received">Quotes Received ({receivedCount})</TabsTrigger>
                    <TabsTrigger value="ordered">Ordered ({orderedCount})</TabsTrigger>
                  </TabsList>
                  
                  {/* Tab content */}
                  <TabsContent value="all" className="mt-4">
                    <QuoteRequestsList quotes={getQuotesByStatus('all')} />
                  </TabsContent>
                  
                  <TabsContent value="pending" className="mt-4">
                    <QuoteRequestsList quotes={getQuotesByStatus('pending')} />
                  </TabsContent>
                  
                  <TabsContent value="sent" className="mt-4">
                    <QuoteRequestsList quotes={getQuotesByStatus('sent')} />
                  </TabsContent>
                  
                  <TabsContent value="received" className="mt-4">
                    <QuoteRequestsList quotes={getQuotesByStatus('received')} />
                  </TabsContent>
                  
                  <TabsContent value="ordered" className="mt-4">
                    <QuoteRequestsList quotes={getQuotesByStatus('ordered')} />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Quotes;
