
import { sampleSuppliers } from '@/pages/Suppliers';
import { ItemType } from './ItemsList';

export const generateItemsFromSupplier = (supplierId: string): ItemType[] => {
  // Find the selected supplier
  const selectedSupplier = sampleSuppliers.find(supplier => supplier.id === supplierId);
  
  if (selectedSupplier && selectedSupplier.products.length > 0) {
    // Map supplier products to items format
    return selectedSupplier.products.map(product => ({
      id: product.id,
      name: product.name,
      quantity: '1', // Default quantity
      unit: product.unit
    }));
  } 
  
  // Return one empty item if no products
  return [{ id: '1', name: '', quantity: '', unit: 'kg' }];
};
