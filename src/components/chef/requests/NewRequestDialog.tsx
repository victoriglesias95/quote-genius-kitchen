
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUniqueCategories, getProductsByCategory } from '@/data/productDatabase';
import { InventoryItem } from '@/components/inventory/types';
import { Request } from './types';

interface RequestItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  stockStatus: string;
  stockValue?: string | number;
}

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleInventory: InventoryItem[];
  onRequestCreated?: (request: Request) => void;
}

export const NewRequestDialog: React.FC<NewRequestDialogProps> = ({ 
  open, 
  onOpenChange, 
  sampleInventory,
  onRequestCreated 
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<RequestItem[]>([{ id: '1', name: '', quantity: '', unit: '', stockStatus: '' }]);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  
  // Get all available categories from database
  const categories = getUniqueCategories();
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTitle('');
      setCategory('');
      setDueDate('');
      setNotes('');
      setItems([{ id: '1', name: '', quantity: '', unit: '', stockStatus: '' }]);
      setCategoryProducts([]);
    }
  }, [open]);
  
  // When category changes, update the product list
  useEffect(() => {
    if (category) {
      // Get products for the selected category
      const products = getProductsByCategory(category);
      
      // Combine with inventory data to show stock levels
      const productsWithStock = products.map(product => {
        const inventoryItem = sampleInventory.find(item => 
          item.name.toLowerCase() === product.name.toLowerCase() && 
          item.category.toLowerCase() === category.toLowerCase()
        );
        
        return {
          ...product,
          currentStock: inventoryItem?.currentStock || 'Unknown',
          stockValue: inventoryItem?.actualCount !== undefined ? inventoryItem.actualCount : 'No count',
          defaultUnit: product.units[0] || 'kg'
        };
      });
      
      setCategoryProducts(productsWithStock);
      
      // Pre-populate items with products from this category
      if (productsWithStock.length > 0) {
        setItems(
          productsWithStock.map((product, index) => ({
            id: `item-${index + 1}`,
            name: product.name,
            quantity: '',
            unit: product.defaultUnit,
            stockStatus: product.currentStock,
            stockValue: product.stockValue
          }))
        );
      }
    } else {
      setCategoryProducts([]);
      setItems([{ id: '1', name: '', quantity: '', unit: '', stockStatus: '' }]);
    }
  }, [category, sampleInventory]);
  
  const handleAddItem = () => {
    setItems([...items, { 
      id: `item-${items.length + 1}`, 
      name: '', 
      quantity: '', 
      unit: 'kg', 
      stockStatus: '',
      stockValue: 'No count'
    }]);
  };
  
  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  const handleItemChange = (id: string, field: string, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // If changing the name, also update the stock status and unit
        if (field === 'name') {
          const selectedProduct = categoryProducts.find(p => p.name === value);
          return { 
            ...item, 
            [field]: value,
            stockStatus: selectedProduct?.currentStock || '',
            stockValue: selectedProduct?.stockValue || 'No count',
            unit: selectedProduct?.defaultUnit || item.unit
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !category || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check if all items have names and quantities
    const validItems = items.every(item => item.name && item.quantity);
    if (!validItems) {
      toast.error("Please specify name and quantity for all items");
      return;
    }
    
    // Create a new request object
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      title: title,
      status: 'pending',
      dueDate: new Date(dueDate),
      category: category,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: parseFloat(item.quantity),
        unit: item.unit
      })),
      notes: notes
    };
    
    // In a real application, this would be sent to a backend API
    console.log("New request created:", newRequest);
    
    // Call the onRequestCreated function if provided
    if (onRequestCreated) {
      onRequestCreated(newRequest);
    }
    
    toast.success("Request created successfully");
    toast.info("Request sent to purchasing department for processing");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Create a new order request for your kitchen supplies.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 py-2">
          <form id="request-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Request Title</Label>
                <Input 
                  id="title" 
                  placeholder="E.g., Weekly Produce Order" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Required By</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required 
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Items</Label>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <div className="mb-1 text-xs text-gray-500">Name</div>
                        <Select 
                          value={item.name} 
                          onValueChange={(value) => handleItemChange(item.id, 'name', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryProducts.map((product) => (
                              <SelectItem key={product.id} value={product.name}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <div className="mb-1 text-xs text-gray-500">Qty</div>
                        <Input 
                          placeholder="Qty" 
                          className="h-9"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="w-20">
                        <div className="mb-1 text-xs text-gray-500">Unit</div>
                        <Select 
                          value={item.unit} 
                          onValueChange={(value) => handleItemChange(item.id, 'unit', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="each">each</SelectItem>
                            <SelectItem value="liter">liter</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="box">box</SelectItem>
                            <SelectItem value="dozen">dozen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-24 flex-shrink-0">
                        <div className="mb-1 text-xs text-gray-500">In Stock</div>
                        <div className="h-9 flex items-center border rounded px-2 bg-gray-50">
                          <span className="text-sm">
                            {item.stockValue !== undefined ? item.stockValue : 'No count'}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 flex-shrink-0 mt-6"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={handleAddItem}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Another Item
                </Button>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any specific requirements or notes for the supplier"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)} 
                />
              </div>
            </div>
          </form>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="request-form">Create Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

