
import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductDatabase, productDatabase } from '@/data/productDatabase';
import { Product } from './SupplierList';

interface MultiProductSelectorProps {
  existingProducts: Product[];
  onAddProducts: (products: Product[]) => void;
}

export function MultiProductSelector({ existingProducts, onAddProducts }: MultiProductSelectorProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [defaultPrice, setDefaultPrice] = useState<string>('');
  
  // Filter products based on search term and exclude products already added to the supplier
  const filteredProducts = productDatabase.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !existingProducts.some(existingProduct => existingProduct.name === product.name)
  );

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleAddProducts = () => {
    if (selectedProducts.length === 0) return;

    const price = defaultPrice ? parseFloat(defaultPrice) : undefined;
    
    const productsToAdd: Product[] = selectedProducts.map(id => {
      const dbProduct = productDatabase.find(p => p.id === id);
      
      return {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: dbProduct?.name || '',
        category: dbProduct?.category || '',
        units: dbProduct?.units || ['kg'],
        defaultPrice: price
      };
    });
    
    onAddProducts(productsToAdd);
    setSelectedProducts([]);
    setDefaultPrice('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add Products to Supplier</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Default price for selected products (optional)"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                step="0.01"
              />
            </div>
            <Button 
              onClick={handleAddProducts}
              disabled={selectedProducts.length === 0}
            >
              Add {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
            </Button>
          </div>
          
          <div className="border rounded-md max-h-[400px] overflow-y-auto">
            <Table>
              <TableCaption>Select products to add to this supplier</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Available Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleProductSelect(product.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium" onClick={() => handleProductSelect(product.id)}>
                        {product.name}
                      </TableCell>
                      <TableCell onClick={() => handleProductSelect(product.id)}>
                        {product.category}
                      </TableCell>
                      <TableCell onClick={() => handleProductSelect(product.id)}>
                        {product.units.join(', ')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      {searchTerm ? 'No matching products found' : 'No more products available to add'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
