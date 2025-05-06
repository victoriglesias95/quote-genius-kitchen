
import React, { useState, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { sampleSuppliers } from '@/pages/Suppliers';
import { Product, Supplier } from '@/components/suppliers/SupplierList';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductComparisonTable } from '@/components/products/ProductComparisonTable';

const ProductComparison = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extract all unique products across suppliers
  const uniqueProducts = useMemo(() => {
    const productMap = new Map<string, Product & { suppliers: Array<{ supplierId: string, supplierName: string, price: number | undefined }> }>();
    
    // Collect all products from all suppliers
    sampleSuppliers.forEach(supplier => {
      supplier.products.forEach(product => {
        // Use product category and name as a unique identifier
        const key = `${product.category}-${product.name}`;
        
        if (!productMap.has(key)) {
          productMap.set(key, {
            ...product,
            suppliers: []
          });
        }
        
        // Add supplier info to this product
        productMap.get(key)?.suppliers.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          price: product.defaultPrice
        });
      });
    });
    
    return Array.from(productMap.values());
  }, []);
  
  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return uniqueProducts;
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    return uniqueProducts.filter(product => 
      product.name.toLowerCase().includes(lowerCaseSearch) ||
      product.category.toLowerCase().includes(lowerCaseSearch)
    );
  }, [uniqueProducts, searchTerm]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-navy">Product Price Comparison</h1>
                <p className="text-dark-gray">Compare prices across suppliers to find the best deals</p>
              </div>
              <div className="w-full md:w-72 mt-4 md:mt-0">
                <Label htmlFor="search" className="sr-only">Search Products</Label>
                <Input
                  id="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Price Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductComparisonTable products={filteredProducts} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProductComparison;
