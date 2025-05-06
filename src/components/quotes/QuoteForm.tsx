
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { ItemsList, ItemType } from './ItemsList';
import { DateSelector } from './DateSelector';
import { SupplierSelector } from './SupplierSelector';
import { generateItemsFromSupplier } from './quoteFormUtils';

interface QuoteFormProps {
  chefRequestId?: string;
  chefRequestData?: {
    title: string;
    items: {
      name: string;
      quantity: string | number;
      unit: string;
    }[];
    dueDate?: Date;
  };
}

export function QuoteForm({ chefRequestId, chefRequestData }: QuoteFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState<string>(chefRequestData?.title || '');
  const [date, setDate] = useState<Date | undefined>(
    chefRequestData?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week from now
  );
  
  const [items, setItems] = useState<ItemType[]>(
    chefRequestData?.items?.map((item, index) => ({ 
      id: String(index + 1), 
      name: item.name, 
      quantity: String(item.quantity), 
      unit: item.unit 
    })) || [{ id: '1', name: '', quantity: '', unit: 'kg' }]
  );

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  // Handle supplier selection
  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    
    // Only override items if not coming from chef request
    if (!chefRequestData) {
      setItems(generateItemsFromSupplier(supplierId));
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
    
    // Validate form
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for this quote request.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSupplierId) {
      toast({
        title: "Missing Information",
        description: "Please select a supplier.",
        variant: "destructive"
      });
      return;
    }

    // Validate items
    const invalidItems = items.filter(item => !item.name.trim() || !item.quantity);
    if (invalidItems.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all item details.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you would send this data to your backend
    toast({
      title: "Quote Request Sent",
      description: "Your quote request has been successfully sent to the supplier.",
    });
    
    // Show a success toast and redirect to the quotes page
    toast.success("Quote request submitted successfully");
    
    // Redirect back to quotes page
    setTimeout(() => {
      navigate('/quotes');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{chefRequestId ? 'Convert Chef Request to Quote' : 'New Quote Request'}</CardTitle>
          <CardDescription>
            {chefRequestId ? 
              'Create a supplier quote request based on the chef\'s requirements' : 
              'Request quotes for ingredients or supplies from your suppliers'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Weekly Produce Order" 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
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
                <Switch 
                  id="urgent" 
                  checked={isUrgent}
                  onCheckedChange={setIsUrgent}
                />
                <Label htmlFor="urgent">Mark as Urgent</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any specific requirements or notes for the supplier" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
          <Button variant="outline" type="button" onClick={() => navigate('/quotes')}>
            Cancel
          </Button>
          <Button type="submit">Send Quote Request</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
