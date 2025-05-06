
import React from 'react';
import { CardDescription } from '@/components/ui/card';

interface QuoteFormHeaderProps {
  chefRequestId?: string;
}

export const QuoteFormHeader: React.FC<QuoteFormHeaderProps> = ({ chefRequestId }) => {
  return (
    <CardDescription>
      {chefRequestId ? 
        'Create a supplier quote request based on the chef\'s requirements' : 
        'Request quotes for ingredients or supplies from your suppliers'
      }
    </CardDescription>
  );
};
