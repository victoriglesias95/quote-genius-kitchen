
import React, { useState } from 'react';
import ChefLayout from '@/components/layout/ChefLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Sample inventory data with categories
const sampleInventory = [
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
  const [inventory, setInventory] = useState(sampleInventory);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Get unique categories for tabs
  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleCreateRequest = () => {
    toast.success('Feature coming soon: Create product request');
  };
  
  const handleMarkCounted = (id: string) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, counted: !item.counted } : item
      )
    );
    
    const item = inventory.find(i => i.id === id);
    if (item) {
      toast.success(`${item.name} marked as ${item.counted ? 'not counted' : 'counted'}`);
    }
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
  const progressPercentage = Math.round((countedItems / totalItems) * 100);

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
            <Button onClick={handleCreateRequest} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Request
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
                <CardHeader>
                  <CardTitle>
                    {category === 'all' ? 'All Products' : category}
                  </CardTitle>
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
                          <div className="p-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500">Unit: {item.unit}</span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={item.counted ? "bg-green-50" : ""}
                                onClick={() => handleMarkCounted(item.id)}
                              >
                                <CheckCircle className={`h-4 w-4 mr-2 ${item.counted ? "text-green-500" : "text-gray-400"}`} />
                                {item.counted ? "Counted" : "Mark Counted"}
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCreateRequest}>
                                Request
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
    </ChefLayout>
  );
};

export default Inventory;
