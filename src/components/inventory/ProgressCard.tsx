
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressCardProps {
  countedItems: number;
  totalItems: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ countedItems, totalItems }) => {
  const progressPercentage = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;
  
  return (
    <Card className="bg-blue-50">
      <CardContent className="pt-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Inventory Count Progress</span>
            <span className="text-sm font-semibold">
              {countedItems} of {totalItems} items ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{width: `${progressPercentage}%`}}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
