
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuoteForm } from './hooks/useQuoteForm';
import { QuoteFormHeader } from './form/QuoteFormHeader';
import { FormBasicFields } from './form/FormBasicFields';
import { FormItemsSection } from './form/FormItemsSection';
import { FormActionButtons } from './form/FormActionButtons';
import { QuoteFormInfoCard } from './form/QuoteFormInfoCard';

interface QuoteFormProps {
  chefRequestId?: string;
  chefRequestData?: {
    title: string;
    items: {
      name: string;
      quantity: string | number;
      unit: string;
    }[];
    dueDate?: Date;
  };
}

export function QuoteForm({ chefRequestId, chefRequestData }: QuoteFormProps) {
  const {
    title,
    setTitle,
    date,
    setDate,
    items,
    selectedSupplierId,
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
  } = useQuoteForm({ chefRequestData, chefRequestId });

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{chefRequestId ? 'Convert Chef Request to Quote' : 'New Quote Request'}</CardTitle>
          <QuoteFormHeader chefRequestId={chefRequestId} />
        </CardHeader>
        <CardContent className="space-y-6">
          <QuoteFormInfoCard />
          
          <FormBasicFields
            title={title}
            setTitle={setTitle}
            date={date}
            setDate={setDate}
            selectedSupplierId={selectedSupplierId}
            onSupplierChange={handleSupplierChange}
            isUrgent={isUrgent}
            setIsUrgent={setIsUrgent}
            notes={notes}
            setNotes={setNotes}
          />
          
          <FormItemsSection 
            items={items}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={handleItemChange}
          />
        </CardContent>
        
        <FormActionButtons isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}
