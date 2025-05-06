
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, ChefHat, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

// Sample quote requests data
// In a real app, this would come from an API or database
const sampleQuoteRequests = [
  {
    id: 'quote-1',
    title: 'Weekly Produce Order',
    supplier: 'Farm Fresh Produce',
    status: 'pending',
    dueDate: new Date('2025-05-12'),
    fromChefRequest: true,
    chefName: 'Chef Michael',
    items: 8,
    category: 'Produce'
  },
  {
    id: 'quote-2',
    title: 'Monthly Meat Order',
    supplier: 'Premium Meats Inc.',
    status: 'sent',
    dueDate: new Date('2025-05-15'),
    fromChefRequest: false,
    items: 5,
    category: 'Meat'
  },
  {
    id: 'quote-3',
    title: 'Specialty Ingredients',
    supplier: 'Gourmet Suppliers',
    status: 'received',
    dueDate: new Date('2025-05-10'),
    fromChefRequest: true,
    chefName: 'Chef Sarah',
    items: 12,
    category: 'Specialty'
  },
  {
    id: 'quote-4',
    title: 'Kitchen Equipment',
    supplier: 'Restaurant Supply Co.',
    status: 'ordered',
    dueDate: new Date('2025-05-20'),
    fromChefRequest: false,
    items: 3,
    category: 'Equipment'
  }
];

const QuoteRequestCard = ({ request }: { request: typeof sampleQuoteRequests[0] }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
};

const Quotes = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter quotes based on search term
  const filteredQuotes = sampleQuoteRequests.filter(quote => 
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
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const QuoteRequestsList = ({ quotes }: { quotes: typeof sampleQuoteRequests }) => {
  if (quotes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No quote requests found</p>
          <p className="text-sm text-gray-400">Create a new request or check your search filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-280px)]">
      <div className="space-y-4">
        {quotes.map(quote => (
          <QuoteRequestCard key={quote.id} request={quote} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default Quotes;
