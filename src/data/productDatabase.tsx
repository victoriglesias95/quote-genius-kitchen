
import { Product } from '@/components/suppliers/SupplierList';

// This type extends the Product type to include a unique ID for the database
export interface ProductDatabase extends Omit<Product, 'defaultPrice'> {
  id: string;
  name: string;
  category: string;
  unit: string;
}

// Master product list database
// This would be replaced with an API call to fetch from ERP in a production environment
export const productDatabase: ProductDatabase[] = [
  // Fruits
  { id: 'db-101', name: 'Organic Apples', category: 'Fruits', unit: 'kg' },
  { id: 'db-102', name: 'Bananas', category: 'Fruits', unit: 'kg' },
  { id: 'db-103', name: 'Oranges', category: 'Fruits', unit: 'kg' },
  { id: 'db-104', name: 'Strawberries', category: 'Fruits', unit: 'kg' },
  { id: 'db-105', name: 'Grapes', category: 'Fruits', unit: 'kg' },
  
  // Vegetables
  { id: 'db-201', name: 'Carrots', category: 'Vegetables', unit: 'kg' },
  { id: 'db-202', name: 'Lettuce', category: 'Vegetables', unit: 'each' },
  { id: 'db-203', name: 'Tomatoes', category: 'Vegetables', unit: 'kg' },
  { id: 'db-204', name: 'Onions', category: 'Vegetables', unit: 'kg' },
  { id: 'db-205', name: 'Potatoes', category: 'Vegetables', unit: 'kg' },
  { id: 'db-206', name: 'Bell Peppers', category: 'Vegetables', unit: 'kg' },
  
  // Fish
  { id: 'db-301', name: 'Fresh Salmon', category: 'Fish', unit: 'kg' },
  { id: 'db-302', name: 'Cod Fillets', category: 'Fish', unit: 'kg' },
  { id: 'db-303', name: 'Tuna Steaks', category: 'Fish', unit: 'kg' },
  
  // Shellfish
  { id: 'db-401', name: 'Shrimp', category: 'Shellfish', unit: 'kg' },
  { id: 'db-402', name: 'Mussels', category: 'Shellfish', unit: 'kg' },
  { id: 'db-403', name: 'Lobster Tail', category: 'Shellfish', unit: 'each' },
  
  // Beef
  { id: 'db-501', name: 'Beef Sirloin', category: 'Beef', unit: 'kg' },
  { id: 'db-502', name: 'Ground Beef', category: 'Beef', unit: 'kg' },
  { id: 'db-503', name: 'Ribeye Steak', category: 'Beef', unit: 'kg' },
  
  // Poultry
  { id: 'db-601', name: 'Chicken Breast', category: 'Poultry', unit: 'kg' },
  { id: 'db-602', name: 'Whole Chicken', category: 'Poultry', unit: 'each' },
  { id: 'db-603', name: 'Turkey Breast', category: 'Poultry', unit: 'kg' },
  
  // Pork
  { id: 'db-701', name: 'Pork Chops', category: 'Pork', unit: 'kg' },
  { id: 'db-702', name: 'Bacon', category: 'Pork', unit: 'kg' },
  { id: 'db-703', name: 'Ham', category: 'Pork', unit: 'kg' },
  
  // Dairy
  { id: 'db-801', name: 'Organic Milk', category: 'Milk', unit: 'liter' },
  { id: 'db-802', name: 'Cheese', category: 'Cheese', unit: 'kg' },
  { id: 'db-803', name: 'Yogurt', category: 'Yogurt', unit: 'kg' },
  { id: 'db-804', name: 'Butter', category: 'Dairy', unit: 'kg' },
  { id: 'db-805', name: 'Heavy Cream', category: 'Dairy', unit: 'liter' },
];

// Helper function to get unique categories for filtering
export const getUniqueCategories = (): string[] => {
  const categories = productDatabase.map(product => product.category);
  return [...new Set(categories)];
};

// Helper function to get products by category
export const getProductsByCategory = (category: string): ProductDatabase[] => {
  return productDatabase.filter(product => product.category === category);
};

// Helper function to find a product by ID
export const getProductById = (id: string): ProductDatabase | undefined => {
  return productDatabase.find(product => product.id === id);
};

// In a real application, you would have API functions here to:
// - Synchronize with ERP (fetchProductsFromERP)
// - Add new products to the database (addProductToDatabase)
// - Update product details (updateProductInDatabase)
// - etc.

