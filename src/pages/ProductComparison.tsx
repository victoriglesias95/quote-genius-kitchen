
import React, { useState, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { sampleSuppliers } from '@/pages/Suppliers';
import { Product, Supplier } from '@/components/suppliers/SupplierList';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductComparisonTable } from '@/components/products/ProductComparisonTable';
import { useQuoteItems } from '@/hooks/useQuoteItems';
import { DatePicker } from '@/components/ui/date-picker';

const ProductComparison = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Fetch quote items with prices from the database
  const { quoteItems, isLoading } = useQuoteItems();
  
  // Extract all unique products across suppliers
  const uniqueProducts = useMemo(() => {
    const productMap = new Map<string, Product & { suppliers: Array<{ supplierId: string, supplierName: string, price: number | undefined, isValid: boolean }> }>();
    
    // First collect all products from sample suppliers
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
          price: product.defaultPrice,
          isValid: true // Default products are always considered valid
        });
      });
    });
    
    // Then enrich with price data from database quotes if available
    if (quoteItems && quoteItems.length > 0) {
      quoteItems.forEach(item => {
        // Try to find a matching product (by name)
        for (const [key, product] of productMap.entries()) {
          if (product.name.toLowerCase() === item.name.toLowerCase()) {
            // Check if this supplier already exists
            const existingSupplierIndex = product.suppliers.findIndex(
              s => s.supplierName === item.supplierName
            );
            
            // If quote is valid and the validUntil date is in the future
            const isValid = item.validUntil ? new Date(item.validUntil) > selectedDate : false;
            
            if (existingSupplierIndex >= 0) {
              // Update existing supplier price if quote is valid
              if (isValid) {
                product.suppliers[existingSupplierIndex].price = item.price;
                product.suppliers[existingSupplierIndex].isValid = isValid;
              }
            } else {
              // Add new supplier
              product.suppliers.push({
                supplierId: item.supplierId || 'unknown',
                supplierName: item.supplierName || 'Unknown Supplier',
                price: isValid ? item.price : undefined,
                isValid
              });
            }
            
            break;
          }
        }
      });
    }
    
    return Array.from(productMap.values());
  }, [quoteItems, selectedDate]);
  
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
              <div className="w-full md:w-auto mt-4 md:mt-0 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
                <div className="w-full md:w-72">
                  <Label htmlFor="search" className="sr-only">Search Products</Label>
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <Label htmlFor="date-picker" className="block text-sm mb-1">Price validity date</Label>
                  <DatePicker date={selectedDate} setDate={setSelectedDate} />
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Price Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">Loading price data...</div>
                ) : (
                  <ProductComparisonTable products={filteredProducts} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProductComparison;
