
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  groupItemsBySupplier, 
  suggestOrderOptimization, 
  SelectedQuoteItem, 
  SupplierGroup 
} from '@/services/purchasingService';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface SupplierOrderMappingProps {
  selectedItems: SelectedQuoteItem[];
}

export function SupplierOrderMapping({ selectedItems }: SupplierOrderMappingProps) {
  // State to track items added to the order
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  
  // State to track which suggestions have been applied
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  
  // Group selected items by supplier
  const [supplierGroups, setSupplierGroups] = useState(() => 
    groupItemsBySupplier(selectedItems)
  );
  
  // Get optimization suggestions
  const optimizationSuggestions = useMemo(() => {
    return suggestOrderOptimization(supplierGroups);
  }, [supplierGroups]);

  // Handle applying an optimization suggestion
  const handleApplySuggestion = (suggestionIndex: number) => {
    const suggestion = optimizationSuggestions[suggestionIndex];
    if (!suggestion) return;

    // Create new supplier groups by moving items from one supplier to another
    const updatedGroups = [...supplierGroups];
    
    // Find the source and target supplier groups
    const fromSupplierIndex = updatedGroups.findIndex(g => g.supplierId === suggestion.fromSupplier.supplierId);
    const toSupplierIndex = updatedGroups.findIndex(g => g.supplierId === suggestion.toSupplier.supplierId);
    
    if (fromSupplierIndex === -1 || toSupplierIndex === -1) return;
    
    // Get the IDs of items to move
    const itemIdsToMove = suggestion.items.map(item => item.id);
    
    // Move items from source to target
    const itemsToMove = updatedGroups[fromSupplierIndex].items.filter(item => 
      itemIdsToMove.includes(item.id)
    );
    
    // Remove items from source
    updatedGroups[fromSupplierIndex].items = updatedGroups[fromSupplierIndex].items.filter(item => 
      !itemIdsToMove.includes(item.id)
    );
    
    // Update source supplier metrics
    updatedGroups[fromSupplierIndex].itemCount -= itemsToMove.length;
    updatedGroups[fromSupplierIndex].totalValue -= itemsToMove.reduce((sum, item) => sum + item.totalPrice, 0);
    updatedGroups[fromSupplierIndex].isSmallOrder = 
      updatedGroups[fromSupplierIndex].itemCount <= 2 && 
      updatedGroups[fromSupplierIndex].totalValue < 50;
    
    // Add items to target
    updatedGroups[toSupplierIndex].items = [
      ...updatedGroups[toSupplierIndex].items,
      ...itemsToMove
    ];
    
    // Update target supplier metrics
    updatedGroups[toSupplierIndex].itemCount += itemsToMove.length;
    updatedGroups[toSupplierIndex].totalValue += itemsToMove.reduce((sum, item) => sum + item.totalPrice, 0);
    updatedGroups[toSupplierIndex].isSmallOrder = 
      updatedGroups[toSupplierIndex].itemCount <= 2 && 
      updatedGroups[toSupplierIndex].totalValue < 50;
    
    // If source supplier has no items left, remove it
    const filteredGroups = updatedGroups.filter(g => g.itemCount > 0);
    
    // Update state
    setSupplierGroups(filteredGroups);
    
    // Mark suggestion as applied
    setAppliedSuggestions(prev => {
      const updated = new Set(prev);
      updated.add(suggestionIndex);
      return updated;
    });
    
    toast.success("Suggestion applied successfully");
  };

  // Handle ignoring a suggestion
  const handleIgnoreSuggestion = (suggestionIndex: number) => {
    setAppliedSuggestions(prev => {
      const updated = new Set(prev);
      updated.add(suggestionIndex);
      return updated;
    });
    
    toast.info("Suggestion ignored");
  };

  // Handle adding items to order
  const handleAddToOrder = (supplierId: string) => {
    const supplier = supplierGroups.find(s => s.supplierId === supplierId);
    if (!supplier) return;
    
    // Mark all items from this supplier as added
    const updatedAddedItems = new Set(addedItems);
    supplier.items.forEach(item => {
      updatedAddedItems.add(item.id);
    });
    
    setAddedItems(updatedAddedItems);
    
    toast.success(`Added ${supplier.itemCount} items from ${supplier.supplierName} to order`);
  };

  // Check if all items from a supplier are added to order
  const areAllItemsAdded = (supplierId: string) => {
    const supplier = supplierGroups.find(s => s.supplierId === supplierId);
    if (!supplier) return false;
    
    return supplier.items.every(item => addedItems.has(item.id));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Supplier Order Mapping</CardTitle>
        <CardDescription>
          Products grouped by supplier with order optimization suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optimization Suggestions */}
        {optimizationSuggestions.length > 0 && (
          <Alert className="bg-amber-50 text-amber-900 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle>Order Optimization Suggestions</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion, index) => {
                  // Skip if already applied or ignored
                  if (appliedSuggestions.has(index)) return null;
                  
                  return (
                    <div key={index} className="p-3 bg-white border border-amber-100 rounded-md">
                      <p className="text-sm font-medium mb-2">
                        Consider moving {suggestion.items.length} item{suggestion.items.length > 1 ? 's' : ''} 
                        from <span className="text-amber-700">{suggestion.fromSupplier.supplierName}</span> to 
                        <span className="text-green-700"> {suggestion.toSupplier.supplierName}</span>
                      </p>
                      <div className="pl-4">
                        <ul className="list-disc space-y-1 text-sm text-gray-600">
                          {suggestion.items.map(item => (
                            <li key={item.id}>
                              {item.itemName} ({item.quantity} {item.unit}) - ${item.totalPrice.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApplySuggestion(index)}
                        >
                          Apply Suggestion
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleIgnoreSuggestion(index)}
                        >
                          Ignore
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Show a success message when all suggestions are handled */}
        {optimizationSuggestions.length > 0 && 
         appliedSuggestions.size === optimizationSuggestions.length && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Orders Optimized</AlertTitle>
            <AlertDescription>
              All optimization suggestions have been addressed.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Supplier Groups */}
        <div className="space-y-4">
          {supplierGroups.map((supplier) => (
            <SupplierOrderCard 
              key={supplier.supplierId} 
              supplier={supplier} 
              isAdded={areAllItemsAdded(supplier.supplierId)}
              onAddToOrder={() => handleAddToOrder(supplier.supplierId)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SupplierOrderCardProps {
  supplier: SupplierGroup;
  isAdded: boolean;
  onAddToOrder: () => void;
}

function SupplierOrderCard({ supplier, isAdded, onAddToOrder }: SupplierOrderCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${supplier.isSmallOrder ? 'border-amber-200 bg-amber-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{supplier.supplierName}</h3>
          <div className="flex gap-2 items-center mt-1">
            <Badge variant={supplier.isSmallOrder ? "outline" : "default"} className={supplier.isSmallOrder ? "border-amber-500 text-amber-700 bg-amber-100" : ""}>
              {supplier.itemCount} item{supplier.itemCount !== 1 ? 's' : ''}
            </Badge>
            <span className="font-medium">
              ${supplier.totalValue.toFixed(2)}
            </span>
          </div>
        </div>
        
        {supplier.isSmallOrder && (
          <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-100">
            Small Order
          </Badge>
        )}
      </div>
      
      <div className="mt-3 space-y-2">
        {supplier.items.map((item) => (
          <div key={item.id} className="flex justify-between p-2 bg-white rounded border border-gray-100">
            <div className="flex-1">
              <div className="font-medium">{item.itemName}</div>
              <div className="text-sm text-gray-600">
                {item.quantity} {item.unit} × ${item.price.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center">
              <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <Button 
          className="w-full" 
          disabled={isAdded}
          onClick={onAddToOrder}
        >
          {isAdded ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Added to Order
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
