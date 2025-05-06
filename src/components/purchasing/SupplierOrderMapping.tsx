
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SelectedQuoteItem } from '@/services/purchasingService';
import { AlertTriangle, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface SupplierOrderMappingProps {
  selectedItems: SelectedQuoteItem[];
  manuallySelectedItems: Record<string, boolean>;
  onUpdateItemQuantity?: (item: SelectedQuoteItem, newQuantity: number) => void;
  onAddManualItem?: (item: SelectedQuoteItem) => void;
}

export function SupplierOrderMapping({ 
  selectedItems,
  manuallySelectedItems,
  onUpdateItemQuantity,
  onAddManualItem
}: SupplierOrderMappingProps) {
  // State for dialogs
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState<boolean>(false);
  const [isEditQuantityDialogOpen, setIsEditQuantityDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<SelectedQuoteItem | null>(null);
  const [currentSupplierId, setCurrentSupplierId] = useState<string>('');
  const [currentSupplierName, setCurrentSupplierName] = useState<string>('');
  
  // State for new item form
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>('kg');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  
  // State for edit quantity
  const [editedQuantity, setEditedQuantity] = useState<number>(0);
  
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

  // Handle opening the add item dialog
  const handleOpenAddItemDialog = (supplierId: string, supplierName: string) => {
    setCurrentSupplierId(supplierId);
    setCurrentSupplierName(supplierName);
    // Reset form fields
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemUnit('kg');
    setNewItemPrice(0);
    setIsAddItemDialogOpen(true);
  };
  
  // Handle opening the edit quantity dialog
  const handleOpenEditQuantityDialog = (item: SelectedQuoteItem) => {
    setEditingItem(item);
    setEditedQuantity(item.quantity);
    setIsEditQuantityDialogOpen(true);
  };
  
  // Handle adding a new manual item
  const handleAddNewItem = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    
    if (newItemQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    
    if (newItemPrice < 0) {
      toast.error("Price cannot be negative");
      return;
    }
    
    // Create a new item
    const newItem: SelectedQuoteItem = {
      id: `manual-item-${Date.now()}`,
      itemName: newItemName,
      quantity: newItemQuantity,
      unit: newItemUnit,
      supplierId: currentSupplierId,
      supplierName: currentSupplierName,
      price: newItemPrice,
      totalPrice: newItemPrice * newItemQuantity,
      requestId: 'manual-request',
      requestTitle: 'Manual Addition',
      isOptional: false,
      isManuallySelected: true
    };
    
    // Call the callback to add the item
    if (onAddManualItem) {
      onAddManualItem(newItem);
    }
    
    // Close the dialog
    setIsAddItemDialogOpen(false);
    toast.success(`Added ${newItemName} to ${currentSupplierName}'s order`);
  };
  
  // Handle updating an item's quantity
  const handleUpdateQuantity = () => {
    if (!editingItem) return;
    
    if (editedQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    
    // Call the callback to update the quantity
    if (onUpdateItemQuantity) {
      onUpdateItemQuantity(editingItem, editedQuantity);
    }
    
    // Close the dialog
    setIsEditQuantityDialogOpen(false);
    toast.success(`Updated ${editingItem.itemName} quantity to ${editedQuantity}`);
  };

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
    <>
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        ${group.totalValue.toFixed(2)}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenAddItemDialog(group.supplierId, group.supplierName)}
                        className="h-8 px-2 flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                      </Button>
                    </div>
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
                        <TableHead className="w-[80px]"></TableHead>
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
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditQuantityDialog(item)}
                              className="h-7 w-7 p-0"
                              title="Edit Quantity"
                            >
                              <Edit className="h-3.5 w-3.5 text-gray-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="font-medium text-right">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${group.totalValue.toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Item to {currentSupplierName}</DialogTitle>
            <DialogDescription>
              Add a new item to the supplier's order. This will be marked as a manual addition.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-name" className="text-right">
                Item Name
              </Label>
              <Input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="item-quantity"
                type="number"
                min="1"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-unit" className="text-right">
                Unit
              </Label>
              <Input
                id="item-unit"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-price" className="text-right">
                Unit Price
              </Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                Total:
              </div>
              <div className="col-span-3 font-medium">
                ${(newItemPrice * newItemQuantity).toFixed(2)}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Quantity Dialog */}
      <Dialog open={isEditQuantityDialogOpen} onOpenChange={setIsEditQuantityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
            <DialogDescription>
              Update the quantity for {editingItem?.itemName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                min="1"
                value={editedQuantity}
                onChange={(e) => setEditedQuantity(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            {editingItem && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  New Total:
                </div>
                <div className="col-span-3 font-medium">
                  ${(editingItem.price * editedQuantity).toFixed(2)}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditQuantityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQuantity}>
              Update Quantity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
