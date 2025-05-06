
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { ItemsList, ItemType } from './ItemsList';
import { DateSelector } from './DateSelector';
import { SupplierSelector } from './SupplierSelector';
import { generateItemsFromSupplier } from './quoteFormUtils';

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
    setItems(generateItemsFromSupplier(supplierId));
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
            
            <SupplierSelector 
              selectedSupplierId={selectedSupplierId}
              onSupplierChange={handleSupplierChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateSelector 
              date={date} 
              onDateChange={setDate} 
              label="Required By Date"
            />
            
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
            <ItemsList 
              items={items}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onItemChange={handleItemChange}
            />
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
