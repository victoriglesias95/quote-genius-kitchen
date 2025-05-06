
import React, { useState } from 'react';
import ChefLayout from '@/components/layout/ChefLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Import refactored components
import { RequestsHeader } from '@/components/chef/requests/RequestsHeader';
import { NewRequestDialog } from '@/components/chef/requests/NewRequestDialog';
import { RequestsTabContent } from '@/components/chef/requests/RequestsTabContent';
import { allRequests, sampleInventory } from '@/components/chef/requests/RequestsData';
import { RequestTabData, Request } from '@/components/chef/requests/types';

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  // Add state to track all requests including newly created ones
  const [requests, setRequests] = useState<Request[]>(allRequests);
  
  // Filter requests based on search
  const filteredRequests = requests.filter(request => {
    return request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           request.category.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Get counts by status
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const deliveredCount = requests.filter(r => r.status === 'delivered').length;
  
  // Define tabs
  const tabs: RequestTabData[] = [
    { id: 'all', label: `All (${requests.length})` },
    { id: 'pending', label: `Pending (${pendingCount})` },
    { id: 'approved', label: `Approved (${approvedCount})` },
    { id: 'completed', label: `Completed (${completedCount})` },
    { id: 'delivered', label: `Delivered (${deliveredCount})` },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateRequest = () => {
    setIsNewRequestOpen(true);
  };

  // Handle adding a new request
  const handleAddRequest = (newRequest: Request) => {
    setRequests([newRequest, ...requests]);
    // Automatically switch to the pending tab to show the new request
    setActiveTab('pending');
  };

  return (
    <ChefLayout>
      <div className="space-y-4">
        <RequestsHeader 
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          onCreateRequest={handleCreateRequest}
        />
        
        <NewRequestDialog 
          open={isNewRequestOpen}
          onOpenChange={setIsNewRequestOpen}
          sampleInventory={sampleInventory}
          onRequestCreated={handleAddRequest}
        />
        
        {/* Status tabs with carousel for better mobile experience */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="relative">
            <Carousel opts={{ align: 'start', loop: false }} className="w-full">
              <CarouselContent className="-ml-1">
                <TabsList className="h-auto p-1 bg-transparent w-full flex gap-1">
                  {tabs.map((tab) => (
                    <CarouselItem key={tab.id} className="basis-auto pl-1 min-w-fit">
                      <TabsTrigger 
                        value={tab.id} 
                        className="whitespace-nowrap px-4 py-2"
                      >
                        {tab.label}
                      </TabsTrigger>
                    </CarouselItem>
                  ))}
                </TabsList>
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Tab content */}
          <div className="mt-4">
            <TabsContent value="all" className="m-0">
              <RequestsTabContent requests={filteredRequests} />
            </TabsContent>
            
            <TabsContent value="pending" className="m-0">
              <RequestsTabContent requests={filteredRequests} status="pending" />
            </TabsContent>
            
            <TabsContent value="approved" className="m-0">
              <RequestsTabContent requests={filteredRequests} status="approved" />
            </TabsContent>
            
            <TabsContent value="completed" className="m-0">
              <RequestsTabContent requests={filteredRequests} status="completed" />
            </TabsContent>
            
            <TabsContent value="delivered" className="m-0">
              <RequestsTabContent requests={filteredRequests} status="delivered" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ChefLayout>
  );
};

export default Requests;
