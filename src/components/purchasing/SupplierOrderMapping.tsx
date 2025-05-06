
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
      <div className="text-center p-8 border-2 border-dashed rounded-lg border-gray-200">
        <p className="text-muted-foreground">No items have been selected for ordering yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {supplierGroups.map((group) => (
          <Card key={group.supplierId} className="overflow-hidden shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gray-50 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-medium">{group.supplierName}</CardTitle>
                  <CardDescription className="text-sm">
                    {group.items.length} items • ${group.totalValue.toFixed(2)} total
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenAddItemDialog(group.supplierId, group.supplierName)}
                  className="h-8 px-3 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium">{item.itemName}</span>
                            {manuallySelectedItems[item.id] && (
                              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 text-xs py-0 px-1.5">
                                Manual
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">${item.totalPrice.toFixed(2)}</TableCell>
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
                      <TableCell colSpan={3} className="font-medium text-right border-t">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold border-t">
                        ${group.totalValue.toFixed(2)}
                      </TableCell>
                      <TableCell className="border-t"></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Item to {currentSupplierName}</DialogTitle>
            <DialogDescription>
              Add a new item to the supplier's order.
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
