
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { groupItemsBySupplier, suggestOrderOptimization, SelectedQuoteItem, SupplierGroup } from '@/services/purchasingService';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface SupplierOrderMappingProps {
  selectedItems: SelectedQuoteItem[];
}

export function SupplierOrderMapping({ selectedItems }: SupplierOrderMappingProps) {
  // Group selected items by supplier
  const supplierGroups = useMemo(() => {
    return groupItemsBySupplier(selectedItems);
  }, [selectedItems]);
  
  // Get optimization suggestions
  const optimizationSuggestions = useMemo(() => {
    return suggestOrderOptimization(supplierGroups);
  }, [supplierGroups]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Supplier Order Mapping</CardTitle>
        <CardDescription>
          Products grouped by supplier with order optimization suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optimization Suggestions */}
        {optimizationSuggestions.length > 0 && (
          <Alert className="bg-amber-50 text-amber-900 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle>Order Optimization Suggestions</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-white border border-amber-100 rounded-md">
                    <p className="text-sm font-medium mb-2">
                      Consider moving {suggestion.items.length} item{suggestion.items.length > 1 ? 's' : ''} 
                      from <span className="text-amber-700">{suggestion.fromSupplier.supplierName}</span> to 
                      <span className="text-green-700"> {suggestion.toSupplier.supplierName}</span>
                    </p>
                    <div className="pl-4">
                      <ul className="list-disc space-y-1 text-sm text-gray-600">
                        {suggestion.items.map(item => (
                          <li key={item.id}>
                            {item.itemName} ({item.quantity} {item.unit}) - ${item.totalPrice.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">Apply Suggestion</Button>
                      <Button variant="ghost" size="sm">Ignore</Button>
                    </div>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Supplier Groups */}
        <div className="space-y-4">
          {supplierGroups.map((supplier) => (
            <SupplierOrderCard key={supplier.supplierId} supplier={supplier} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SupplierOrderCardProps {
  supplier: SupplierGroup;
}

function SupplierOrderCard({ supplier }: SupplierOrderCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${supplier.isSmallOrder ? 'border-amber-200 bg-amber-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{supplier.supplierName}</h3>
          <div className="flex gap-2 items-center mt-1">
            <Badge variant={supplier.isSmallOrder ? "outline" : "default"} className={supplier.isSmallOrder ? "border-amber-500 text-amber-700 bg-amber-100" : ""}>
              {supplier.itemCount} item{supplier.itemCount !== 1 ? 's' : ''}
            </Badge>
            <span className="font-medium">
              ${supplier.totalValue.toFixed(2)}
            </span>
          </div>
        </div>
        
        {supplier.isSmallOrder && (
          <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-100">
            Small Order
          </Badge>
        )}
      </div>
      
      <div className="mt-3 space-y-2">
        {supplier.items.map((item) => (
          <div key={item.id} className="flex justify-between p-2 bg-white rounded border border-gray-100">
            <div className="flex-1">
              <div className="font-medium">{item.itemName}</div>
              <div className="text-sm text-gray-600">
                {item.quantity} {item.unit} × ${item.price.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center">
              <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
