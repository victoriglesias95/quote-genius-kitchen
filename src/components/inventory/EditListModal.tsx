
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {selectedCategory} Inventory List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <h3 className="text-lg font-medium">Current Items</h3>
          {categoryProducts.length === 0 ? (
            <p className="text-gray-500">No items in this category</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categoryProducts.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Unit: {item.unit}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRemoveFromList(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium">Add Items</h3>
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
                    {availableProducts.map(product => (
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
                      availableProducts.find(p => p.id === selectedProduct)?.units.map((unit: string) => (
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
