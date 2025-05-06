
import { Product, Supplier } from '@/components/suppliers/SupplierList';
import { QuoteRequest, convertChefRequestToQuoteRequest, createQuoteRequest } from './quoteRequestsService';
import { sampleSuppliers } from '@/pages/Suppliers';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RequestItem } from '@/components/chef/requests/types';

/**
 * Find suppliers that offer a specific product by name
 */
export const findSuppliersForProduct = (productName: string): Supplier[] => {
  return sampleSuppliers.filter(supplier => 
    supplier.products.some(product => 
      product.name.toLowerCase() === productName.toLowerCase()
    )
  );
};

/**
 * Find all products that match requested items
 */
export const matchProductsToSuppliers = (items: RequestItem[]): Map<string, RequestItem[]> => {
  // Map to store supplier ID -> matching items
  const supplierItemsMap = new Map<string, RequestItem[]>();
  
  // For each requested item
  items.forEach(item => {
    // Find suppliers that offer this product
    const matchingSuppliers = findSuppliersForProduct(item.name);
    
    // Add this item to each matching supplier's list
    matchingSuppliers.forEach(supplier => {
      if (!supplierItemsMap.has(supplier.id)) {
        supplierItemsMap.set(supplier.id, []);
      }
      supplierItemsMap.get(supplier.id)?.push(item);
    });
  });
  
  return supplierItemsMap;
};

/**
 * Aggregate items from multiple requests
 * Combines items with the same name and adds quantities
 */
export const aggregateItems = (requestsItems: RequestItem[][]): RequestItem[] => {
  const aggregatedItemsMap = new Map<string, RequestItem>();
  
  requestsItems.flat().forEach(item => {
    const key = `${item.name}:${item.unit}`.toLowerCase();
    
    if (aggregatedItemsMap.has(key)) {
      // Item exists, add quantities
      const existingItem = aggregatedItemsMap.get(key)!;
      const currentQty = typeof existingItem.quantity === 'string' 
        ? parseFloat(existingItem.quantity) 
        : existingItem.quantity;
      const addQty = typeof item.quantity === 'string'
        ? parseFloat(item.quantity)
        : item.quantity;
      
      existingItem.quantity = currentQty + addQty;
    } else {
      // New item
      aggregatedItemsMap.set(key, { ...item });
    }
  });
  
  return Array.from(aggregatedItemsMap.values());
};

/**
 * Generate quote requests for multiple suppliers based on matching products
 */
export const generateSupplierQuoteRequests = async (
  title: string,
  items: RequestItem[],
  dueDate: Date,
  category: string
): Promise<string[]> => {
  try {
    const supplierItemsMap = matchProductsToSuppliers(items);
    const quoteIds: string[] = [];
    
    // For each supplier that has matching items, create a quote request
    for (const [supplierId, supplierItems] of supplierItemsMap.entries()) {
      const supplier = sampleSuppliers.find(s => s.id === supplierId);
      
      if (supplier) {
        const quoteId = await createQuoteRequest(
          title,
          supplierId,
          supplier.name,
          dueDate,
          category,
          supplierItems
        );
        quoteIds.push(quoteId);
      }
    }
    
    return quoteIds;
  } catch (error) {
    console.error("Error generating supplier quote requests:", error);
    toast.error("Failed to generate supplier quote requests");
    return [];
  }
};

/**
 * Get multiple chef requests by IDs
 */
export const getChefRequestsById = async (requestIds: string[]) => {
  try {
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*, request_items(*)')
      .in('id', requestIds);
    
    if (error) throw error;
    return requests;
  } catch (error) {
    console.error("Error fetching chef requests:", error);
    throw error;
  }
};
