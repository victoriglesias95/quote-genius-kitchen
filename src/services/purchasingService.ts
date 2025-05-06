
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Request, RequestItem } from "@/components/chef/requests/types";

export interface SelectedQuoteItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  supplierId: string;
  supplierName: string;
  price: number;
  totalPrice: number;
  requestId: string;
  requestTitle: string;
  isOptional: boolean;
}

export interface SupplierGroup {
  supplierId: string;
  supplierName: string;
  items: SelectedQuoteItem[];
  totalValue: number;
  itemCount: number;
  isSmallOrder: boolean;
}

export interface MissingItem {
  name: string;
  quantity: number;
  unit: string;
  requestId: string;
  requestTitle: string;
  quotedBy: Array<{
    supplierId: string;
    supplierName: string;
    price: number;
  }>;
}

// Fetch selected quote items (in a real app, these would be stored in the database)
// For now, we'll use mock data
export const fetchSelectedQuoteItems = async (): Promise<SelectedQuoteItem[]> => {
  try {
    // In a real app, you would fetch this from your database
    // For this demo, we'll return mock data that matches our requirements
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return [
      {
        id: "item-1",
        itemName: "Organic Tomatoes",
        quantity: 20,
        unit: "kg",
        supplierId: "supplier-1",
        supplierName: "Farm Fresh Produce",
        price: 2.50,
        totalPrice: 50.00,
        requestId: "req-1",
        requestTitle: "Weekly Produce",
        isOptional: false
      },
      {
        id: "item-2",
        itemName: "Lettuce",
        quantity: 10,
        unit: "kg",
        supplierId: "supplier-1",
        supplierName: "Farm Fresh Produce",
        price: 1.80,
        totalPrice: 18.00,
        requestId: "req-1",
        requestTitle: "Weekly Produce",
        isOptional: false
      },
      {
        id: "item-3",
        itemName: "Chicken Breast",
        quantity: 15,
        unit: "kg",
        supplierId: "supplier-2",
        supplierName: "Premium Meats Inc.",
        price: 8.50,
        totalPrice: 127.50,
        requestId: "req-2",
        requestTitle: "Weekly Meat Order",
        isOptional: false
      },
      {
        id: "item-4",
        itemName: "Beef Sirloin",
        quantity: 10,
        unit: "kg",
        supplierId: "supplier-2",
        supplierName: "Premium Meats Inc.",
        price: 12.00,
        totalPrice: 120.00,
        requestId: "req-2",
        requestTitle: "Weekly Meat Order",
        isOptional: false
      },
      {
        id: "item-5",
        itemName: "Saffron",
        quantity: 50,
        unit: "g",
        supplierId: "supplier-3",
        supplierName: "Gourmet Suppliers",
        price: 5.00,
        totalPrice: 250.00,
        requestId: "req-3",
        requestTitle: "Specialty Ingredients",
        isOptional: true
      },
      {
        id: "item-6",
        itemName: "Black Pepper",
        quantity: 2,
        unit: "kg",
        supplierId: "supplier-4",
        supplierName: "Spice Specialists",
        price: 8.00,
        totalPrice: 16.00,
        requestId: "req-3",
        requestTitle: "Specialty Ingredients",
        isOptional: false
      }
    ];
  } catch (error) {
    console.error("Failed to fetch selected quote items:", error);
    toast.error("Failed to load selected items");
    return [];
  }
};

// Fetch original chef requests
export const fetchChefRequests = async (): Promise<Request[]> => {
  try {
    // In a real app, this would fetch from your database
    // For now, we'll simulate the data
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return [
      {
        id: "req-1",
        title: "Weekly Produce",
        status: "approved",
        dueDate: new Date("2025-05-15"),
        category: "Produce",
        items: [
          { id: "item-1-1", name: "Organic Tomatoes", quantity: 20, unit: "kg" },
          { id: "item-1-2", name: "Lettuce", quantity: 10, unit: "kg" },
          { id: "item-1-3", name: "Carrots", quantity: 15, unit: "kg" },
          { id: "item-1-4", name: "Bell Peppers", quantity: 8, unit: "kg" }
        ]
      },
      {
        id: "req-2",
        title: "Weekly Meat Order",
        status: "approved",
        dueDate: new Date("2025-05-16"),
        category: "Meat",
        items: [
          { id: "item-2-1", name: "Chicken Breast", quantity: 15, unit: "kg" },
          { id: "item-2-2", name: "Beef Sirloin", quantity: 10, unit: "kg" },
          { id: "item-2-3", name: "Pork Loin", quantity: 8, unit: "kg" }
        ]
      },
      {
        id: "req-3",
        title: "Specialty Ingredients",
        status: "approved",
        dueDate: new Date("2025-05-14"),
        category: "Specialty",
        items: [
          { id: "item-3-1", name: "Saffron", quantity: 50, unit: "g" },
          { id: "item-3-2", name: "Black Pepper", quantity: 2, unit: "kg" },
          { id: "item-3-3", name: "Vanilla Beans", quantity: 20, unit: "pods" }
        ]
      }
    ];
  } catch (error) {
    console.error("Failed to fetch chef requests:", error);
    toast.error("Failed to load chef requests");
    return [];
  }
};

// Group selected items by supplier
export const groupItemsBySupplier = (items: SelectedQuoteItem[]): SupplierGroup[] => {
  // Create a map to group items by supplier
  const supplierMap = new Map<string, SupplierGroup>();
  
  items.forEach(item => {
    if (!supplierMap.has(item.supplierId)) {
      supplierMap.set(item.supplierId, {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        items: [],
        totalValue: 0,
        itemCount: 0,
        isSmallOrder: false
      });
    }
    
    const group = supplierMap.get(item.supplierId)!;
    group.items.push(item);
    group.totalValue += item.totalPrice;
    group.itemCount += 1;
  });
  
  // Convert map to array and flag small orders
  const supplierGroups = Array.from(supplierMap.values());
  
  // Flag small orders (1-2 items with low total value)
  supplierGroups.forEach(group => {
    group.isSmallOrder = (group.itemCount <= 2 && group.totalValue < 50);
  });
  
  return supplierGroups.sort((a, b) => b.totalValue - a.totalValue);
};

// Find items from chef requests that are missing from the selected quotes
export const findMissingItems = (
  selectedItems: SelectedQuoteItem[], 
  chefRequests: Request[]
): MissingItem[] => {
  const missingItems: MissingItem[] = [];
  
  // Create a map of selected items for quick lookup
  const selectedItemsMap = new Map<string, boolean>();
  selectedItems.forEach(item => {
    // Create a unique key based on item name and request
    const key = `${item.itemName.toLowerCase()}_${item.requestId}`;
    selectedItemsMap.set(key, true);
  });
  
  // Check each chef request item against the selected items
  chefRequests.forEach(request => {
    request.items.forEach(item => {
      const key = `${item.name.toLowerCase()}_${request.id}`;
      
      if (!selectedItemsMap.has(key)) {
        // This item is missing from the selected quotes
        missingItems.push({
          name: item.name,
          quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
          unit: item.unit,
          requestId: request.id,
          requestTitle: request.title,
          // In a real app, you would fetch this from your database of quotes
          quotedBy: [
            { supplierId: 'supplier-1', supplierName: 'Farm Fresh Produce', price: 2.20 },
            { supplierId: 'supplier-3', supplierName: 'Gourmet Suppliers', price: 2.50 }
          ]
        });
      }
    });
  });
  
  return missingItems;
};

// Calculate order optimization suggestions
export const suggestOrderOptimization = (
  supplierGroups: SupplierGroup[]
): { fromSupplier: SupplierGroup, toSupplier: SupplierGroup, items: SelectedQuoteItem[] }[] => {
  const suggestions: { fromSupplier: SupplierGroup, toSupplier: SupplierGroup, items: SelectedQuoteItem[] }[] = [];
  
  // Find small orders
  const smallOrders = supplierGroups.filter(group => group.isSmallOrder);
  const largeOrders = supplierGroups.filter(group => !group.isSmallOrder);
  
  // For each small order, suggest moving to a large order
  smallOrders.forEach(smallOrder => {
    if (largeOrders.length > 0) {
      // Suggest moving to the largest order
      suggestions.push({
        fromSupplier: smallOrder,
        toSupplier: largeOrders[0],
        items: smallOrder.items
      });
    }
  });
  
  return suggestions;
};
