
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

interface InventoryHeaderProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddProduct: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddProduct
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
      <h1 className="text-2xl font-bold">Inventory Count</h1>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-9"
          />
        </div>
        <Button onClick={onAddProduct} className="whitespace-nowrap">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
