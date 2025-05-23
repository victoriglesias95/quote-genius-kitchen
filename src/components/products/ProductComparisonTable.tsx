
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/components/suppliers/SupplierList';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  onAddToCart?: (product: ProductWithSuppliers, supplierId: string) => void;
}

export function ProductComparisonTable({ products, onAddToCart }: ProductComparisonTableProps) {
  // State to track selected suppliers for each product
  const [selectedSuppliers, setSelectedSuppliers] = useState<Record<string, string>>({});
  
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

  // Handle selecting a supplier for a product
  const handleSelectSupplier = (productId: string, supplierId: string) => {
    setSelectedSuppliers(prev => ({
      ...prev,
      [productId]: supplierId
    }));
    
    // Get supplier and product info for toast
    const product = products.find(p => p.id === productId);
    const supplier = product?.suppliers.find(s => s.supplierId === supplierId);
    
    if (product && supplier) {
      toast.success(`Selected ${supplier.supplierName} for ${product.name}`);
    }
  };

  // Handle adding product to cart
  const handleAddToCart = (productId: string) => {
    const supplierId = selectedSuppliers[productId];
    if (!supplierId) return;
    
    const product = products.find(p => p.id === productId);
    if (product && onAddToCart) {
      onAddToCart(product, supplierId);
    } else {
      const supplier = product?.suppliers.find(s => s.supplierId === supplierId);
      toast.success(`Added ${product?.name} from ${supplier?.supplierName} to cart`);
    }
  };

  // Check if selected supplier is not the best price
  const isNotBestPrice = (product: ProductWithSuppliers, selectedSupplierId: string): boolean => {
    const bestSupplier = getBestPriceSupplier(product.suppliers);
    return !!bestSupplier && bestSupplier.supplierId !== selectedSupplierId;
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
          <TableHead className="w-[100px] text-right">Select</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length > 0 ? (
          products.map(product => {
            const bestPriceSupplier = getBestPriceSupplier(product.suppliers);
            const currentSelectedSupplier = selectedSuppliers[product.id] || 
              (bestPriceSupplier ? bestPriceSupplier.supplierId : '');
            
            const notBestPrice = isNotBestPrice(product, currentSelectedSupplier);
            
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
                    {product.suppliers.map((supplier) => {
                      const isSelected = supplier.supplierId === currentSelectedSupplier;
                      const isBest = supplier.supplierId === bestPriceSupplier?.supplierId;
                      
                      return (
                        <Badge 
                          key={supplier.supplierId}
                          variant={isSelected ? "default" : "outline"} 
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-blue-500 hover:bg-blue-600" 
                              : isBest && supplier.isValid
                                ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" 
                                : !supplier.isValid 
                                  ? "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200"
                                  : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleSelectSupplier(product.id, supplier.supplierId)}
                        >
                          {supplier.supplierName}: {supplier.price && supplier.isValid ? `$${supplier.price.toFixed(2)}` : 'N/A'}
                        </Badge>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    {notBestPrice && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mr-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Not the lowest price option</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      className={`inline-flex items-center justify-center rounded-md transition-colors ${
                        currentSelectedSupplier 
                          ? notBestPrice 
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      disabled={!currentSelectedSupplier}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="ml-1">Add</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No products found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
