
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MissingItem } from '@/services/purchasingService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, CheckCircle, AlertTriangle, ShoppingCart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

interface MissingItemsPanelProps {
  missingItems: MissingItem[];
  onAddMissingItem: (item: MissingItem, supplierId: string) => void;
  onSkipItem: (item: MissingItem, reason: string) => void;
}

export function MissingItemsPanel({ 
  missingItems, 
  onAddMissingItem,
  onSkipItem 
}: MissingItemsPanelProps) {
  const [skipReasons, setSkipReasons] = useState<Record<string, string>>({});
  
  // Find items with no supplier quotes
  const noQuoteItems = missingItems.filter(item => item.quotedBy.length === 0);
  
  // Find items with available quotes
  const itemsWithQuotes = missingItems.filter(item => item.quotedBy.length > 0);

  // Handle setting skip reason
  const handleReasonChange = (itemKey: string, reason: string) => {
    setSkipReasons(prev => ({
      ...prev,
      [itemKey]: reason
    }));
  };
  
  if (missingItems.length === 0) {
    return (
      <Alert className="bg-green-50 text-green-800 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>All Items Covered</AlertTitle>
        <AlertDescription>
          All items from chef requests are covered in the selected quotes.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50 rounded-t-lg border-b border-red-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-xl font-semibold text-red-700">Missing Items Alert</CardTitle>
        </div>
        <CardDescription className="text-red-600">
          {missingItems.length} item{missingItems.length !== 1 ? 's' : ''} from chef requests {missingItems.length !== 1 ? 'are' : 'is'} not included in the current selection
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <Accordion type="multiple" className="w-full">
          {noQuoteItems.length > 0 && (
            <AccordionItem value="no-quotes">
              <AccordionTrigger className="text-red-600 font-medium">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  <span>{noQuoteItems.length} items with no supplier quotes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  {noQuoteItems.map((item) => (
                    <div key={`no-quote-${item.name}-${item.requestId}`} className="border border-red-100 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.name}</h3>
                            <Badge variant="outline" className="text-xs bg-red-100 border-red-200">
                              No Quotes
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.quantity} {item.unit} - Required for: {item.requestTitle}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Textarea 
                          placeholder="Enter reason for skipping this item..."
                          className="mb-2 border-red-200"
                          value={skipReasons[`${item.name}-${item.requestId}`] || ''}
                          onChange={(e) => handleReasonChange(`${item.name}-${item.requestId}`, e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const reason = skipReasons[`${item.name}-${item.requestId}`] || 'No supplier available';
                            onSkipItem(item, reason);
                            toast.info(`Skipped ${item.name}: ${reason}`);
                          }}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Skip Item (No Suppliers)
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {itemsWithQuotes.length > 0 && (
            <AccordionItem value="with-quotes">
              <AccordionTrigger className="text-amber-600 font-medium">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>{itemsWithQuotes.length} items with available quotes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  {itemsWithQuotes.map((item) => (
                    <MissingItemCard 
                      key={`${item.name}-${item.requestId}`} 
                      item={item} 
                      onAddQuote={(supplierId) => {
                        onAddMissingItem(item, supplierId);
                        toast.success(`Added ${item.name} from ${item.quotedBy.find(s => s.supplierId === supplierId)?.supplierName}`);
                      }}
                      onSkipItem={(reason) => {
                        onSkipItem(item, reason);
                        toast.info(`Skipped ${item.name}: ${reason}`);
                      }}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

interface MissingItemCardProps {
  item: MissingItem;
  onAddQuote: (supplierId: string) => void;
  onSkipItem: (reason: string) => void;
}

function MissingItemCard({ item, onAddQuote, onSkipItem }: MissingItemCardProps) {
  const [skipReason, setSkipReason] = useState('');
  
  // Find best price supplier
  const bestSupplier = React.useMemo(() => {
    return item.quotedBy.length > 0 
      ? item.quotedBy.reduce((best, current) => 
          current.price < best.price ? current : best, item.quotedBy[0])
      : null;
  }, [item]);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{item.name}</h3>
            <Badge variant="outline" className="text-xs">
              {item.requestTitle}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {item.quantity} {item.unit}
          </p>
        </div>
      </div>
      
      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="text-sm font-medium mb-2">Available quotes:</p>
        <div className="space-y-2">
          {item.quotedBy.map((supplier) => (
            <div 
              key={supplier.supplierId}
              className={`flex justify-between p-2 rounded ${
                bestSupplier && supplier.supplierId === bestSupplier.supplierId
                  ? "bg-green-50 border border-green-100"
                  : "bg-gray-50 border border-gray-100"
              }`}
            >
              <div>
                <span className="text-sm font-medium">{supplier.supplierName}</span>
                <span className="text-xs text-gray-600 ml-2">
                  ${supplier.price.toFixed(2)} per {item.unit}
                </span>
              </div>
              <div className="flex items-center">
                {bestSupplier && supplier.supplierId === bestSupplier.supplierId && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mr-2">Best Price</Badge>
                )}
                <Button 
                  size="sm"
                  variant="ghost" 
                  className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => onAddQuote(supplier.supplierId)}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3">
          <Textarea 
            placeholder="Enter reason for skipping this item..."
            className="mb-2"
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onSkipItem(skipReason || 'Item not required')}
          >
            <X className="mr-1 h-4 w-4" />
            Skip Item
          </Button>
        </div>
      </div>
    </div>
  );
}
