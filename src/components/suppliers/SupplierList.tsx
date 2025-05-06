
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Product {
  id: string;
  name: string;
  category: string;
  units: string[]; // Changed from single unit to array of units
  defaultPrice?: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  products: Product[];
}

interface SupplierListProps {
  suppliers: Supplier[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function SupplierList({ suppliers, onView, onEdit }: SupplierListProps) {
  return (
    <Table>
      <TableCaption>A list of your registered suppliers.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map(supplier => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">{supplier.name}</TableCell>
            <TableCell>{supplier.category}</TableCell>
            <TableCell>{supplier.contactPerson}</TableCell>
            <TableCell>{supplier.email}</TableCell>
            <TableCell>{supplier.phone}</TableCell>
            <TableCell>
              <Badge variant={supplier.status === 'active' ? 'default' : 'outline'} className={supplier.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
                {supplier.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onView(supplier.id)} className="mr-2">
                View
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(supplier.id)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
