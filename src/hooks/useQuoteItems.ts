
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export interface QuoteItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  validUntil?: Date;
  quoteId?: string;
  isSelected?: boolean;
  isLowestPrice?: boolean;
}

export function useQuoteItems() {
  const { data: quoteItems, isLoading, error, refetch } = useQuery({
    queryKey: ['quoteItems'],
    queryFn: async () => {
      try {
        // First get all valid quotes
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('id, supplier_id, supplier_name, delivery_date, is_valid')
          .eq('is_valid', true);

        if (quotesError) {
          throw new Error(quotesError.message);
        }

        if (!quotes || quotes.length === 0) {
          return [];
        }

        // Fetch quote items for these quotes
        const allItems: QuoteItem[] = [];
        
        for (const quote of quotes) {
          // Get quote items
          const { data: quoteItemsData, error: itemsError } = await supabase
            .from('quote_items')
            .select(`
              id, 
              price, 
              quantity,
              item_id
            `)
            .eq('quote_id', quote.id);

          if (itemsError) {
            console.error(`Error fetching items for quote ${quote.id}:`, itemsError);
            continue;
          }

          if (!quoteItemsData || quoteItemsData.length === 0) {
            continue;
          }

          // For each quote item, get the request item details
          for (const quoteItem of quoteItemsData) {
            const { data: requestItem, error: requestItemError } = await supabase
              .from('request_items')
              .select('name, unit')
              .eq('id', quoteItem.item_id)
              .single();

            if (requestItemError) {
              console.error(`Error fetching request item ${quoteItem.item_id}:`, requestItemError);
              continue;
            }

            // Add to our collection
            allItems.push({
              id: quoteItem.id,
              name: requestItem.name,
              price: quoteItem.price,
              quantity: quoteItem.quantity,
              unit: requestItem.unit,
              supplierId: quote.supplier_id,
              supplierName: quote.supplier_name,
              validUntil: quote.delivery_date ? new Date(quote.delivery_date) : undefined,
              quoteId: quote.id,
              isSelected: false,
              isLowestPrice: false
            });
          }
        }

        // Mark lowest price items for each product name
        const productGroups = new Map<string, QuoteItem[]>();
        
        // Group by product name
        allItems.forEach(item => {
          const key = item.name.toLowerCase();
          if (!productGroups.has(key)) {
            productGroups.set(key, []);
          }
          productGroups.get(key)?.push(item);
        });
        
        // For each product group, mark the lowest price item
        productGroups.forEach(group => {
          if (group.length > 0) {
            const lowestPriceItem = group.reduce((lowest, current) => 
              current.price < lowest.price ? current : lowest
            , group[0]);
            
            const lowestIndex = allItems.findIndex(item => item.id === lowestPriceItem.id);
            if (lowestIndex >= 0) {
              allItems[lowestIndex].isLowestPrice = true;
            }
          }
        });

        return allItems;
      } catch (err) {
        console.error('Failed to fetch quote items:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Effect to show toast for errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load quote items');
      console.error(error);
    }
  }, [error]);

  return { 
    quoteItems: quoteItems || [], 
    isLoading, 
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    refetch 
  };
}
