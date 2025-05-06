
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  countedItems: number;
  totalItems: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ countedItems, totalItems }) => {
  const progressPercentage = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;
  
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
      <CardContent className="pt-3 pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
            <span className="font-medium text-primary text-sm">Inventory Count Progress</span>
            <span className="text-sm font-semibold bg-white px-2 py-1 rounded-md shadow-sm">
              {countedItems} of {totalItems} items ({progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-blue-100" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
