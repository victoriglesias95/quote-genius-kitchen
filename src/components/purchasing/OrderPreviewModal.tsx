
import React from 'react';
import { SelectedQuoteItem, SupplierGroup } from '@/services/purchasingService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface OrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supplierGroups: SupplierGroup[];
  selectedItems: SelectedQuoteItem[];
  manuallySelectedItems: Record<string, boolean>;
  validationIssues: string[];
  skippedItems: Array<{ item: any, reason: string }>;
  specialInstructions: Record<string, string>;
  onUpdateInstructions: (supplierId: string, instructions: string) => void;
  isPlacingOrder: boolean;
}

export function OrderPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  supplierGroups,
  selectedItems,
  manuallySelectedItems,
  validationIssues,
  skippedItems,
  specialInstructions,
  onUpdateInstructions,
  isPlacingOrder
}: OrderPreviewModalProps) {
  const hasValidationIssues = validationIssues.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Review & Confirm Orders</DialogTitle>
          <DialogDescription>
            You are about to place orders with {supplierGroups.length} suppliers for a total of {selectedItems.length} items.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={supplierGroups.length > 0 ? (supplierGroups[0]?.supplierId || "summary") : "summary"}>
          <TabsList className="w-full mb-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            {supplierGroups.map(group => (
              <TabsTrigger key={group.supplierId} value={group.supplierId}>
                {group.supplierName}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierGroups.map(group => (
                      <TableRow key={group.supplierId}>
                        <TableCell className="font-medium">{group.supplierName}</TableCell>
                        <TableCell>{group.itemCount}</TableCell>
                        <TableCell className="text-right">${group.totalValue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-muted-foreground">
                  Total suppliers: {supplierGroups.length}
                </div>
                <div className="text-xl font-semibold">
                  Grand Total: ${selectedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                </div>
              </CardFooter>
            </Card>
            
            {/* Warnings section */}
            <div className="mt-4 flex flex-col gap-2">
              {hasValidationIssues && (
                <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle>Validation Issues</AlertTitle>
                  <AlertDescription>
                    There are {validationIssues.length} validation issues that should be addressed.
                  </AlertDescription>
                </Alert>
              )}
              
              {skippedItems.length > 0 && (
                <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Skipped Items</AlertTitle>
                  <AlertDescription>
                    {skippedItems.length} items were skipped from the original chef requests.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          {supplierGroups.map(group => {
            const supplierValidationIssues = validationIssues.filter(issue => 
              issue.toLowerCase().includes(group.supplierName.toLowerCase())
            );
            
            return (
              <TabsContent key={group.supplierId} value={group.supplierId}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{group.supplierName}</CardTitle>
                        <CardDescription>
                          {group.itemCount} items, total: ${group.totalValue.toFixed(2)}
                        </CardDescription>
                      </div>
                      
                      {group.isSmallOrder && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          Small Order
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Validation issues */}
                    {supplierValidationIssues.length > 0 && (
                      <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle>Validation Issues</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside">
                            {supplierValidationIssues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.items.map(item => {
                          const isManuallySelected = manuallySelectedItems[item.id] || item.isManuallySelected;
                          
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <span>{item.itemName}</span>
                                  {isManuallySelected && (
                                    <div className="ml-2" title="Manually selected supplier">
                                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.quantity} {item.unit}
                              </TableCell>
                              <TableCell>${item.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    {/* Special instructions */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions
                      </label>
                      <Textarea 
                        placeholder="Add any special instructions for this supplier..."
                        value={specialInstructions[group.supplierId] || ''}
                        onChange={(e) => onUpdateInstructions(group.supplierId, e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="sm:mr-auto">
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
          
          {/* Warning display */}
          {hasValidationIssues && (
            <div className="flex items-center text-amber-600 text-sm mr-4">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>Issues exist</span>
            </div>
          )}
          
          <Button 
            onClick={onConfirm}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? (
              <>
                <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full inline-block"></span>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm All Orders
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
