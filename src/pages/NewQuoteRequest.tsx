
import React, { useState } from 'react';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, ChefHat } from 'lucide-react';

const NewQuoteRequest = () => {
  const [activeTab, setActiveTab] = useState('new');

  // In a real app, this would come from an API or database
  const chefRequests = [
    {
      id: 'chef-req-1',
      title: 'Weekly Produce Order',
      chef: 'Chef Michael',
      date: '2025-05-04',
      category: 'Produce',
      items: [
        { name: 'Tomatoes', quantity: 10, unit: 'kg' },
        { name: 'Lettuce', quantity: 15, unit: 'heads' },
        { name: 'Carrots', quantity: 8, unit: 'kg' }
      ]
    },
    {
      id: 'chef-req-2',
      title: 'Meat Stock Replenishment',
      chef: 'Chef Sarah',
      date: '2025-05-05',
      category: 'Meat',
      items: [
        { name: 'Beef Sirloin', quantity: 20, unit: 'kg' },
        { name: 'Chicken Breast', quantity: 15, unit: 'kg' }
      ]
    }
  ];

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
                <TabsTrigger value="new">New Quote Request</TabsTrigger>
                <TabsTrigger value="chef" className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>Chef Requests</span> 
                  <span className="ml-1 bg-blue-100 text-blue-700 rounded-full text-xs px-2 py-0.5">{chefRequests.length}</span>
                </TabsTrigger>
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
                
                <QuoteForm />
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
                
                {chefRequests.map((request) => (
                  <Card key={request.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <p className="text-sm text-gray-500">
                            Requested by {request.chef} on {new Date(request.date).toLocaleDateString()}
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
                        {request.items.map((item, index) => (
                          <li key={index} className="text-sm flex justify-between">
                            <span>{item.name}</span>
                            <span className="text-gray-600">{item.quantity} {item.unit}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-end mt-4">
                        <button 
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                          onClick={() => setActiveTab('new')}
                        >
                          Create Quote Request
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NewQuoteRequest;
