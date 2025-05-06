
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sampleSuppliers } from '@/pages/Suppliers';

interface SupplierSelectorProps {
  value: string;
  onValueChange: (value: string, name: string) => void;
}

export const SupplierSelector: React.FC<SupplierSelectorProps> = ({ value, onValueChange }) => {
  // Find the supplier by ID to get the name
  const handleChange = (newValue: string) => {
    const supplier = sampleSuppliers.find(s => s.id === newValue);
    onValueChange(newValue, supplier?.name || '');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="supplier">Select Supplier</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger id="supplier" className="w-full">
          <SelectValue placeholder="Select a supplier" />
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
  );
};
