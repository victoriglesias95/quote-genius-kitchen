
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SelectedQuoteItem } from '@/services/purchasingService';
import { AlertTriangle } from 'lucide-react';

export interface SupplierOrderMappingProps {
  selectedItems: SelectedQuoteItem[];
  manuallySelectedItems: Record<string, boolean>; // Added prop for tracking manually selected items
}

export function SupplierOrderMapping({ 
  selectedItems,
  manuallySelectedItems 
}: SupplierOrderMappingProps) {
  // Group items by supplier
  const supplierGroups = React.useMemo(() => {
    const groups: Record<string, {
      supplierId: string;
      supplierName: string;
      items: SelectedQuoteItem[];
      totalValue: number;
    }> = {};
    
    // Group items by supplier
    selectedItems.forEach(item => {
      if (!groups[item.supplierId]) {
        groups[item.supplierId] = {
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          items: [],
          totalValue: 0
        };
      }
      
      groups[item.supplierId].items.push(item);
      groups[item.supplierId].totalValue += item.totalPrice;
    });
    
    return Object.values(groups);
  }, [selectedItems]);

  if (selectedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier Orders</CardTitle>
          <CardDescription>
            No items have been selected for ordering yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Orders</CardTitle>
        <CardDescription>
          Items grouped by supplier for ordering
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {supplierGroups.map((group) => (
            <div key={group.supplierId} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{group.supplierName}</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                    ${group.totalValue.toFixed(2)}
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <span>{item.itemName}</span>
                            {manuallySelectedItems[item.id] && (
                              <div className="ml-2" title="Manually selected">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="font-medium text-right">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${group.totalValue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
