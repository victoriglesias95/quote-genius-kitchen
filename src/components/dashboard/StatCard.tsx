
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-light-gray bg-opacity-50">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-navy text-white">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-2">
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <div className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
