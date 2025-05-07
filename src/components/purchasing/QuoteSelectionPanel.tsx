
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { SupplierOrderMapping } from './SupplierOrderMapping';
import { OrderCoverageSummary } from './OrderCoverageSummary';
import { MissingItemsPanel } from './MissingItemsPanel';
import { SelectedQuoteItem } from '@/services/purchasingService';
import { Request } from '@/components/chef/requests/types';

interface QuoteSelectionPanelProps {
  selectedItems: SelectedQuoteItem[];
  chefRequests: Request[];
  manuallySelectedItems: Record<string, boolean>;
  missingItems: any[];
  validationIssues: string[];
  onUpdateItemQuantity: (item: SelectedQuoteItem, newQuantity: number) => void;
  onAddManualItem: (item: SelectedQuoteItem) => void;
  onAddMissingItem: (item: any, supplierId: string) => void;
  onSkipItem: (item: any, reason: string) => void;
}

export function QuoteSelectionPanel({
  selectedItems,
  chefRequests,
  manuallySelectedItems,
  missingItems,
  validationIssues,
  onUpdateItemQuantity,
  onAddManualItem,
  onAddMissingItem,
  onSkipItem
}: QuoteSelectionPanelProps) {
  return (
    <Card className="shadow-md">
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-2">
          <TabsTrigger value="summary" className="text-sm">Coverage Summary</TabsTrigger>
          <TabsTrigger value="missing" className="text-sm">
            Missing Items
            {missingItems.length > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                {missingItems.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-sm">Supplier Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          <CardContent className="pt-2">
            <OrderCoverageSummary 
              selectedItems={selectedItems} 
              chefRequests={chefRequests}
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="missing" className="mt-0">
          <CardContent className="pt-2">
            <MissingItemsPanel
              missingItems={missingItems}
              onAddMissingItem={onAddMissingItem}
              onSkipItem={onSkipItem}
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-0">
          <CardContent className="pt-2">
            {validationIssues.length > 0 && (
              <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Data Validation Issues</AlertTitle>
                <AlertDescription>
                  <div className="max-h-28 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-1">
                      {validationIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <SupplierOrderMapping 
              selectedItems={selectedItems} 
              manuallySelectedItems={manuallySelectedItems}
              onUpdateItemQuantity={onUpdateItemQuantity}
              onAddManualItem={onAddManualItem}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
