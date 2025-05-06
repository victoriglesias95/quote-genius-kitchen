import { supabase } from "@/integrations/supabase/client";
import { Request } from "@/components/chef/requests/types";
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
        delivery_date: null
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

      // Map database quote to QuoteRequest format
      return {
        id: quote.id,
        title: request.title,
        supplier: quote.supplier_name,
        status: request.status || 'pending',  // Fix: Use request.status directly
        dueDate: new Date(request.due_date),
        fromChefRequest: true,
        chefName: request.assigned_to ? `Chef #${request.assigned_to.substring(0, 5)}` : 'Kitchen Staff',
        items: itemsCount || 0,
        category: request.category
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
        submitted_date: new Date().toISOString()
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

// Update quote status
export const updateQuoteStatus = async (
  quoteId: string,
  newStatus: string
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
    
    // Then update the status of the request
    const { error: updateError } = await supabase
      .from('requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', quote.request_id);
    
    if (updateError) {
      console.error("Error updating request status:", updateError);
      throw new Error(updateError.message);
    }
  } catch (error) {
    console.error("Failed to update quote status:", error);
    throw error;
  }
};
