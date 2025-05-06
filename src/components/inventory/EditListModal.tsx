
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: string;
  unit: string;
  counted: boolean;
  actualCount?: number | null;
  productDatabaseId?: string;
}

interface EditListModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  categoryProducts: InventoryItem[];
  availableProducts: any[];
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
  onAddProduct: () => void;
  onRemoveFromList: (id: string) => void;
}

const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onOpenChange,
  selectedCategory,
  categoryProducts,
  availableProducts,
  selectedProduct,
  setSelectedProduct,
  selectedUnit,
  setSelectedUnit,
  onAddProduct,
  onRemoveFromList
}) => {
  const [requestAmounts, setRequestAmounts] = useState<Record<string, number>>({});
  const [categoryAvailableProducts, setCategoryAvailableProducts] = useState<any[]>([]);
  const [displayMode, setDisplayMode] = useState<'current' | 'add'>('current');
  
  // Update request amounts when products change
  useEffect(() => {
    const initialAmounts: Record<string, number> = {};
    categoryProducts.forEach(item => {
      initialAmounts[item.id] = 0;
    });
    setRequestAmounts(initialAmounts);
  }, [categoryProducts]);
  
  // Filter available products by selected category
  useEffect(() => {
    if (selectedCategory) {
      const filteredProducts = availableProducts.filter(p => p.category === selectedCategory);
      setCategoryAvailableProducts(filteredProducts);
    }
  }, [selectedCategory, availableProducts]);
  
  const handleRequestAmountChange = (id: string, amount: number) => {
    setRequestAmounts(prev => ({
      ...prev,
      [id]: amount
    }));
  };
  
  const handleCreateRequest = () => {
    // Get items with request amounts > 0
    const requestItems = Object.entries(requestAmounts)
      .filter(([_, amount]) => amount > 0)
      .map(([id]) => {
        const item = categoryProducts.find(p => p.id === id);
        return item;
      });
    
    if (requestItems.length === 0) {
      toast.error('Please add items to your request');
      return;
    }
    
    toast.success(`Created request with ${requestItems.length} items`);
    // Reset request amounts
    const resetAmounts: Record<string, number> = {};
    categoryProducts.forEach(item => {
      resetAmounts[item.id] = 0;
    });
    setRequestAmounts(resetAmounts);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {selectedCategory} Inventory List</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">
              {displayMode === 'current' ? 'Current Items' : 'Add New Items'}
            </h3>
            <div className="flex gap-2">
              <Button 
                variant={displayMode === 'current' ? "default" : "outline"} 
                size="sm"
                onClick={() => setDisplayMode('current')}
              >
                Current
              </Button>
              <Button 
                variant={displayMode === 'add' ? "default" : "outline"} 
                size="sm"
                onClick={() => setDisplayMode('add')}
              >
                Add New
              </Button>
            </div>
          </div>
          
          {displayMode === 'current' ? (
            <>
              {categoryProducts.length === 0 ? (
                <p className="text-gray-500">No items in this category</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categoryProducts.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex-grow">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">
                            Stock: <span className={`font-medium ${item.currentStock === 'Low' ? 'text-red-500' : item.currentStock === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>{item.currentStock}</span>
                          </span>
                          <span className="text-gray-500">Unit: {item.unit}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Input 
                            type="number" 
                            min="0"
                            value={requestAmounts[item.id] || 0}
                            onChange={(e) => handleRequestAmountChange(item.id, parseInt(e.target.value) || 0)}
                            className="h-8 text-sm"
                            placeholder="Qty"
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => onRemoveFromList(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {categoryProducts.length > 0 && (
                <Button 
                  onClick={handleCreateRequest}
                  className="w-full mt-4"
                >
                  Create Order Request
                </Button>
              )}
            </>
          ) : (
            <div className="border-t pt-4">
              <div className="flex items-end gap-2 mt-2">
                <div className="flex-grow">
                  <Label htmlFor="addProduct">Product</Label>
                  <Select 
                    value={selectedProduct} 
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryAvailableProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={selectedUnit} 
                    onValueChange={setSelectedUnit}
                    disabled={!selectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct && 
                        categoryAvailableProducts.find(p => p.id === selectedProduct)?.units.map((unit: string) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={onAddProduct}
                  disabled={!selectedProduct || !selectedUnit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditListModal;
