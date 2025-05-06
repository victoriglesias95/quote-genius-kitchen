
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Info, ChefHat } from 'lucide-react';
import { allRequests } from '@/components/chef/requests/RequestsData';
import { Request } from '@/components/chef/requests/types';

const NewQuoteRequest = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if this form is for a specific chef request
  const chefRequestId = searchParams.get('chefRequestId');
  const [chefRequestData, setChefRequestData] = useState<Request | null>(null);
  
  // Find chef request data if ID is provided
  useEffect(() => {
    if (chefRequestId) {
      const requestData = allRequests.find(r => r.id === chefRequestId);
      if (requestData) {
        setChefRequestData(requestData);
        setActiveTab('new'); // Force the new tab when coming from a chef request
      }
    }
  }, [chefRequestId]);

  // In a real app, this would come from an API or database
  // Filter requests that are in "pending" or "approved" status 
  // and don't have quotes yet
  const chefRequests = allRequests.filter(
    req => (req.status === 'pending' || req.status === 'approved') && 
    (!req.quotes || req.quotes.length === 0)
  );

  const handleCreateFromChefRequest = (requestId: string) => {
    navigate(`/quotes/new?chefRequestId=${requestId}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-navy">Quote Requests</h1>
              <p className="text-dark-gray">Create or process quote requests for suppliers</p>
            </div>
            
            <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="new">
                  {chefRequestId ? 'Process Chef Request' : 'New Quote Request'}
                </TabsTrigger>
                {!chefRequestId && (
                  <TabsTrigger value="chef" className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    <span>Chef Requests</span> 
                    <span className="ml-1 bg-blue-100 text-blue-700 rounded-full text-xs px-2 py-0.5">
                      {chefRequests.length}
                    </span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="new" className="mt-4">
                <Card className="mb-6 bg-blue-50 border-blue-100">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">What happens when you submit a request?</p>
                      <p className="mt-1">When you submit a quote request:</p>
                      <ol className="list-decimal ml-5 mt-1 space-y-1">
                        <li>The request is sent to your selected suppliers</li>
                        <li>Suppliers can view and respond with quotes</li>
                        <li>You'll receive notifications when quotes arrive</li>
                        <li>You can compare quotes and make selections in the Requests section</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
                
                <QuoteForm 
                  chefRequestId={chefRequestId || undefined} 
                  chefRequestData={chefRequestData || undefined}
                />
              </TabsContent>
              
              <TabsContent value="chef" className="mt-4">
                <Card className="mb-6 bg-amber-50 border-amber-100">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium">Processing Chef Requests</p>
                      <p className="mt-1">These are requests submitted by kitchen staff that need to be converted into supplier quote requests:</p>
                      <ol className="list-decimal ml-5 mt-1 space-y-1">
                        <li>Review the items requested by the kitchen</li>
                        <li>Select appropriate suppliers for each category</li>
                        <li>Submit the quote request to suppliers</li>
                        <li>Keep the kitchen staff updated on the status</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
                
                {chefRequests.length > 0 ? (
                  chefRequests.map((request) => (
                    <Card key={request.id} className="mb-4">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{request.title}</CardTitle>
                            <p className="text-sm text-gray-500">
                              Requested for {new Date(request.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {request.category}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-medium text-sm mb-2">Requested Items:</h3>
                        <ul className="space-y-1">
                          {request.items.slice(0, 5).map((item, index) => (
                            <li key={index} className="text-sm flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-gray-600">{item.quantity} {item.unit}</span>
                            </li>
                          ))}
                          {request.items.length > 5 && (
                            <li className="text-sm text-gray-500">
                              + {request.items.length - 5} more items
                            </li>
                          )}
                        </ul>
                        <div className="flex justify-end mt-4">
                          <Button 
                            className="bg-blue-500 text-white hover:bg-blue-600 text-sm"
                            onClick={() => handleCreateFromChefRequest(request.id)}
                          >
                            Create Quote Request
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <p className="text-gray-500">No pending chef requests found.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NewQuoteRequest;
