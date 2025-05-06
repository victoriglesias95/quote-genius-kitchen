
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestItem } from "@/components/chef/requests/types";

// Type for the database request shape
export interface DbRequest {
  id: string;
  title: string;
  status: string;
  due_date: string;
  delivery_date?: string;
  category: string;
  notes?: string;
  assigned_to?: string;
  quote_deadline?: string;
  reminder_sent?: boolean;
  created_at: string;
  updated_at: string;
}

// Type for the database request item shape
export interface DbRequestItem {
  id: string;
  request_id: string;
  name: string;
  quantity: number;
  unit: string;
  created_at: string;
}

// Type for the database quote shape
export interface DbQuote {
  id: string;
  request_id: string;
  supplier_id: string;
  supplier_name: string;
  total_price: number;
  delivery_date?: string;
  submitted_date: string;
  created_at: string;
}

// Type for the database quote item shape
export interface DbQuoteItem {
  id: string;
  quote_id: string;
  item_id: string;
  price: number;
  quantity: number;
  notes?: string;
  created_at: string;
}

// Convert database request to application request
const mapDbRequestToAppRequest = async (dbRequest: DbRequest): Promise<Request> => {
  // Fetch items for this request
  const { data: dbItems, error: itemsError } = await supabase
    .from('request_items')
    .select('*')
    .eq('request_id', dbRequest.id);

  if (itemsError) {
    console.error('Error fetching request items:', itemsError);
    throw new Error(itemsError.message);
  }

  // Fetch quotes for this request
  const { data: dbQuotes, error: quotesError } = await supabase
    .from('quotes')
    .select('*')
    .eq('request_id', dbRequest.id);

  if (quotesError) {
    console.error('Error fetching quotes:', quotesError);
    throw new Error(quotesError.message);
  }

  // Map quotes to application model
  const quotes = await Promise.all(dbQuotes.map(async (dbQuote) => {
    // Fetch items for this quote
    const { data: dbQuoteItems, error: quoteItemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', dbQuote.id);

    if (quoteItemsError) {
      console.error('Error fetching quote items:', quoteItemsError);
      throw new Error(quoteItemsError.message);
    }

    return {
      supplierId: dbQuote.supplier_id,
      supplierName: dbQuote.supplier_name,
      items: dbQuoteItems.map(item => ({
        itemId: item.item_id,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes
      })),
      totalPrice: dbQuote.total_price,
      deliveryDate: dbQuote.delivery_date ? new Date(dbQuote.delivery_date) : undefined,
      submittedDate: new Date(dbQuote.submitted_date)
    };
  }));

  // Convert to application model
  return {
    id: dbRequest.id,
    title: dbRequest.title,
    status: dbRequest.status,
    dueDate: new Date(dbRequest.due_date),
    deliveryDate: dbRequest.delivery_date ? new Date(dbRequest.delivery_date) : undefined,
    category: dbRequest.category,
    notes: dbRequest.notes,
    assignedTo: dbRequest.assigned_to,
    quoteDeadline: dbRequest.quote_deadline ? new Date(dbRequest.quote_deadline) : undefined,
    reminderSent: dbRequest.reminder_sent,
    items: dbItems.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit
    })),
    quotes: quotes
  };
};

// Fetch all requests
export const fetchAllRequests = async (): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      throw new Error(error.message);
    }

    // Map database requests to application requests
    const requests = await Promise.all(data.map(mapDbRequestToAppRequest));
    return requests;
  } catch (error) {
    console.error('Failed to fetch requests:', error);
    throw error;
  }
};

// Create a new request
export const createRequest = async (request: Omit<Request, 'id'>): Promise<Request> => {
  try {
    // Insert request
    const { data: newRequest, error: requestError } = await supabase
      .from('requests')
      .insert({
        title: request.title,
        status: request.status,
        due_date: request.dueDate.toISOString(),
        delivery_date: request.deliveryDate?.toISOString(),
        category: request.category,
        notes: request.notes,
        assigned_to: request.assignedTo,
        quote_deadline: request.quoteDeadline?.toISOString(),
        reminder_sent: request.reminderSent
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating request:', requestError);
      throw new Error(requestError.message);
    }

    // Insert request items
    const requestItems = request.items.map(item => ({
      request_id: newRequest.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit
    }));

    const { data: newItems, error: itemsError } = await supabase
      .from('request_items')
      .insert(requestItems)
      .select();

    if (itemsError) {
      console.error('Error creating request items:', itemsError);
      throw new Error(itemsError.message);
    }

    // Return the created request
    return {
      ...request,
      id: newRequest.id,
      items: newItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      })),
      quotes: []
    };
  } catch (error) {
    console.error('Failed to create request:', error);
    throw error;
  }
};

// Update request status
export const updateRequestStatus = async (id: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating request status:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to update request status:', error);
    throw error;
  }
};

// Seed initial data from static data if needed
export const seedInitialData = async (requests: Request[]): Promise<void> => {
  try {
    // Check if we already have data
    const { count, error: countError } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting requests:', countError);
      throw new Error(countError.message);
    }

    // If we already have data, don't seed
    if (count && count > 0) {
      console.log('Database already seeded with', count, 'requests');
      return;
    }

    console.log('Seeding initial data...');

    // Insert each request and its items
    for (const request of requests) {
      // Insert request
      const { data: newRequest, error: requestError } = await supabase
        .from('requests')
        .insert({
          id: request.id,
          title: request.title,
          status: request.status,
          due_date: request.dueDate.toISOString(),
          delivery_date: request.deliveryDate?.toISOString(),
          category: request.category,
          notes: request.notes,
          assigned_to: request.assignedTo,
          quote_deadline: request.quoteDeadline?.toISOString(),
          reminder_sent: request.reminderSent
        })
        .select()
        .single();

      if (requestError) {
        console.error('Error seeding request:', requestError);
        continue;
      }

      // Insert request items
      const requestItems = request.items.map(item => ({
        id: item.id,
        request_id: newRequest.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      }));

      const { error: itemsError } = await supabase
        .from('request_items')
        .insert(requestItems);

      if (itemsError) {
        console.error('Error seeding request items:', itemsError);
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Failed to seed data:', error);
    throw error;
  }
};
