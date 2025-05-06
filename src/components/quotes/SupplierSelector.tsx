
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { sampleSuppliers } from '@/pages/Suppliers';

interface SupplierSelectorProps {
  selectedSupplierId: string;
  onSupplierChange: (supplierId: string) => void;
}

export function SupplierSelector({ selectedSupplierId, onSupplierChange }: SupplierSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="supplier">Supplier</Label>
      <Select 
        required
        value={selectedSupplierId}
        onValueChange={onSupplierChange}
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
  );
}
