
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { QuoteRequestCard } from './QuoteRequestCard';

interface QuoteRequest {
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

interface QuoteRequestsListProps {
  quotes: QuoteRequest[];
}

export const QuoteRequestsList = ({ quotes }: QuoteRequestsListProps) => {
  const [updatedQuotes, setUpdatedQuotes] = useState<QuoteRequest[]>(quotes);
  
  React.useEffect(() => {
    setUpdatedQuotes(quotes);
  }, [quotes]);
  
  const handleStatusChange = (id: string, newStatus: string) => {
    setUpdatedQuotes(currentQuotes => 
      currentQuotes.map(quote => 
        quote.id === id ? { ...quote, status: newStatus } : quote
      )
    );
  };

  if (updatedQuotes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No quote requests found</p>
          <p className="text-sm text-gray-400">Create a new request or check your search filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-280px)]">
      <div className="space-y-4">
        {updatedQuotes.map(quote => (
          <QuoteRequestCard 
            key={quote.id} 
            request={quote} 
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
