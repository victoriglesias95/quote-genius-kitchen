
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestItem } from "@/components/chef/requests/types";
import { toast } from "sonner";

// Interface for Quote Request
export interface QuoteRequest {
  id: string;
  title: string;
  supplier: string;
  status: string;
  dueDate: Date;
  fromChefRequest: boolean;
  chefName?: string;
  items: number;
  category: string;
  isValid?: boolean;
  totalPrice?: number;
  validUntil?: Date;
}

// Interface for Quote Item with price information
export interface QuoteItemWithPrice extends RequestItem {
  price: number;
}

// Convert a chef request to a quote request
export const convertChefRequestToQuoteRequest = async (
  chefRequestId: string,
  supplierId: string,
  supplierName: string
): Promise<string> => {
  try {
    // First, fetch the chef request details
    const { data: chefRequest, error: fetchError } = await supabase
      .from('requests')
      .select('*, request_items(*)')
      .eq('id', chefRequestId)
      .single();

    if (fetchError) {
      console.error("Error fetching chef request:", fetchError);
      throw new Error(fetchError.message);
    }

    if (!chefRequest) {
      throw new Error("Chef request not found");
    }

    // Create a new quote in the quotes table
    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        request_id: chefRequestId,
        supplier_id: supplierId,
        supplier_name: supplierName,
        total_price: 0, // This will be updated when the supplier responds
        submitted_date: new Date().toISOString(),
        delivery_date: null,
        is_valid: true
      })
      .select()
      .single();

    if (quoteError) {
      console.error("Error creating quote:", quoteError);
      throw new Error(quoteError.message);
    }

    // Update the chef request status to show it's been sent for quotes
    const { error: updateError } = await supabase
      .from('requests')
      .update({ status: 'approved' })
      .eq('id', chefRequestId);

    if (updateError) {
      console.error("Error updating chef request status:", updateError);
      throw new Error(updateError.message);
    }

    return newQuote.id;
  } catch (error) {
    console.error("Failed to convert chef request to quote:", error);
    throw error;
  }
};

// Fetch all quote requests
export const fetchQuoteRequests = async (): Promise<QuoteRequest[]> => {
  try {
    // Fetch quotes with related request data
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select(`
        *,
        requests:request_id (
          title,
          status,
          due_date,
          category,
          assigned_to
        )
      `)
      .order('created_at', { ascending: false });

    if (quotesError) {
      console.error("Error fetching quotes:", quotesError);
      throw new Error(quotesError.message);
    }

    // Fetch request items count for each request
    const quoteRequests = await Promise.all(quotes.map(async (quote) => {
      // Get items count for this request
      const { count: itemsCount, error: countError } = await supabase
        .from('request_items')
        .select('*', { count: 'exact', head: true })
        .eq('request_id', quote.request_id);

      if (countError) {
        console.error("Error fetching request items count:", countError);
        return null;
      }

      const request = quote.requests;
      
      // Check validity - a quote is valid if delivery_date is in the future
      const isValid = quote.is_valid && quote.delivery_date 
        ? new Date(quote.delivery_date) > new Date() 
        : false;

      // Map database quote to QuoteRequest format
      return {
        id: quote.id,
        title: request.title,
        supplier: quote.supplier_name,
        status: request.status || 'pending',
        dueDate: new Date(request.due_date),
        fromChefRequest: true,
        chefName: request.assigned_to ? `Chef #${request.assigned_to.substring(0, 5)}` : 'Kitchen Staff',
        items: itemsCount || 0,
        category: request.category,
        isValid: isValid,
        totalPrice: quote.total_price,
        validUntil: quote.delivery_date ? new Date(quote.delivery_date) : undefined
      };
    }));

    // Filter out any null values (from errors)
    return quoteRequests.filter(Boolean) as QuoteRequest[];
  } catch (error) {
    console.error("Failed to fetch quote requests:", error);
    toast.error("Failed to load quote requests");
    return [];
  }
};

// Create a new quote request directly (not from chef request)
export const createQuoteRequest = async (
  title: string,
  supplierId: string,
  supplierName: string,
  dueDate: Date,
  category: string,
  items: { name: string; quantity: string | number; unit: string }[]
): Promise<string> => {
  try {
    // First create a request
    const { data: newRequest, error: requestError } = await supabase
      .from('requests')
      .insert({
        title: title,
        status: 'pending',
        due_date: dueDate.toISOString(),
        category: category
      })
      .select()
      .single();

    if (requestError) {
      console.error("Error creating request:", requestError);
      throw new Error(requestError.message);
    }

    // Then create request items
    const requestItems = items.map(item => ({
      request_id: newRequest.id,
      name: item.name,
      quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
      unit: item.unit
    }));

    const { error: itemsError } = await supabase
      .from('request_items')
      .insert(requestItems);

    if (itemsError) {
      console.error("Error creating request items:", itemsError);
      throw new Error(itemsError.message);
    }

    // Finally create the quote
    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        request_id: newRequest.id,
        supplier_id: supplierId,
        supplier_name: supplierName,
        total_price: 0,
        submitted_date: new Date().toISOString(),
        is_valid: true
      })
      .select()
      .single();

    if (quoteError) {
      console.error("Error creating quote:", quoteError);
      throw new Error(quoteError.message);
    }

    return newQuote.id;
  } catch (error) {
    console.error("Failed to create quote request:", error);
    throw error;
  }
};

// Update quote status with item prices
export const updateQuoteStatus = async (
  quoteId: string,
  newStatus: string,
  priceData?: { items: { itemId: string, price: number }[], validUntil: Date }
): Promise<void> => {
  try {
    // First, get the request_id associated with this quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('request_id')
      .eq('id', quoteId)
      .single();
    
    if (quoteError) {
      console.error("Error fetching quote:", quoteError);
      throw new Error(quoteError.message);
    }

    // Update the quote with price data if provided (when moving from sent to received)
    if (newStatus === 'received' && priceData) {
      // Calculate total price from individual items
      const totalPrice = priceData.items.reduce((sum, item) => sum + item.price, 0);
      
      // Insert price data for each item
      for (const item of priceData.items) {
        // First, get the request item details to copy quantity
        const { data: requestItem, error: itemError } = await supabase
          .from('request_items')
          .select('quantity')
          .eq('id', item.itemId)
          .single();
          
        if (itemError) {
          console.error("Error fetching request item:", itemError);
          continue;
        }
        
        // Add to quote_items table
        const { error: insertItemError } = await supabase
          .from('quote_items')
          .insert({
            quote_id: quoteId,
            item_id: item.itemId,
            price: item.price,
            quantity: requestItem.quantity
          });
          
        if (insertItemError) {
          console.error("Error inserting quote item:", insertItemError);
          continue;
        }
        
        // Update default price in request_items for future reference
        const { error: updatePriceError } = await supabase
          .from('request_items')
          .update({
            default_price: item.price
          })
          .eq('id', item.itemId);
          
        if (updatePriceError) {
          console.error("Error updating default price:", updatePriceError);
        }
      }
      
      // Update the quote with total price and validity info
      const { error: updateQuoteError } = await supabase
        .from('quotes')
        .update({
          total_price: totalPrice,
          delivery_date: priceData.validUntil.toISOString(),
          is_valid: true
        })
        .eq('id', quoteId);
      
      if (updateQuoteError) {
        console.error("Error updating quote price data:", updateQuoteError);
        throw new Error(updateQuoteError.message);
      }
    }
    
    // Then update the status of the request
    const { error: updateError } = await supabase
      .from('requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', quote.request_id);
    
    if (updateError) {
      console.error("Error updating request status:", updateError);
      throw new Error(updateError.message);
    }
    
    // Check and update validity if needed
    if (newStatus === 'ordered') {
      // When an order is placed, the quote is no longer valid
      const { error: validityError } = await supabase
        .from('quotes')
        .update({ is_valid: false })
        .eq('id', quoteId);
      
      if (validityError) {
        console.error("Error updating quote validity:", validityError);
      }
    }
  } catch (error) {
    console.error("Failed to update quote status:", error);
    throw error;
  }
};

// Fetch quote request by ID
export const fetchQuoteRequestById = async (id: string): Promise<QuoteRequest> => {
  try {
    // Fetch quote with related request data
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        requests:request_id (
          title,
          status,
          due_date,
          category,
          assigned_to
        )
      `)
      .eq('id', id)
      .single();

    if (quoteError) {
      console.error("Error fetching quote:", quoteError);
      throw new Error(quoteError.message);
    }

    if (!quote) {
      throw new Error("Quote not found");
    }

    // Get items count for this request
    const { count: itemsCount, error: countError } = await supabase
      .from('request_items')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', quote.request_id);

    if (countError) {
      console.error("Error fetching request items count:", countError);
      throw new Error(countError.message);
    }

    const request = quote.requests;
    
    // Check validity - a quote is valid if delivery_date is in the future
    const isValid = quote.is_valid && quote.delivery_date 
      ? new Date(quote.delivery_date) > new Date() 
      : false;

    // Map database quote to QuoteRequest format
    return {
      id: quote.id,
      title: request.title,
      supplier: quote.supplier_name,
      status: request.status || 'pending',
      dueDate: new Date(request.due_date),
      fromChefRequest: true,
      chefName: request.assigned_to ? `Chef #${request.assigned_to.substring(0, 5)}` : 'Kitchen Staff',
      items: itemsCount || 0,
      category: request.category,
      isValid: isValid,
      totalPrice: quote.total_price,
      validUntil: quote.delivery_date ? new Date(quote.delivery_date) : undefined
    };
  } catch (error) {
    console.error("Failed to fetch quote request:", error);
    throw error;
  }
};

// Fetch quote items with prices for a specific quote
export const fetchQuoteItems = async (quoteId: string): Promise<QuoteItemWithPrice[]> => {
  try {
    // First get the request_id for this quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('request_id')
      .eq('id', quoteId)
      .single();
      
    if (quoteError) {
      console.error("Error fetching quote:", quoteError);
      throw new Error(quoteError.message);
    }
    
    // Get all request items for this request
    const { data: requestItems, error: itemsError } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', quote.request_id);
      
    if (itemsError) {
      console.error("Error fetching request items:", itemsError);
      throw new Error(itemsError.message);
    }
    
    // Get all quote items (with prices) for this quote
    const { data: quoteItems, error: quoteItemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId);
      
    if (quoteItemsError) {
      console.error("Error fetching quote items:", quoteItemsError);
      throw new Error(quoteItemsError.message);
    }
    
    // Merge the request items with quote items to get prices
    const itemsWithPrices = requestItems.map(item => {
      // Find matching quote item if it exists
      const matchingQuoteItem = quoteItems?.find(qi => qi.item_id === item.id);
      
      return {
        ...item,
        price: matchingQuoteItem ? matchingQuoteItem.price : null
      };
    });
    
    return itemsWithPrices;
  } catch (error) {
    console.error("Failed to fetch quote items:", error);
    throw error;
  }
};
