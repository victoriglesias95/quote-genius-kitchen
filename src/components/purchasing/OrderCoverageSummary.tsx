
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectedQuoteItem } from '@/services/purchasingService';
import { Request } from '@/components/chef/requests/types';
import { AlertOctagon, CheckCircle } from 'lucide-react';

export interface OrderCoverageSummaryProps {
  selectedItems: SelectedQuoteItem[];
  chefRequests: Request[];
}

export function OrderCoverageSummary({ selectedItems, chefRequests }: OrderCoverageSummaryProps) {
  // Calculate coverage metrics
  const metrics = React.useMemo(() => {
    // Count total unique products requested
    const requestedProductsSet = new Set<string>();
    chefRequests.forEach(request => {
      request.items.forEach(item => {
        requestedProductsSet.add(`${item.name}-${request.id}`);
      });
    });
    
    const totalRequestedProducts = requestedProductsSet.size;
    
    // Count covered products
    const coveredProductsSet = new Set<string>();
    selectedItems.forEach(item => {
      // Make sure we're comparing apples to apples
      if (item && item.itemName && item.requestId) {
        coveredProductsSet.add(`${item.itemName}-${item.requestId}`);
      }
    });
    
    const coveredProducts = coveredProductsSet.size;
    
    // Calculate coverage percentage
    const coveragePercentage = totalRequestedProducts > 0 
      ? (coveredProducts / totalRequestedProducts) * 100 
      : 0;
    
    // Count suppliers
    const suppliersSet = new Set<string>();
    selectedItems.forEach(item => {
      if (item && item.supplierId) {
        suppliersSet.add(item.supplierId);
      }
    });
    
    const supplierCount = suppliersSet.size;
    
    return {
      totalRequestedProducts,
      coveredProducts,
      coveragePercentage,
      supplierCount
    };
  }, [selectedItems, chefRequests]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Coverage Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Requested Items</div>
            <div className="text-2xl font-bold mt-1">{metrics.totalRequestedProducts}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Items Covered</div>
            <div className="flex items-center gap-1 text-2xl font-bold mt-1">
              {metrics.coveredProducts}
              {metrics.coveredProducts === metrics.totalRequestedProducts && metrics.totalRequestedProducts > 0 && (
                <CheckCircle className="h-5 w-5 ml-1 text-green-500" />
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Coverage Percentage</div>
            <div className={`text-2xl font-bold mt-1 ${
              metrics.coveragePercentage < 85 ? 'text-amber-600' : 
              metrics.coveragePercentage < 100 ? 'text-blue-600' : 
              'text-green-600'
            }`}>
              {metrics.coveragePercentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Suppliers Used</div>
            <div className="text-2xl font-bold mt-1">{metrics.supplierCount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
