
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import InventoryItemCard from './InventoryItemCard';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: string;
  unit: string;
  counted: boolean;
  actualCount?: number | null;
  productDatabaseId?: string;
}

interface CategoryTabContentProps {
  category: string;
  items: InventoryItem[];
  onEditCategory: (category: string) => void;
  onUpdateCount: (id: string, count: number | null) => void;
}

const CategoryTabContent: React.FC<CategoryTabContentProps> = ({
  category,
  items,
  onEditCategory,
  onUpdateCount
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {category === 'all' ? 'All Products' : category}
        </CardTitle>
        {category !== 'all' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditCategory(category)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit List
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full text-center p-8 text-gray-500">
              No inventory items found matching your search.
            </div>
          ) : (
            items.map((item) => (
              <InventoryItemCard 
                key={item.id} 
                item={item} 
                onUpdateCount={onUpdateCount}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryTabContent;
