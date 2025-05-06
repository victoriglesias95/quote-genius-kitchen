
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';

export type ItemType = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
};

interface ItemsListProps {
  items: ItemType[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof ItemType, value: string) => void;
}

export function ItemsList({ items, onAddItem, onRemoveItem, onItemChange }: ItemsListProps) {
  return (
    <div className="space-y-4 mt-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-end gap-2">
          <div className="flex-grow">
            <Label htmlFor={`item-${item.id}`} className="sr-only">Item {index + 1}</Label>
            <Input 
              id={`item-${item.id}`} 
              value={item.name} 
              onChange={e => onItemChange(item.id, 'name', e.target.value)}
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
              onChange={e => onItemChange(item.id, 'quantity', e.target.value)}
              placeholder="Qty" 
              className="mb-0" 
              required 
            />
          </div>
          <div className="w-24">
            <Label htmlFor={`unit-${item.id}`} className="sr-only">Unit</Label>
            <Select
              value={item.unit}
              onValueChange={value => onItemChange(item.id, 'unit', value)}
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
            onClick={() => onRemoveItem(item.id)}
            disabled={items.length === 1}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={onAddItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>
    </div>
  );
}
