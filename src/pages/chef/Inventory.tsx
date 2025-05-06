
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ChefLayout from '@/components/layout/ChefLayout';
import { productDatabase, getUniqueCategories } from '@/data/productDatabase';
import { InventoryItem } from '@/components/inventory/types';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import ProgressCard from '@/components/inventory/ProgressCard';
import CategoryTabContent from '@/components/inventory/CategoryTabContent';
import AddProductModal from '@/components/inventory/AddProductModal';
import EditListModal from '@/components/inventory/EditListModal';

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
  const [categoryProducts, setCategoryProducts] = useState<InventoryItem[]>([]);
  
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
      const currentInventoryInCategory = inventory.filter(item => item.category === selectedCategory);
      const allProductsInCategory = productDatabase.filter(p => p.category === selectedCategory);
      
      // Get products that are already in the inventory
      const existingProductIds = currentInventoryInCategory.map(item => item.productDatabaseId);
      
      // Set both current items and available items for adding
      setCategoryProducts(currentInventoryInCategory);
      
      // Filter out products that are already in the inventory
      setAvailableProducts(allProductsInCategory.filter(p => !existingProductIds.includes(p.id)));
    }
  }, [isEditListModalOpen, selectedCategory, inventory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
    if (item && count !== null) {
      toast.success(`${item.name} count updated to ${count} ${item.unit}`);
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

  return (
    <ChefLayout>
      <div className="space-y-4">
        <InventoryHeader 
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          onAddProduct={() => setIsAddProductModalOpen(true)}
        />

        {/* Count progress */}
        <ProgressCard countedItems={countedItems} totalItems={totalItems} />

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
              <CategoryTabContent 
                category={category}
                items={filteredInventory}
                onEditCategory={handleEditCategoryList}
                onUpdateCount={handleUpdateCount}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Modals */}
      <AddProductModal 
        isOpen={isAddProductModalOpen}
        onOpenChange={setIsAddProductModalOpen}
        categories={dbCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        availableProducts={availableProducts}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        onAddProduct={handleAddProduct}
      />
      
      <EditListModal 
        isOpen={isEditListModalOpen}
        onOpenChange={setIsEditListModalOpen}
        selectedCategory={selectedCategory}
        categoryProducts={categoryProducts}
        availableProducts={availableProducts}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        onAddProduct={handleAddProduct}
        onRemoveFromList={handleRemoveFromList}
      />
    </ChefLayout>
  );
};

export default Inventory;
