
import React, { useState, useEffect } from 'react';
import ChefLayout from '@/components/layout/ChefLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, CheckCircle, Plus, Edit, ListPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productDatabase, getUniqueCategories } from '@/data/productDatabase';
import { Label } from '@/components/ui/label';

// Extended inventory item type
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: string;
  unit: string;
  counted: boolean;
  actualCount?: number | null;
  productDatabaseId?: string;
}

// Sample inventory data with categories
const sampleInventory: InventoryItem[] = [
  { id: '1', name: 'Onions', category: 'Vegetables', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '2', name: 'Chicken Breast', category: 'Meat', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '3', name: 'Olive Oil', category: 'Oils', currentStock: 'High', unit: 'liter', counted: false },
  { id: '4', name: 'Salt', category: 'Spices', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '5', name: 'Flour', category: 'Dry Goods', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '6', name: 'Eggs', category: 'Dairy', currentStock: 'Low', unit: 'dozen', counted: false },
  { id: '7', name: 'Bell Peppers', category: 'Vegetables', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '8', name: 'Beef Sirloin', category: 'Meat', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '9', name: 'Sugar', category: 'Dry Goods', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '10', name: 'Butter', category: 'Dairy', currentStock: 'Low', unit: 'kg', counted: false },
];

// Map stock level to classes
const stockLevelClasses: Record<string, string> = {
  Low: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-green-100 text-green-800',
};

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  
  // Get unique categories for tabs
  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];
  const dbCategories = getUniqueCategories();

  useEffect(() => {
    // When category is selected, filter products from product database by that category
    if (selectedCategory) {
      const productsInCategory = productDatabase.filter(p => p.category === selectedCategory);
      setAvailableProducts(productsInCategory);
      
      // Reset selected product and unit when category changes
      setSelectedProduct('');
      setSelectedUnit('');
    } else {
      setAvailableProducts([]);
    }
  }, [selectedCategory]);
  
  useEffect(() => {
    // When product is selected, set available units
    if (selectedProduct) {
      const product = productDatabase.find(p => p.id === selectedProduct);
      if (product && product.units.length > 0) {
        setSelectedUnit(product.units[0]);
      } else {
        setSelectedUnit('');
      }
    }
  }, [selectedProduct]);
  
  useEffect(() => {
    // When editing a list, prepare the available products for that category
    if (isEditListModalOpen && selectedCategory && selectedCategory !== 'all') {
      const allProductsInCategory = productDatabase.filter(p => p.category === selectedCategory);
      const currentInventoryInCategory = inventory.filter(item => item.category === selectedCategory);
      
      // Get products that are already in the inventory
      const existingProductIds = currentInventoryInCategory.map(item => item.productDatabaseId);
      
      // Set both current items and available items for adding
      setCategoryProducts(currentInventoryInCategory);
      
      // Filter out products that are already in the inventory
      setAvailableProducts(allProductsInCategory.filter(p => !existingProductIds.includes(p.id)));
    }
  }, [isEditListModalOpen, selectedCategory, inventory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !selectedCategory) {
      toast.error('Please select a product and category');
      return;
    }
    
    const product = productDatabase.find(p => p.id === selectedProduct);
    if (!product) {
      toast.error('Product not found');
      return;
    }
    
    // Create new inventory item
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: product.name,
      category: selectedCategory,
      currentStock: 'Medium', // Default value
      unit: selectedUnit,
      counted: false,
      actualCount: null,
      productDatabaseId: product.id
    };
    
    // Add to inventory
    setInventory(prev => [...prev, newItem]);
    
    // Show success message
    toast.success(`${product.name} added to inventory`);
    
    // Close modal and reset form
    setIsAddProductModalOpen(false);
    setSelectedProduct('');
    setSelectedCategory('');
    setSelectedUnit('');
  };
  
  const handleRemoveFromList = (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removed from inventory');
  };
  
  const handleUpdateCount = (id: string, count: number | null) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id ? { 
          ...item, 
          counted: count !== null,
          actualCount: count 
        } : item
      )
    );
    
    const item = inventory.find(i => i.id === id);
    if (item) {
      if (count !== null) {
        toast.success(`${item.name} count updated to ${count} ${item.unit}`);
      }
    }
  };
  
  // Open edit list modal for a specific category
  const handleEditCategoryList = (category: string) => {
    if (category === 'all') {
      toast.error('Please select a specific category to edit');
      return;
    }
    
    setSelectedCategory(category);
    setIsEditListModalOpen(true);
  };
  
  // Filter inventory based on search term and active tab
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'all' || item.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });
  
  // Calculate count progress
  const countedItems = inventory.filter(item => item.counted).length;
  const totalItems = inventory.length;
  const progressPercentage = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;

  return (
    <ChefLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <h1 className="text-2xl font-bold">Inventory Count</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setIsAddProductModalOpen(true)} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Count progress */}
        <Card className="bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Inventory Count Progress</span>
                <span className="text-sm font-semibold">{countedItems} of {totalItems} items ({progressPercentage}%)</span>
              </div>
              <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300" 
                  style={{width: `${progressPercentage}%`}}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for category filtering */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 overflow-x-auto flex w-full">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {category === 'all' ? 'All Products' : category}
                  </CardTitle>
                  {category !== 'all' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCategoryList(category)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit List
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInventory.length === 0 ? (
                      <div className="col-span-full text-center p-8 text-gray-500">
                        No inventory items found matching your search.
                      </div>
                    ) : (
                      filteredInventory.map((item) => (
                        <Card key={item.id} className={`overflow-hidden ${item.counted ? 'border-green-500 border-2' : ''}`}>
                          <div className="flex justify-between items-center p-4 border-b">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockLevelClasses[item.currentStock]}`}>
                              {item.currentStock}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Unit: {item.unit}</span>
                              <span className="text-sm font-medium">
                                {item.counted ? `Counted: ${item.actualCount} ${item.unit}` : 'Not counted'}
                              </span>
                            </div>
                            <div className="flex items-center mt-2">
                              <Input
                                type="number"
                                min="0"
                                placeholder={`Enter count (${item.unit})`}
                                value={item.actualCount !== null ? item.actualCount : ''}
                                onChange={(e) => {
                                  const value = e.target.value !== '' ? parseFloat(e.target.value) : null;
                                  handleUpdateCount(item.id, value);
                                }}
                                className="flex-grow mr-2"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={item.counted ? "bg-green-50" : ""}
                                onClick={() => handleUpdateCount(item.id, item.actualCount !== null ? item.actualCount : 0)}
                              >
                                <CheckCircle className={`h-4 w-4 mr-2 ${item.counted ? "text-green-500" : "text-gray-400"}`} />
                                Count
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Add Product Modal */}
      <Dialog open={isAddProductModalOpen} onOpenChange={setIsAddProductModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {dbCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select 
                value={selectedProduct} 
                onValueChange={setSelectedProduct}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={selectedUnit} 
                onValueChange={setSelectedUnit}
                disabled={!selectedProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct && 
                    productDatabase.find(p => p.id === selectedProduct)?.units.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>
              Add to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit List Modal */}
      <Dialog open={isEditListModalOpen} onOpenChange={setIsEditListModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {selectedCategory} Inventory List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-medium">Current Items</h3>
            {categoryProducts.length === 0 ? (
              <p className="text-gray-500">No items in this category</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categoryProducts.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Unit: {item.unit}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveFromList(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium">Add Items</h3>
              <div className="flex items-end gap-2 mt-2">
                <div className="flex-grow">
                  <Label htmlFor="addProduct">Product</Label>
                  <Select 
                    value={selectedProduct} 
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={selectedUnit} 
                    onValueChange={setSelectedUnit}
                    disabled={!selectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct && 
                        productDatabase.find(p => p.id === selectedProduct)?.units.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddProduct}
                  disabled={!selectedProduct || !selectedUnit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEditListModalOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ChefLayout>
  );
};

export default Inventory;
