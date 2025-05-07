
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  fetchSelectedQuoteItems, 
  fetchChefRequests, 
  validateSupplierData,
  MissingItem, 
  SelectedQuoteItem,
  groupItemsBySupplier,
  storeManuallyAddedItem,
  clearManuallyAddedItems,
  findMissingItems
} from '@/services/purchasingService';
import { toast } from 'sonner';

export function usePurchasingFlow() {
  // State management
  const [locallyAddedItems, setLocallyAddedItems] = useState<SelectedQuoteItem[]>([]);
  const [manuallySelectedItems, setManuallySelectedItems] = useState<Record<string, boolean>>({});
  const [skippedItems, setSkippedItems] = useState<Array<{ item: MissingItem, reason: string }>>([]);
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  const [handledMissingItems, setHandledMissingItems] = useState<Set<string>>(new Set());
  
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

  // Calculate missing items
  const missingItems = useMemo(() => {
    return findMissingItems(selectedItems, chefRequests);
  }, [selectedItems, chefRequests]);
  
  // Filter out handled missing items
  const activeMissingItems = useMemo(() => {
    return missingItems.filter(
      item => !handledMissingItems.has(`${item.name}-${item.requestId}`)
    );
  }, [missingItems, handledMissingItems]);

  // Group items by supplier
  const supplierGroups = useMemo(() => {
    return groupItemsBySupplier(selectedItems);
  }, [selectedItems]);

  // Mutation for adding a missing item from a quote
  const addMissingItemMutation = useMutation({
    mutationFn: async ({ item, supplierId }: { item: MissingItem; supplierId: string }) => {
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
  const handleAddManualItem = useCallback(async (item: SelectedQuoteItem) => {
    try {
      const storedItem = await storeManuallyAddedItem(item);
      setLocallyAddedItems(prev => [...prev, storedItem]);
      
      setManuallySelectedItems(prev => ({
        ...prev,
        [storedItem.id]: true
      }));
      
      setTimeout(() => {
        refetchValidation();
      }, 100);
      
      return storedItem;
    } catch (error) {
      toast.error("Failed to add manual item");
      console.error(error);
      throw error;
    }
  }, [refetchValidation]);

  // Handle updating an item's quantity
  const handleUpdateItemQuantity = useCallback(async (item: SelectedQuoteItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    
    try {
      // Find if this is a local item
      const isLocalItem = locallyAddedItems.some(localItem => localItem.id === item.id);
      
      if (isLocalItem) {
        // Update local item
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
        }).filter(Boolean); // Ensure no undefined values
        
        const updatedItem = updatedLocalItems.find(localItem => localItem.id === item.id);
        if (updatedItem) {
          await storeManuallyAddedItem(updatedItem);
        }
        
        setLocallyAddedItems(updatedLocalItems);
      } else {
        // Create a local override for server item
        const updatedItem: SelectedQuoteItem = {
          ...item,
          id: `local-override-${item.id}`,
          quantity: newQuantity,
          totalPrice: item.price * newQuantity,
          isManuallySelected: true
        };
        
        const storedOverride = await storeManuallyAddedItem(updatedItem);
        
        // Remove any existing override, then add the new one
        setLocallyAddedItems(prev => [
          ...prev.filter(i => i.id !== `local-override-${item.id}`), 
          storedOverride
        ]);
        
        setManuallySelectedItems(prev => ({
          ...prev,
          [`local-override-${item.id}`]: true
        }));
      }
      
      setTimeout(() => {
        refetchValidation();
      }, 100);
      
      return true;
    } catch (error) {
      toast.error("Failed to update item quantity");
      console.error(error);
      return false;
    }
  }, [locallyAddedItems, refetchValidation]);
  
  // Mutation for placing orders
  const placeOrderMutation = useMutation({
    mutationFn: async (items: SelectedQuoteItem[]) => {
      // Validate data one more time before submission
      await validateSupplierData(items);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear any stored manually added items
      await clearManuallyAddedItems();
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Orders placed successfully");
    },
    onError: () => {
      toast.error("Failed to place orders");
    }
  });

  // Handle skipping a missing item
  const handleSkipMissingItem = useCallback((item: MissingItem, reason: string) => {
    setSkippedItems(prev => [...prev, { item, reason }]);
    setHandledMissingItems(prev => {
      const updated = new Set(prev);
      updated.add(`${item.name}-${item.requestId}`);
      return updated;
    });
  }, []);

  // Handle adding missing item
  const handleAddMissingItem = useCallback((item: MissingItem, supplierId: string) => {
    addMissingItemMutation.mutate({ item, supplierId });
    
    setHandledMissingItems(prev => {
      const updated = new Set(prev);
      updated.add(`${item.name}-${item.requestId}`);
      return updated;
    });
  }, [addMissingItemMutation]);
  
  // Handle updating special instructions
  const handleUpdateInstructions = useCallback((supplierId: string, instructions: string) => {
    setSpecialInstructions(prev => ({
      ...prev,
      [supplierId]: instructions
    }));
  }, []);

  const isLoading = isLoadingItems || isLoadingRequests || isValidating;
  const validationIssues = validationResults?.issues || [];
  const hasValidationIssues = validationIssues.length > 0;

  return {
    // State
    selectedItems,
    manuallySelectedItems,
    skippedItems,
    specialInstructions,
    supplierGroups,
    missingItems: activeMissingItems,
    
    // Data status
    isLoading,
    validationResults,
    validationIssues,
    hasValidationIssues,
    
    // Actions
    handleAddManualItem,
    handleUpdateItemQuantity,
    handleSkipMissingItem,
    handleAddMissingItem,
    handleUpdateInstructions,
    placeOrder: placeOrderMutation.mutate,
    
    // Status
    isPlacingOrder: placeOrderMutation.isPending,
    hasError: !!itemsError || !!requestsError || !!validationError,
    
    // Refetch
    refetchValidation
  };
}
