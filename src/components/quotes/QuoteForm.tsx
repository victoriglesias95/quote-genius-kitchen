
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Calendar as CalendarIcon, Plus, Trash } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { sampleSuppliers } from '@/pages/Suppliers';

type ItemType = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
};

export function QuoteForm() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week from now
  );
  
  const [items, setItems] = useState<ItemType[]>([
    { id: '1', name: '', quantity: '', unit: 'kg' }
  ]);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // Handle supplier selection
  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    
    // Find the selected supplier
    const selectedSupplier = sampleSuppliers.find(supplier => supplier.id === supplierId);
    
    if (selectedSupplier && selectedSupplier.products.length > 0) {
      // Map supplier products to items format
      const supplierItems: ItemType[] = selectedSupplier.products.map(product => ({
        id: product.id,
        name: product.name,
        quantity: '1', // Default quantity
        unit: product.unit
      }));
      
      setItems(supplierItems);
    } else {
      // Reset to one empty item if no products
      setItems([{ id: '1', name: '', quantity: '', unit: 'kg' }]);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: String(Date.now()), name: '', quantity: '', unit: 'kg' }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof ItemType, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    
    toast({
      title: "Quote Request Sent",
      description: "Your quote request has been successfully sent to the supplier.",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>New Quote Request</CardTitle>
          <CardDescription>Request quotes for ingredients or supplies from your suppliers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title</Label>
              <Input id="title" placeholder="e.g., Weekly Produce Order" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select 
                required
                value={selectedSupplierId}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {sampleSuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Required By Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgent">Priority</Label>
              <div className="flex items-center space-x-2 h-10 pt-2">
                <Switch id="urgent" />
                <Label htmlFor="urgent">Mark as Urgent</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" placeholder="Any specific requirements or notes for the supplier" />
          </div>

          <Separator className="my-4" />
          
          <div>
            <Label>Items</Label>
            <div className="space-y-4 mt-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor={`item-${item.id}`} className="sr-only">Item {index + 1}</Label>
                    <Input 
                      id={`item-${item.id}`} 
                      value={item.name} 
                      onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                      placeholder="Item name" 
                      className="mb-0" 
                      required 
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`qty-${item.id}`} className="sr-only">Quantity</Label>
                    <Input 
                      id={`qty-${item.id}`} 
                      value={item.quantity} 
                      onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                      placeholder="Qty" 
                      className="mb-0" 
                      required 
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`unit-${item.id}`} className="sr-only">Unit</Label>
                    <Select
                      value={item.unit}
                      onValueChange={value => handleItemChange(item.id, 'unit', value)}
                    >
                      <SelectTrigger id={`unit-${item.id}`} className="mb-0">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">L</SelectItem>
                        <SelectItem value="ml">mL</SelectItem>
                        <SelectItem value="unit">unit</SelectItem>
                        <SelectItem value="box">box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Send Quote Request</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
