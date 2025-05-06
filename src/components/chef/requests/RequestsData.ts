
// Sample request data
export const sampleRequests = [
  {
    id: 'req-1',
    title: 'Weekly Produce Order',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    category: 'produce',
    items: [
      { id: 'item-1', name: 'Tomatoes', quantity: 10, unit: 'kg' },
      { id: 'item-2', name: 'Lettuce', quantity: 15, unit: 'heads' },
      { id: 'item-3', name: 'Carrots', quantity: 8, unit: 'kg' }
    ]
  },
  {
    id: 'req-2',
    title: 'Meat Stock',
    status: 'approved',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    category: 'meat',
    items: [
      { id: 'item-4', name: 'Beef Sirloin', quantity: 20, unit: 'kg' },
      { id: 'item-5', name: 'Chicken Breast', quantity: 15, unit: 'kg' }
    ]
  },
  {
    id: 'req-3',
    title: 'Dairy Products',
    status: 'completed',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    category: 'dairy',
    items: [
      { id: 'item-6', name: 'Milk', quantity: 20, unit: 'liters' },
      { id: 'item-7', name: 'Cheese', quantity: 5, unit: 'kg' },
      { id: 'item-8', name: 'Yogurt', quantity: 30, unit: 'cups' }
    ]
  },
  {
    id: 'req-4',
    title: 'Dry Goods',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    category: 'dry goods',
    items: [
      { id: 'item-9', name: 'Rice', quantity: 25, unit: 'kg' },
      { id: 'item-10', name: 'Flour', quantity: 15, unit: 'kg' },
      { id: 'item-11', name: 'Sugar', quantity: 10, unit: 'kg' }
    ]
  },
  {
    id: 'req-5',
    title: 'Special Ingredients',
    status: 'rejected',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    category: 'specialty',
    items: [
      { id: 'item-12', name: 'Saffron', quantity: 100, unit: 'g' },
      { id: 'item-13', name: 'Truffle Oil', quantity: 5, unit: 'bottles' }
    ]
  }
];

// Add delivered requests
export const deliveredRequests = [
  {
    id: 'req-6',
    title: 'Weekly Seafood Order',
    status: 'delivered',
    deliveryDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)),
    category: 'seafood',
    items: [
      { id: 'item-14', name: 'Salmon', quantity: 15, unit: 'kg' },
      { id: 'item-15', name: 'Shrimp', quantity: 7, unit: 'kg' }
    ]
  },
  {
    id: 'req-7',
    title: 'Monthly Dry Goods',
    status: 'delivered',
    deliveryDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    category: 'dry goods',
    items: [
      { id: 'item-16', name: 'Pasta', quantity: 25, unit: 'kg' },
      { id: 'item-17', name: 'Canned Tomatoes', quantity: 40, unit: 'cans' }
    ]
  }
];

// Add sample inventory data for products
export const sampleInventory = [
  { id: '1', name: 'Onions', category: 'Vegetables', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '2', name: 'Chicken Breast', category: 'Meat', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '3', name: 'Olive Oil', category: 'Oils', currentStock: 'High', unit: 'liter', counted: false },
  { id: '4', name: 'Salt', category: 'Spices', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '5', name: 'Flour', category: 'Dry Goods', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '6', name: 'Eggs', category: 'Dairy', currentStock: 'Low', unit: 'dozen', counted: false },
  { id: '7', name: 'Bell Peppers', category: 'Vegetables', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '8', name: 'Beef Sirloin', category: 'Beef', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '9', name: 'Sugar', category: 'Dry Goods', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '10', name: 'Butter', category: 'Dairy', currentStock: 'Low', unit: 'kg', counted: false },
];

// Combine all requests
export const allRequests = [...sampleRequests, ...deliveredRequests];
