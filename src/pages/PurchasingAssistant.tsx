
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { SupplierOrderMapping } from '@/components/purchasing/SupplierOrderMapping';
import { MissingItemsAlert } from '@/components/purchasing/MissingItemsAlert';
import { OrderCoverageSummary } from '@/components/purchasing/OrderCoverageSummary';
import { PurchasingHeader } from '@/components/purchasing/PurchasingHeader';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchSelectedQuoteItems, fetchChefRequests, MissingItem, SelectedQuoteItem } from '@/services/purchasingService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, AlertCircle } from 'lucide-react';

const PurchasingAssistant = () => {
  const navigate = useNavigate();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [itemsToOrder, setItemsToOrder] = useState<SelectedQuoteItem[]>([]);
  
  // Fetch selected quote items
  const { 
    data: selectedItems = [], 
    isLoading: isLoadingItems, 
    error: itemsError,
    refetch: refetchSelectedItems
  } = useQuery({
    queryKey: ['selectedQuoteItems'],
    queryFn: fetchSelectedQuoteItems,
  });

  // Fetch original chef requests
  const { 
    data: chefRequests = [], 
    isLoading: isLoadingRequests, 
    error: requestsError 
  } = useQuery({
    queryKey: ['chefRequests'],
    queryFn: fetchChefRequests,
  });

  // Mutation for adding a missing item from a quote
  const addMissingItemMutation = useMutation({
    mutationFn: async ({ item, supplierId }: { item: MissingItem; supplierId: string }) => {
      // In a real app, this would be an API call to add the item
      // For now, we'll just simulate adding it to our local state
      const newItem: SelectedQuoteItem = {
        id: `new-item-${Date.now()}`,
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        supplierId: supplierId,
        supplierName: item.quotedBy.find(s => s.supplierId === supplierId)?.supplierName || '',
        price: item.quotedBy.find(s => s.supplierId === supplierId)?.price || 0,
        totalPrice: (item.quotedBy.find(s => s.supplierId === supplierId)?.price || 0) * item.quantity,
        requestId: item.requestId,
        requestTitle: item.requestTitle,
        isOptional: false
      };
      
      // In a real app, you would call an API to add the item
      // For now, we'll just simulate adding it and refetching
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return newItem;
    },
    onSuccess: (newItem) => {
      refetchSelectedItems();
      toast.success(`Added ${newItem.itemName} to selected items`);
    },
    onError: (error) => {
      toast.error("Failed to add item");
      console.error(error);
    }
  });

  // Mutation for placing orders
  const placeOrderMutation = useMutation({
    mutationFn: async (items: SelectedQuoteItem[]) => {
      // In a real app, this would call your API to place the orders
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Orders placed successfully");
      setIsOrderDialogOpen(false);
      navigate('/quotes');
    },
    onError: () => {
      toast.error("Failed to place orders");
    }
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
  
  // Handle adding missing item
  const handleAddMissingItem = (item: MissingItem, supplierId: string) => {
    addMissingItemMutation.mutate({ item, supplierId });
  };
  
  // Handle proceeding to place orders
  const handlePlaceOrders = () => {
    setItemsToOrder(selectedItems);
    setIsOrderDialogOpen(true);
  };
  
  // Handle confirming orders
  const handleConfirmOrders = () => {
    placeOrderMutation.mutate(itemsToOrder);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <PurchasingHeader />
              
              <Button 
                onClick={handlePlaceOrders}
                disabled={selectedItems.length === 0 || addMissingItemMutation.isPending}
                className="ml-auto"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Place Orders
              </Button>
            </div>
            
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
                  onAddMissingItem={handleAddMissingItem}
                />
                
                <SupplierOrderMapping 
                  selectedItems={selectedItems} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Confirmation Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Orders</DialogTitle>
            <DialogDescription>
              You are about to place orders with {new Set(itemsToOrder.map(item => item.supplierId)).size} suppliers for a total of {itemsToOrder.length} items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <ul className="space-y-2">
                {Array.from(new Set(itemsToOrder.map(item => item.supplierId))).map(supplierId => {
                  const supplierItems = itemsToOrder.filter(item => item.supplierId === supplierId);
                  const supplier = supplierItems[0];
                  const totalAmount = supplierItems.reduce((sum, item) => sum + item.totalPrice, 0);
                  
                  return (
                    <li key={supplierId} className="flex justify-between">
                      <span>{supplier.supplierName} ({supplierItems.length} items)</span>
                      <span className="font-medium">${totalAmount.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 pt-2 border-t flex justify-between font-bold">
                <span>Total</span>
                <span>${itemsToOrder.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
              </div>
            </div>
            
            {chefRequests.some(request => {
              const requestItems = request.items || [];
              return requestItems.some(item => 
                !itemsToOrder.some(orderItem => 
                  orderItem.itemName.toLowerCase() === item.name.toLowerCase() &&
                  orderItem.requestId === request.id
                )
              );
            }) && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <div className="text-amber-800 text-sm">
                  Some items from chef requests are still not included in your orders. 
                  Are you sure you want to proceed?
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmOrders}
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? "Processing..." : "Confirm Orders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default PurchasingAssistant;
