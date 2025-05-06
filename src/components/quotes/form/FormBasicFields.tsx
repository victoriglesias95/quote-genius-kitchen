
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateSelector } from '../DateSelector';
import { SupplierSelector } from '../SupplierSelector';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface FormBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  selectedSupplierId: string;
  onSupplierChange: (supplierId: string) => void;
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
    <>
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
          onSupplierChange={onSupplierChange}
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
    </>
  );
};
