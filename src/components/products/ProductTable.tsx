
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { ProductDatabase } from '@/data/productDatabase';

interface ProductTableProps {
  products: ProductDatabase[];
  onEditProduct: (product: ProductDatabase) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEditProduct }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Units</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Actions</TableHead>
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
                    <Badge key={`${product.id}-${unit}-${idx}`} variant="outline">{unit}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{product.id}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditProduct(product)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Add Unit
                </Button>
              </TableCell>
            </TableRow>
          ))
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
};

export default ProductTable;
