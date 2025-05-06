
import React, { useState, useMemo, useCallback } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { SupplierOrderMapping } from '@/components/purchasing/SupplierOrderMapping';
import { MissingItemsAlert } from '@/components/purchasing/MissingItemsAlert';
import { OrderCoverageSummary } from '@/components/purchasing/OrderCoverageSummary';
import { PurchasingHeader } from '@/components/purchasing/PurchasingHeader';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  fetchSelectedQuoteItems, 
  fetchChefRequests, 
  validateSupplierData,
  MissingItem, 
  SelectedQuoteItem, 
  SupplierGroup,
  groupItemsBySupplier,
  storeManuallyAddedItem,
  clearManuallyAddedItems
} from '@/services/purchasingService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const PurchasingAssistant = () => {
  const navigate = useNavigate();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [skippedItems, setSkippedItems] = useState<Array<{ item: MissingItem, reason: string }>>([]);
  const [manuallySelectedItems, setManuallySelectedItems] = useState<Record<string, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  
  // State to track locally added items (before they are persisted to storage)
  const [locallyAddedItems, setLocallyAddedItems] = useState<SelectedQuoteItem[]>([]);
  
  // Fetch selected quote items
  const { 
    data: fetchedItems = [], 
    isLoading: isLoadingItems, 
    error: itemsError,
    refetch: refetchSelectedItems
  } = useQuery({
    queryKey: ['selectedQuoteItems'],
    queryFn: fetchSelectedQuoteItems,
  });

  // Combine fetched items with locally added items
  const selectedItems = useMemo(() => {
    return [...fetchedItems, ...locallyAddedItems];
  }, [fetchedItems, locallyAddedItems]);

  // Fetch original chef requests
  const { 
    data: chefRequests = [], 
    isLoading: isLoadingRequests, 
    error: requestsError 
  } = useQuery({
    queryKey: ['chefRequests'],
    queryFn: fetchChefRequests,
  });

  // Validate supplier data - use the combined selectedItems
  const {
    data: validationResults,
    isLoading: isValidating,
    error: validationError,
    refetch: refetchValidation
  } = useQuery({
    queryKey: ['supplierValidation', selectedItems.length],
    queryFn: () => validateSupplierData(selectedItems),
    enabled: selectedItems.length > 0
  });

  // Group items by supplier
  const supplierGroups = useMemo(() => {
    return groupItemsBySupplier(selectedItems);
  }, [selectedItems]);

  // Mutation for adding a missing item from a quote
  const addMissingItemMutation = useMutation({
    mutationFn: async ({ item, supplierId }: { item: MissingItem; supplierId: string }) => {
      // Create a new selected quote item
      const supplierInfo = item.quotedBy.find(s => s.supplierId === supplierId);
      
      if (!supplierInfo) {
        throw new Error("Supplier information not found");
      }
      
      const newItem: SelectedQuoteItem = {
        id: `new-item-${Date.now()}`,
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        supplierId: supplierId,
        supplierName: supplierInfo.supplierName,
        price: supplierInfo.price,
        totalPrice: supplierInfo.price * item.quantity,
        requestId: item.requestId,
        requestTitle: item.requestTitle,
        isOptional: false,
        isManuallySelected: true
      };
      
      // Store in localStorage and return the new item
      return await storeManuallyAddedItem(newItem);
    },
    onSuccess: (newItem) => {
      // Update local state to immediately reflect the added item
      setLocallyAddedItems(prev => [...prev, newItem]);
      
      // Track manually selected items
      setManuallySelectedItems(prev => ({
        ...prev,
        [newItem.id]: true
      }));
      
      toast.success(`Added ${newItem.itemName} to selected items`);
      
      // Refresh validation after adding an item
      setTimeout(() => {
        refetchValidation();
      }, 100);
    },
    onError: (error) => {
      toast.error("Failed to add item");
      console.error(error);
    }
  });

  // Handle manually adding a new item
  const handleAddManualItem = useCallback((item: SelectedQuoteItem) => {
    // First store in localStorage
    const addItemPromise = async () => {
      try {
        const storedItem = await storeManuallyAddedItem(item);
        // Then update local state
        setLocallyAddedItems(prev => [...prev, storedItem]);
        
        // Track as manually selected
        setManuallySelectedItems(prev => ({
          ...prev,
          [storedItem.id]: true
        }));
        
        // Refresh validation
        setTimeout(() => {
          refetchValidation();
        }, 100);
      } catch (error) {
        toast.error("Failed to add manual item");
        console.error(error);
      }
    };
    
    addItemPromise();
  }, [refetchValidation]);

  // Handle updating an item's quantity
  const handleUpdateItemQuantity = useCallback((item: SelectedQuoteItem, newQuantity: number) => {
    // Find the item in our local state
    const updatedItems = selectedItems.map(existingItem => {
      if (existingItem.id === item.id) {
        // Calculate the new total price
        const totalPrice = existingItem.price * newQuantity;
        
        // Return updated item with new quantity and total price
        return {
          ...existingItem,
          quantity: newQuantity,
          totalPrice
        };
      }
      return existingItem;
    });
    
    // If this is a local item, update it in local state
    if (locallyAddedItems.some(localItem => localItem.id === item.id)) {
      const updatedLocalItems = locallyAddedItems.map(localItem => {
        if (localItem.id === item.id) {
          const totalPrice = localItem.price * newQuantity;
          return {
            ...localItem,
            quantity: newQuantity,
            totalPrice
          };
        }
        return localItem;
      });
      
      // Update localStorage with the changed item
      const updatedItem = updatedLocalItems.find(localItem => localItem.id === item.id);
      if (updatedItem) {
        const updateStoragePromise = async () => {
          try {
            await storeManuallyAddedItem(updatedItem);
          } catch (error) {
            toast.error("Failed to update item in storage");
            console.error(error);
          }
        };
        
        updateStoragePromise();
      }
      
      // Update state
      setLocallyAddedItems(updatedLocalItems);
    } else {
      // For items from the server, we'd normally send an update to the server
      // For this demo, we'll just update locally by creating a local override
      const updatedItem = updatedItems.find(i => i.id === item.id);
      if (updatedItem) {
        // Create a local version that overrides the server version
        const localOverride: SelectedQuoteItem = {
          ...updatedItem,
          id: `local-override-${updatedItem.id}`,
          isManuallySelected: true
        };
        
        // Store it and add to local items
        const storeOverridePromise = async () => {
          try {
            const storedOverride = await storeManuallyAddedItem(localOverride);
            // Remove the original item by filtering it out when we merge arrays
            setLocallyAddedItems(prev => [...prev.filter(i => i.id !== `local-override-${updatedItem.id}`), storedOverride]);
            
            // Flag it as manually selected
            setManuallySelectedItems(prev => ({
              ...prev,
              [`local-override-${updatedItem.id}`]: true
            }));
            
            // Refresh validation
            setTimeout(() => {
              refetchValidation();
            }, 100);
          } catch (error) {
            toast.error("Failed to update item");
            console.error(error);
          }
        };
        
        storeOverridePromise();
      }
    }
  }, [selectedItems, locallyAddedItems, refetchValidation]);
  
  // Mutation for placing orders
  const placeOrderMutation = useMutation({
    mutationFn: async (items: SelectedQuoteItem[]) => {
      // Validate data one more time before submission
      const validationResults = await validateSupplierData(items);
      
      // For demo purposes, allow proceeding even with validation issues
      // In a real app, you might want to block this or prompt for confirmation
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear any stored manually added items
      clearManuallyAddedItems();
      
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

  // Handle skipping a missing item
  const handleSkipMissingItem = (item: MissingItem, reason: string) => {
    setSkippedItems(prev => [...prev, { item, reason }]);
  };

  // Handle adding missing item
  const handleAddMissingItem = useCallback((item: MissingItem, supplierId: string) => {
    addMissingItemMutation.mutate({ item, supplierId });
  }, [addMissingItemMutation]);
  
  // Handle proceeding to place orders
  const handlePlaceOrders = () => {
    setIsOrderDialogOpen(true);
  };
  
  // Handle confirming orders
  const handleConfirmOrders = () => {
    placeOrderMutation.mutate(selectedItems);
  };

  // Handle updating special instructions for a supplier
  const handleUpdateInstructions = (supplierId: string, instructions: string) => {
    setSpecialInstructions(prev => ({
      ...prev,
      [supplierId]: instructions
    }));
  };

  // Show toast for errors
  React.useEffect(() => {
    if (itemsError) {
      toast.error("Failed to load selected items");
    }
    if (requestsError) {
      toast.error("Failed to load chef requests");
    }
    if (validationError) {
      toast.error("Failed to validate supplier data");
    }
  }, [itemsError, requestsError, validationError]);

  const isLoading = isLoadingItems || isLoadingRequests || isValidating;
  
  // Get validation issues for dialog
  const validationIssues = validationResults?.issues || [];
  const hasValidationIssues = validationIssues.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <PurchasingHeader />
              
              <Button 
                onClick={handlePlaceOrders}
                disabled={selectedItems.length === 0 || addMissingItemMutation.isPending}
                size="lg"
                className="ml-auto"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Review & Place Orders
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Card with tabs for better organization */}
                <Card className="shadow-md">
                  <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 mb-2">
                      <TabsTrigger value="summary">Coverage Summary</TabsTrigger>
                      <TabsTrigger value="missing">Missing Items</TabsTrigger>
                      <TabsTrigger value="orders">Supplier Orders</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary" className="mt-0">
                      <CardContent className="pt-2">
                        <OrderCoverageSummary 
                          selectedItems={selectedItems} 
                          chefRequests={chefRequests}
                        />
                      </CardContent>
                    </TabsContent>
                    
                    <TabsContent value="missing" className="mt-0">
                      <CardContent className="pt-2">
                        <MissingItemsAlert 
                          selectedItems={selectedItems} 
                          chefRequests={chefRequests}
                          onAddMissingItem={handleAddMissingItem}
                          onSkipItem={handleSkipMissingItem}
                        />
                      </CardContent>
                    </TabsContent>
                    
                    <TabsContent value="orders" className="mt-0">
                      <CardContent className="pt-2">
                        {validationResults && !validationResults.isValid && (
                          <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertTitle>Data Validation Issues</AlertTitle>
                            <AlertDescription>
                              <div className="max-h-28 overflow-y-auto">
                                <ul className="list-disc list-inside space-y-1">
                                  {validationIssues.map((issue, index) => (
                                    <li key={index}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <SupplierOrderMapping 
                          selectedItems={selectedItems} 
                          manuallySelectedItems={manuallySelectedItems}
                          onUpdateItemQuantity={handleUpdateItemQuantity}
                          onAddManualItem={handleAddManualItem}
                        />
                      </CardContent>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Review & Confirmation Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review & Confirm Orders</DialogTitle>
            <DialogDescription>
              You are about to place orders with {supplierGroups.length} suppliers for a total of {selectedItems.length} items.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={supplierGroups.length > 0 ? (supplierGroups[0]?.supplierId || "summary") : "summary"}>
            <TabsList className="w-full mb-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {supplierGroups.map(group => (
                <TabsTrigger key={group.supplierId} value={group.supplierId}>
                  {group.supplierName}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierGroups.map(group => (
                        <TableRow key={group.supplierId}>
                          <TableCell className="font-medium">{group.supplierName}</TableCell>
                          <TableCell>{group.itemCount}</TableCell>
                          <TableCell className="text-right">${group.totalValue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-muted-foreground">
                    Total suppliers: {supplierGroups.length}
                  </div>
                  <div className="text-xl font-semibold">
                    Grand Total: ${selectedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                  </div>
                </CardFooter>
              </Card>
              
              {/* Simplified warnings section */}
              <div className="mt-4 flex flex-col gap-2">
                {hasValidationIssues && (
                  <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Validation Issues</AlertTitle>
                    <AlertDescription>
                      There are {validationIssues.length} validation issues that should be addressed.
                    </AlertDescription>
                  </Alert>
                )}
                
                {skippedItems.length > 0 && (
                  <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Skipped Items</AlertTitle>
                    <AlertDescription>
                      {skippedItems.length} items were skipped from the original chef requests.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            {supplierGroups.map(group => {
              const supplierValidationIssues = validationIssues.filter(issue => 
                issue.toLowerCase().includes(group.supplierName.toLowerCase())
              );
              
              return (
                <TabsContent key={group.supplierId} value={group.supplierId}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{group.supplierName}</CardTitle>
                          <CardDescription>
                            {group.itemCount} items, total: ${group.totalValue.toFixed(2)}
                          </CardDescription>
                        </div>
                        
                        {group.isSmallOrder && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">
                            Small Order
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Simplified validation issues */}
                      {supplierValidationIssues.length > 0 && (
                        <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertTitle>Validation Issues</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc list-inside">
                              {supplierValidationIssues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map(item => {
                            const isManuallySelected = manuallySelectedItems[item.id] || item.isManuallySelected;
                            
                            return (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    <span>{item.itemName}</span>
                                    {isManuallySelected && (
                                      <div className="ml-2" title="Manually selected supplier">
                                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.quantity} {item.unit}
                                </TableCell>
                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      
                      {/* Special instructions */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Instructions
                        </label>
                        <Textarea 
                          placeholder="Add any special instructions for this supplier..."
                          value={specialInstructions[group.supplierId] || ''}
                          onChange={(e) => handleUpdateInstructions(group.supplierId, e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)} className="sm:mr-auto">
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            
            {/* Simplified warning display */}
            {hasValidationIssues && (
              <div className="flex items-center text-amber-600 text-sm mr-4">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Issues exist</span>
              </div>
            )}
            
            <Button 
              onClick={handleConfirmOrders}
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? "Processing..." : "Confirm All Orders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default PurchasingAssistant;
