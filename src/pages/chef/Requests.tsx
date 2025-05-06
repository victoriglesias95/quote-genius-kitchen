
import React, { useState, useEffect } from 'react';
import ChefLayout from '@/components/layout/ChefLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

// Import refactored components
import { RequestsHeader } from '@/components/chef/requests/RequestsHeader';
import { NewRequestDialog } from '@/components/chef/requests/NewRequestDialog';
import { RequestsTabContent } from '@/components/chef/requests/RequestsTabContent';
import { sampleInventory } from '@/components/chef/requests/RequestsData';
import { RequestTabData, Request } from '@/components/chef/requests/types';
import { fetchAllRequests, createRequest, seedInitialData } from '@/services/requestsService';
import { allRequests as staticRequests } from '@/components/chef/requests/RequestsData'; // For seeding

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  
  // Use React Query to fetch requests data from Supabase
  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['requests'],
    queryFn: fetchAllRequests,
  });

  // Seed initial data if needed
  useEffect(() => {
    const runSeedData = async () => {
      try {
        await seedInitialData(staticRequests);
        // After seeding, refetch to get the latest data
        refetch();
      } catch (error) {
        console.error("Error seeding data:", error);
        toast.error("Failed to load initial data");
      }
    };

    runSeedData();
  }, [refetch]);
  
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
  const handleAddRequest = async (newRequest: Request) => {
    try {
      // Create request in database
      await createRequest(newRequest);
      // Refetch to get the updated list including the new request
      refetch();
      // Automatically switch to the pending tab to show the new request
      setActiveTab('pending');
      toast.success("Request created successfully");
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    }
  };

  if (isLoading) {
    return (
      <ChefLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </ChefLayout>
    );
  }

  if (error) {
    return (
      <ChefLayout>
        <div className="text-center text-red-500 p-4">
          Failed to load requests. Please try again later.
        </div>
      </ChefLayout>
    );
  }

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
              <RequestsTabContent 
                requests={filteredRequests} 
                onStatusChange={refetch} 
              />
            </TabsContent>
            
            <TabsContent value="pending" className="m-0">
              <RequestsTabContent 
                requests={filteredRequests} 
                status="pending" 
                onStatusChange={refetch} 
              />
            </TabsContent>
            
            <TabsContent value="approved" className="m-0">
              <RequestsTabContent 
                requests={filteredRequests} 
                status="approved" 
                onStatusChange={refetch} 
              />
            </TabsContent>
            
            <TabsContent value="completed" className="m-0">
              <RequestsTabContent 
                requests={filteredRequests} 
                status="completed" 
                onStatusChange={refetch} 
              />
            </TabsContent>
            
            <TabsContent value="delivered" className="m-0">
              <RequestsTabContent 
                requests={filteredRequests} 
                status="delivered" 
                onStatusChange={refetch} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ChefLayout>
  );
};

export default Requests;
