
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from './SupplierList';
import { Badge } from '@/components/ui/badge';

interface SupplierProductsProps {
  products: Product[];
}

export function SupplierProducts({ products }: SupplierProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Products available from this supplier</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Units</TableHead>
              <TableHead className="text-right">Default Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.units.map((unit, idx) => (
                        <Badge key={`${product.id}-unit-${idx}`} variant="outline">{unit}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.defaultPrice ? `$${product.defaultPrice.toFixed(2)}` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No products available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
