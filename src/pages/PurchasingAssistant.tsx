
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
  
  // NEW: State to track locally added items (before they are persisted to storage)
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

  // Validate supplier data
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
      
      // In a real app, you would call an API to add the item
      // For this demo, we'll store it in localStorage and update our local state
      await storeManuallyAddedItem(newItem);
      
      return newItem;
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
      refetchValidation();
    },
    onError: (error) => {
      toast.error("Failed to add item");
      console.error(error);
    }
  });

  // Mutation for placing orders
  const placeOrderMutation = useMutation({
    mutationFn: async (items: SelectedQuoteItem[]) => {
      // Validate data one more time before submission
      const validationResults = await validateSupplierData(items);
      
      if (!validationResults.isValid) {
        throw new Error("Validation failed. Please review the validation errors.");
      }
      
      // In a real app, this would call your API to place the orders
      // For now, we'll just simulate it
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
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <PurchasingHeader />
              
              <Button 
                onClick={handlePlaceOrders}
                disabled={selectedItems.length === 0 || addMissingItemMutation.isPending}
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
              <div className="space-y-8">
                <OrderCoverageSummary 
                  selectedItems={selectedItems} 
                  chefRequests={chefRequests}
                />
                
                <MissingItemsAlert 
                  selectedItems={selectedItems} 
                  chefRequests={chefRequests}
                  onAddMissingItem={handleAddMissingItem}
                  onSkipItem={handleSkipMissingItem}
                />
                
                {validationResults && !validationResults.isValid && (
                  <Card className="border-amber-200">
                    <CardHeader className="bg-amber-50 rounded-t-lg border-b border-amber-100">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <CardTitle className="text-xl font-semibold text-amber-700">Data Validation Issues</CardTitle>
                      </div>
                      <CardDescription className="text-amber-600">
                        Please review the following issues before placing orders
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {validationIssues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2 text-amber-800">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                <SupplierOrderMapping 
                  selectedItems={selectedItems} 
                  manuallySelectedItems={manuallySelectedItems}
                />
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
              Please review each order carefully before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={supplierGroups.length > 0 ? (supplierGroups[0]?.supplierId || "summary") : "summary"}>
            <TabsList className="w-full">
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
                  <CardDescription>
                    Overview of all supplier orders
                  </CardDescription>
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
              
              {/* Validation warnings */}
              {hasValidationIssues && (
                <div className="mt-4">
                  <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Validation Issues</AlertTitle>
                    <AlertDescription>
                      There are {validationIssues.length} validation issues that should be addressed.
                      Check each supplier tab for details.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {/* Missing items summary */}
              {skippedItems.length > 0 && (
                <div className="mt-4">
                  <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Skipped Items</AlertTitle>
                    <AlertDescription>
                      {skippedItems.length} items were skipped from the original chef requests.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
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
                            {group.itemCount} items, total value: ${group.totalValue.toFixed(2)}
                          </CardDescription>
                        </div>
                        
                        {group.isSmallOrder && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Small Order
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Validation issues for this supplier */}
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
                        <label htmlFor={`instructions-${group.supplierId}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Special Instructions
                        </label>
                        <Textarea 
                          id={`instructions-${group.supplierId}`}
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
            
            {/* Conditionally show warnings if needed */}
            {hasValidationIssues && (
              <div className="flex items-center text-amber-600 text-sm mr-4">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>There are validation issues</span>
              </div>
            )}
            
            <Button 
              onClick={handleConfirmOrders}
              disabled={placeOrderMutation.isPending || (hasValidationIssues && !window.confirm("There are validation issues. Are you sure you want to proceed?"))}
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
