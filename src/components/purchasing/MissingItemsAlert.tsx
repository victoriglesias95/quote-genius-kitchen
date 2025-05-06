
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelectedQuoteItem, findMissingItems, MissingItem } from '@/services/purchasingService';
import { Request } from '@/components/chef/requests/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, CheckCircle, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MissingItemsAlertProps {
  selectedItems: SelectedQuoteItem[];
  chefRequests: Request[];
  onAddMissingItem?: (item: MissingItem, supplierId: string) => void;
}

export function MissingItemsAlert({ 
  selectedItems, 
  chefRequests,
  onAddMissingItem 
}: MissingItemsAlertProps) {
  // State to track which missing items have been handled
  const [handledItems, setHandledItems] = useState<Set<string>>(new Set());
  
  // Find items from chef requests that are missing in selected quotes
  const missingItems = useMemo(() => {
    return findMissingItems(selectedItems, chefRequests);
  }, [selectedItems, chefRequests]);
  
  // Filtered missing items (exclude handled ones)
  const filteredMissingItems = missingItems.filter(
    item => !handledItems.has(`${item.name}-${item.requestId}`)
  );
  
  if (missingItems.length === 0 || filteredMissingItems.length === 0) {
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
          {filteredMissingItems.length} item{filteredMissingItems.length !== 1 ? 's' : ''} from chef requests {filteredMissingItems.length !== 1 ? 'are' : 'is'} not included in the current selection
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {filteredMissingItems.map((item) => (
          <MissingItemCard 
            key={`${item.name}-${item.requestId}`} 
            item={item} 
            onAddQuote={(supplierId) => {
              if (onAddMissingItem) {
                onAddMissingItem(item, supplierId);
              }
              
              // Mark item as handled
              setHandledItems(prev => {
                const updated = new Set(prev);
                updated.add(`${item.name}-${item.requestId}`);
                return updated;
              });
              
              toast.success(`Added ${item.name} from ${item.quotedBy.find(s => s.supplierId === supplierId)?.supplierName}`);
            }}
            onSkipItem={() => {
              // Mark item as handled
              setHandledItems(prev => {
                const updated = new Set(prev);
                updated.add(`${item.name}-${item.requestId}`);
                return updated;
              });
              
              toast.info(`Skipped ${item.name}`);
            }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface MissingItemCardProps {
  item: MissingItem;
  onAddQuote: (supplierId: string) => void;
  onSkipItem: () => void;
}

function MissingItemCard({ item, onAddQuote, onSkipItem }: MissingItemCardProps) {
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
              {bestSupplier && supplier.supplierId === bestSupplier.supplierId && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Best Price</Badge>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex gap-2">
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => bestSupplier && onAddQuote(bestSupplier.supplierId)}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            Add Best Quote
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onSkipItem}
          >
            <X className="mr-1 h-4 w-4" />
            Skip Item
          </Button>
        </div>
      </div>
    </div>
  );
}
