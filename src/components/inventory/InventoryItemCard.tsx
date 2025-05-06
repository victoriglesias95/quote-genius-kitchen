
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle } from 'lucide-react';

interface InventoryItemProps {
  item: {
    id: string;
    name: string;
    category: string;
    currentStock: string;
    unit: string;
    counted: boolean;
    actualCount?: number | null;
  };
  onUpdateCount: (id: string, count: number | null) => void;
}

const InventoryItemCard: React.FC<InventoryItemProps> = ({ item, onUpdateCount }) => {
  const stockLevelClasses: Record<string, string> = {
    Low: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-green-100 text-green-800',
  };

  return (
    <Card key={item.id} className={`overflow-hidden ${item.counted ? 'border-green-500 border-2' : ''} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-center p-3 border-b">
        <div>
          <h3 className="font-medium text-base">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.category}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockLevelClasses[item.currentStock]}`}>
          {item.currentStock}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Unit: {item.unit}</span>
          <span className="text-xs font-medium">
            {item.counted ? `Counted: ${item.actualCount} ${item.unit}` : 'Not counted'}
          </span>
        </div>
        <div className="flex items-center mt-2 gap-1">
          <Input
            type="number"
            min="0"
            placeholder={`Count (${item.unit})`}
            value={item.actualCount !== null ? item.actualCount : ''}
            onChange={(e) => {
              const value = e.target.value !== '' ? parseFloat(e.target.value) : null;
              onUpdateCount(item.id, value);
            }}
            className="flex-grow h-9 text-sm"
          />
          <Button 
            variant="outline" 
            size="sm"
            className={`h-9 px-2 ${item.counted ? "bg-green-50 border-green-200" : ""}`}
            onClick={() => onUpdateCount(item.id, item.actualCount !== null ? item.actualCount : 0)}
          >
            <CheckCircle className={`h-4 w-4 ${item.counted ? "text-green-500" : "text-gray-400"}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InventoryItemCard;
