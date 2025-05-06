import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { generateItemsFromSupplier } from '../quoteFormUtils';
import { ItemType } from '../ItemsList';
import { convertChefRequestToQuoteRequest, createQuoteRequest } from '@/services/quoteRequestsService';

interface UseQuoteFormProps {
  chefRequestData?: {
    title: string;
    items: {
      name: string;
      quantity: string | number;
      unit: string;
    }[];
    dueDate?: Date;
  };
  chefRequestId?: string;
}

export const useQuoteForm = ({ chefRequestData, chefRequestId }: UseQuoteFormProps = {}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState<string>(chefRequestData?.title || '');
  const [date, setDate] = useState<Date | undefined>(
    chefRequestData?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week from now
  );
  
  const [items, setItems] = useState<ItemType[]>(
    chefRequestData?.items?.map((item, index) => ({ 
      id: String(index + 1), 
      name: item.name, 
      quantity: String(item.quantity), 
      unit: item.unit 
    })) || [{ id: '1', name: '', quantity: '', unit: 'kg' }]
  );

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle supplier selection
  const handleSupplierChange = (supplierId: string, supplierName: string) => {
    setSelectedSupplierId(supplierId);
    setSelectedSupplierName(supplierName);
    
    // Only override items if not coming from chef request
    if (!chefRequestData) {
      setItems(generateItemsFromSupplier(supplierId));
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: String(Date.now()), name: '', quantity: '', unit: 'kg' }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof ItemType, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for this quote request.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (!selectedSupplierId) {
      toast({
        title: "Missing Information",
        description: "Please select a supplier.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Validate items
    const invalidItems = items.filter(item => !item.name.trim() || !item.quantity);
    if (invalidItems.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all item details.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // If this is from a chef request, convert it to a quote request
      if (chefRequestId) {
        await convertChefRequestToQuoteRequest(
          chefRequestId,
          selectedSupplierId,
          selectedSupplierName
        );
        sonnerToast.success("Chef request converted to quote request successfully");
      } else {
        // Otherwise, create a new quote request directly
        await createQuoteRequest(
          title,
          selectedSupplierId,
          selectedSupplierName,
          date || new Date(),
          "General", // Default category
          items
        );
        sonnerToast.success("Quote request submitted successfully");
      }

      // Redirect back to quotes page
      setTimeout(() => {
        navigate('/quotes');
      }, 1500);
    } catch (error) {
      console.error("Error submitting quote request:", error);
      sonnerToast.error("Failed to submit quote request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    items,
    setItems,
    selectedSupplierId,
    setSelectedSupplierId,
    isUrgent,
    setIsUrgent,
    notes,
    setNotes,
    isSubmitting,
    handleSupplierChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleSubmit
  };
};
