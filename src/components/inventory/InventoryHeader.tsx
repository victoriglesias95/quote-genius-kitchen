
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col xs:flex-row justify-between gap-3 xs:items-center">
      <h1 className="text-lg xs:text-xl font-bold">Inventory Count</h1>
      <div className="flex gap-2 w-full xs:w-auto">
        <div className="relative flex-1 xs:min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-8 h-9"
          />
        </div>
        <Button onClick={onAddProduct} size="sm" className="shrink-0">
          <PlusCircle className="h-4 w-4 mr-1" />
          {isMobile ? 'Add' : 'Add Product'}
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
