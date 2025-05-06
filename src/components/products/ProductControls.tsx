
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddClick: () => void;
}

const ProductControls: React.FC<ProductControlsProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onAddClick 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
      <div className="w-full md:w-72">
        <Label htmlFor="search" className="sr-only">Search Products</Label>
        <Input
          id="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <Button className="w-full md:w-auto" onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add Product
      </Button>
    </div>
  );
};

export default ProductControls;
