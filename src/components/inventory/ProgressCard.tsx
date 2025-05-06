
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
    <Card className="bg-blue-50">
      <CardContent className="pt-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Inventory Count Progress</span>
            <span className="text-sm font-semibold">
              {countedItems} of {totalItems} items ({progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-blue-100" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
