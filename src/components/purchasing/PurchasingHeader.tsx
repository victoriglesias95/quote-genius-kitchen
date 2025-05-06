
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function PurchasingHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/quotes')}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-navy">Purchasing Assistant</h1>
      </div>
      <p className="text-dark-gray">
        Optimize your orders by analyzing supplier selections and ensuring all requested items are covered
      </p>
    </div>
  );
}
