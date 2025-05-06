
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuoteItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  validUntil?: Date;
  quoteId?: string;
}

export function useQuoteItems() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuoteItems() {
      try {
        setIsLoading(true);
        
        // First get all valid quotes
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('id, supplier_id, supplier_name, delivery_date, is_valid')
          .eq('is_valid', true);

        if (quotesError) {
          throw new Error(quotesError.message);
        }

        if (!quotes || quotes.length === 0) {
          setQuoteItems([]);
          return;
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
              quoteId: quote.id
            });
          }
        }

        setQuoteItems(allItems);
      } catch (err) {
        console.error('Failed to fetch quote items:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        toast.error('Failed to load quote items');
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuoteItems();
  }, []);

  return { quoteItems, isLoading, error };
}
