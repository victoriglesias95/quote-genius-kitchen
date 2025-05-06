
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SupplierSelector } from '@/components/quotes/SupplierSelector';
import { DateSelector } from '@/components/quotes/DateSelector';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface FormBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  selectedSupplierId: string;
  onSupplierChange: (supplierId: string, supplierName: string) => void;
  isUrgent: boolean;
  setIsUrgent: (isUrgent: boolean) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

export const FormBasicFields: React.FC<FormBasicFieldsProps> = ({
  title,
  setTitle,
  date,
  setDate,
  selectedSupplierId,
  onSupplierChange,
  isUrgent,
  setIsUrgent,
  notes,
  setNotes
}) => {
  return (
    <div className="space-y-4">
      {/* Title field */}
      <div>
        <Label htmlFor="title">Quote Title</Label>
        <Input
          id="title"
          placeholder="E.g., Weekly Produce Order"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>
      
      {/* Supplier selection */}
      <SupplierSelector 
        value={selectedSupplierId} 
        onValueChange={onSupplierChange} 
      />
      
      {/* Date selection */}
      <DateSelector 
        label="Required By Date"
        date={date} 
        setDate={setDate} 
      />
      
      {/* Urgent flag */}
      <div className="flex items-center space-x-2">
        <Switch
          id="urgent"
          checked={isUrgent}
          onCheckedChange={setIsUrgent}
        />
        <Label htmlFor="urgent" className="cursor-pointer">Mark as Urgent</Label>
      </div>
      
      {/* Notes field */}
      <div>
        <Label htmlFor="notes">Notes for Supplier</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information for the supplier..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
};
