
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { SupplierOrderMapping } from '@/components/purchasing/SupplierOrderMapping';
import { MissingItemsAlert } from '@/components/purchasing/MissingItemsAlert';
import { OrderCoverageSummary } from '@/components/purchasing/OrderCoverageSummary';
import { PurchasingHeader } from '@/components/purchasing/PurchasingHeader';
import { useQuery } from '@tanstack/react-query';
import { fetchSelectedQuoteItems, fetchChefRequests } from '@/services/purchasingService';
import { toast } from 'sonner';

const PurchasingAssistant = () => {
  // Fetch selected quote items
  const { data: selectedItems = [], isLoading: isLoadingItems, error: itemsError } = useQuery({
    queryKey: ['selectedQuoteItems'],
    queryFn: fetchSelectedQuoteItems,
  });

  // Fetch original chef requests
  const { data: chefRequests = [], isLoading: isLoadingRequests, error: requestsError } = useQuery({
    queryKey: ['chefRequests'],
    queryFn: fetchChefRequests,
  });

  // Show toast for errors
  React.useEffect(() => {
    if (itemsError) {
      toast.error("Failed to load selected items");
    }
    if (requestsError) {
      toast.error("Failed to load chef requests");
    }
  }, [itemsError, requestsError]);

  const isLoading = isLoadingItems || isLoadingRequests;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <PurchasingHeader />
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-8">
                <OrderCoverageSummary 
                  selectedItems={selectedItems} 
                  chefRequests={chefRequests} 
                />
                
                <MissingItemsAlert 
                  selectedItems={selectedItems} 
                  chefRequests={chefRequests} 
                />
                
                <SupplierOrderMapping 
                  selectedItems={selectedItems} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PurchasingAssistant;
