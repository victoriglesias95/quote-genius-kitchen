
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SelectedQuoteItem, findMissingItems } from '@/services/purchasingService';
import { Request } from '@/components/chef/requests/types';
import { Progress } from '@/components/ui/progress';

interface OrderCoverageSummaryProps {
  selectedItems: SelectedQuoteItem[];
  chefRequests: Request[];
}

export function OrderCoverageSummary({ selectedItems, chefRequests }: OrderCoverageSummaryProps) {
  // Calculate coverage metrics
  const metrics = useMemo(() => {
    // Count total items from chef requests
    const totalRequestedItems = chefRequests.reduce((total, request) => {
      return total + request.items.length;
    }, 0);
    
    // Find missing items
    const missingItems = findMissingItems(selectedItems, chefRequests);
    const missingCount = missingItems.length;
    
    // Calculate coverage percentage
    const coveredCount = totalRequestedItems - missingCount;
    const coveragePercentage = totalRequestedItems > 0 
      ? Math.round((coveredCount / totalRequestedItems) * 100) 
      : 0;
    
    // Calculate total value of selected items
    const totalValue = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Count unique suppliers
    const uniqueSuppliers = new Set(selectedItems.map(item => item.supplierId)).size;
    
    return {
      totalRequestedItems,
      coveredCount,
      missingCount,
      coveragePercentage,
      totalValue,
      uniqueSuppliers
    };
  }, [selectedItems, chefRequests]);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Coverage Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-2">
            <p className="text-sm font-medium text-gray-500">Coverage</p>
            <h3 className="text-3xl font-bold">{metrics.coveragePercentage}%</h3>
          </div>
          <Progress value={metrics.coveragePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{metrics.coveredCount} covered</span>
            <span>{metrics.missingCount} missing</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Items */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-gray-500">Total Items</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-3xl font-bold">{metrics.totalRequestedItems}</h3>
            <span className="ml-2 text-sm text-gray-500">across all requests</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Value */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-gray-500">Total Value</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-3xl font-bold">${metrics.totalValue.toFixed(2)}</h3>
          </div>
        </CardContent>
      </Card>
      
      {/* Suppliers */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-gray-500">Suppliers</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-3xl font-bold">{metrics.uniqueSuppliers}</h3>
            <span className="ml-2 text-sm text-gray-500">providing items</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
