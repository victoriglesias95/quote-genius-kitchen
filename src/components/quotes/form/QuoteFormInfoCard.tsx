
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export const QuoteFormInfoCard: React.FC = () => {
  return (
    <Card className="mb-6 bg-blue-50 border-blue-100">
      <CardContent className="p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">What happens when you submit a request?</p>
          <p className="mt-1">When you submit a quote request:</p>
          <ol className="list-decimal ml-5 mt-1 space-y-1">
            <li>The request is sent to your selected suppliers</li>
            <li>Suppliers can view and respond with quotes</li>
            <li>You'll receive notifications when quotes arrive</li>
            <li>You can compare quotes and make selections in the Requests section</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
