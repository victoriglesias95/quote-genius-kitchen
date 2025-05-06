
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/components/suppliers/SupplierList';

interface ProductWithSuppliers extends Product {
  suppliers: Array<{ 
    supplierId: string;
    supplierName: string;
    price: number | undefined;
    isValid: boolean;
  }>;
}

interface ProductComparisonTableProps {
  products: ProductWithSuppliers[];
}

export function ProductComparisonTable({ products }: ProductComparisonTableProps) {
  // Function to find the supplier with the best (lowest) price for a product
  const getBestPriceSupplier = (suppliers: ProductWithSuppliers['suppliers']) => {
    if (!suppliers.length) return null;
    
    // Filter out suppliers with undefined prices or invalid prices
    const suppliersWithValidPrice = suppliers.filter(s => 
      typeof s.price === 'number' && s.isValid
    );
    
    if (!suppliersWithValidPrice.length) return null;
    
    // Find supplier with lowest price
    return suppliersWithValidPrice.reduce((best, current) => 
      (best.price && current.price && current.price < best.price) ? current : best, 
      suppliersWithValidPrice[0]
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Best Price</TableHead>
          <TableHead>All Suppliers</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length > 0 ? (
          products.map(product => {
            const bestPriceSupplier = getBestPriceSupplier(product.suppliers);
            
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.units.join(', ')}</TableCell>
                <TableCell>
                  {bestPriceSupplier ? (
                    <div className="flex flex-col">
                      <span className="font-bold">${bestPriceSupplier.price?.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{bestPriceSupplier.supplierName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No valid price available</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {product.suppliers.map((supplier) => (
                      <Badge 
                        key={supplier.supplierId}
                        variant="outline" 
                        className={
                          supplier.supplierId === bestPriceSupplier?.supplierId 
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" 
                            : !supplier.isValid 
                              ? "bg-gray-100 text-gray-500 hover:bg-gray-100 border-gray-200"
                              : ""
                        }
                      >
                        {supplier.supplierName}: {supplier.price && supplier.isValid ? `$${supplier.price.toFixed(2)}` : 'N/A'}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              No products found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
