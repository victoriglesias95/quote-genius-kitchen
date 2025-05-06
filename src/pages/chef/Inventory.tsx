
import React, { useState } from 'react';
import ChefLayout from '@/components/layout/ChefLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// Sample inventory data
const sampleInventory = [
  { id: '1', name: 'Onions', category: 'Vegetables', currentStock: 'Low', unit: 'kg' },
  { id: '2', name: 'Chicken Breast', category: 'Meat', currentStock: 'Medium', unit: 'kg' },
  { id: '3', name: 'Olive Oil', category: 'Oils', currentStock: 'High', unit: 'liter' },
  { id: '4', name: 'Salt', category: 'Spices', currentStock: 'Medium', unit: 'kg' },
  { id: '5', name: 'Flour', category: 'Dry Goods', currentStock: 'Low', unit: 'kg' },
  { id: '6', name: 'Eggs', category: 'Dairy', currentStock: 'Low', unit: 'dozen' },
];

// Map stock level to classes
const stockLevelClasses: Record<string, string> = {
  Low: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-green-100 text-green-800',
};

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState(sampleInventory);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    const filtered = sampleInventory.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      item.category.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredInventory(filtered);
  };

  const handleCreateRequest = () => {
    toast.success('Feature coming soon: Create product request');
  };

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

        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map((item) => (
                <Card key={item.id} className="overflow-hidden">
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
                    <Button variant="outline" size="sm" onClick={handleCreateRequest}>
                      Request
                    </Button>
                  </div>
                </Card>
              ))}
              {filteredInventory.length === 0 && (
                <div className="col-span-full text-center p-8 text-gray-500">
                  No inventory items found matching your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ChefLayout>
  );
};

export default Inventory;
