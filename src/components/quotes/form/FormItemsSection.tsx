
import React from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ItemsList, ItemType } from '../ItemsList';

interface FormItemsSectionProps {
  items: ItemType[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof ItemType, value: string) => void;
}

export const FormItemsSection: React.FC<FormItemsSectionProps> = ({ 
  items, onAddItem, onRemoveItem, onItemChange 
}) => {
  return (
    <div>
      <Separator className="my-4" />
      <div>
        <Label>Items</Label>
        <ItemsList 
          items={items}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onItemChange={onItemChange}
        />
      </div>
    </div>
  );
};
