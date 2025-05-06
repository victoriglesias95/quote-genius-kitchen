import { Product } from '@/components/suppliers/SupplierList';

// This type extends the Product type to include a unique ID for the database
export interface ProductDatabase {
  id: string;
  name: string;
  category: string;
  units: string[]; // Changed from single unit to array of units
}

// Master product list database
// This would be replaced with an API call to fetch from ERP in a production environment
export const productDatabase: ProductDatabase[] = [
  // Fruits
  { id: 'db-101', name: 'Organic Apples', category: 'Fruits', units: ['kg'] },
  { id: 'db-102', name: 'Bananas', category: 'Fruits', units: ['kg'] },
  { id: 'db-103', name: 'Oranges', category: 'Fruits', units: ['kg'] },
  { id: 'db-104', name: 'Strawberries', category: 'Fruits', units: ['kg'] },
  { id: 'db-105', name: 'Grapes', category: 'Fruits', units: ['kg'] },
  
  // Vegetables
  { id: 'db-201', name: 'Carrots', category: 'Vegetables', units: ['kg'] },
  { id: 'db-202', name: 'Lettuce', category: 'Vegetables', units: ['each'] },
  { id: 'db-203', name: 'Tomatoes', category: 'Vegetables', units: ['kg'] },
  { id: 'db-204', name: 'Onions', category: 'Vegetables', units: ['kg'] },
  { id: 'db-205', name: 'Potatoes', category: 'Vegetables', units: ['kg'] },
  { id: 'db-206', name: 'Bell Peppers', category: 'Vegetables', units: ['kg'] },
  
  // Fish
  { id: 'db-301', name: 'Fresh Salmon', category: 'Fish', units: ['kg'] },
  { id: 'db-302', name: 'Cod Fillets', category: 'Fish', units: ['kg'] },
  { id: 'db-303', name: 'Tuna Steaks', category: 'Fish', units: ['kg'] },
  
  // Shellfish
  { id: 'db-401', name: 'Shrimp', category: 'Shellfish', units: ['kg'] },
  { id: 'db-402', name: 'Mussels', category: 'Shellfish', units: ['kg'] },
  { id: 'db-403', name: 'Lobster Tail', category: 'Shellfish', units: ['each'] },
  
  // Beef
  { id: 'db-501', name: 'Beef Sirloin', category: 'Beef', units: ['kg'] },
  { id: 'db-502', name: 'Ground Beef', category: 'Beef', units: ['kg'] },
  { id: 'db-503', name: 'Ribeye Steak', category: 'Beef', units: ['kg'] },
  
  // Poultry
  { id: 'db-601', name: 'Chicken Breast', category: 'Poultry', units: ['kg'] },
  { id: 'db-602', name: 'Whole Chicken', category: 'Poultry', units: ['each'] },
  { id: 'db-603', name: 'Turkey Breast', category: 'Poultry', units: ['kg'] },
  
  // Pork
  { id: 'db-701', name: 'Pork Chops', category: 'Pork', units: ['kg'] },
  { id: 'db-702', name: 'Bacon', category: 'Pork', units: ['kg'] },
  { id: 'db-703', name: 'Ham', category: 'Pork', units: ['kg'] },
  
  // Dairy
  { id: 'db-801', name: 'Organic Milk', category: 'Milk', units: ['liter'] },
  { id: 'db-802', name: 'Cheese', category: 'Cheese', units: ['kg'] },
  { id: 'db-803', name: 'Yogurt', category: 'Yogurt', units: ['kg'] },
  { id: 'db-804', name: 'Butter', category: 'Dairy', units: ['kg'] },
  { id: 'db-805', name: 'Heavy Cream', category: 'Dairy', units: ['liter'] },
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

// Helper function to get all available units
export const getAvailableUnits = (): string[] => {
  return ["kg", "each", "liter", "box", "dozen", "pack"];
};

// Add a new product to the database
export const addProductToDatabase = (name: string, category: string, units: string[]): ProductDatabase => {
  // Generate a new ID based on category prefix
  const categoryPrefix = getCategoryPrefix(category);
  const existingProductsInCategory = productDatabase.filter(p => p.id.startsWith(`db-${categoryPrefix}`));
  const newProductCount = existingProductsInCategory.length + 1;
  const newProductId = `db-${categoryPrefix}${newProductCount.toString().padStart(2, '0')}`;
  
  const newProduct: ProductDatabase = {
    id: newProductId,
    name,
    category,
    units
  };
  
  productDatabase.push(newProduct);
  return newProduct;
};

// Update an existing product in the database
export const updateProductInDatabase = (id: string, updates: Partial<Omit<ProductDatabase, 'id'>>): ProductDatabase | undefined => {
  const index = productDatabase.findIndex(product => product.id === id);
  if (index === -1) return undefined;
  
  productDatabase[index] = { ...productDatabase[index], ...updates };
  return productDatabase[index];
};

// Add a unit to an existing product
export const addUnitToProduct = (id: string, unit: string): ProductDatabase | undefined => {
  const product = getProductById(id);
  if (!product) return undefined;
  
  // Only add if unit isn't already in the list
  if (!product.units.includes(unit)) {
    product.units.push(unit);
  }
  
  return product;
};

// Helper function to get prefix for a category
const getCategoryPrefix = (category: string): string => {
  // Map categories to their ID prefixes
  const categoryMap: {[key: string]: string} = {
    'Fruits': '1',
    'Vegetables': '2',
    'Fish': '3',
    'Shellfish': '4',
    'Beef': '5',
    'Poultry': '6',
    'Pork': '7',
    'Dairy': '8',
    'Milk': '8',
    'Cheese': '8',
    'Yogurt': '8'
  };
  
  // Return the mapped prefix or use '9' for any new/unmapped categories
  return categoryMap[category] || '9';
};

// In a real application, you would have more API functions here to:
// - Synchronize with ERP (fetchProductsFromERP)
// - Update product details (updateProductInDatabase)
// - Delete products (deleteProductFromDatabase)
// - etc.
