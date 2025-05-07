
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { PurchasingHeader } from '@/components/purchasing/PurchasingHeader';
import { QuoteSelectionPanel } from '@/components/purchasing/QuoteSelectionPanel';
import { OrderPreviewModal } from '@/components/purchasing/OrderPreviewModal';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePurchasingFlow } from '@/hooks/usePurchasingFlow';

const PurchasingAssistant = () => {
  const navigate = useNavigate();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  
  // Use the custom hook to manage purchasing flow state and logic
  const {
    selectedItems,
    manuallySelectedItems,
    skippedItems,
    specialInstructions,
    supplierGroups,
    missingItems,
    isLoading,
    validationIssues,
    handleAddManualItem,
    handleUpdateItemQuantity,
    handleSkipMissingItem,
    handleAddMissingItem,
    handleUpdateInstructions,
    placeOrder,
    isPlacingOrder,
    hasError,
    // Additional data needed for child components
    chefRequests = []
  } = usePurchasingFlow();
  
  // Handler for opening the order dialog
  const handlePlaceOrders = () => {
    setIsOrderDialogOpen(true);
  };
  
  // Handler for confirming and placing orders
  const handleConfirmOrders = () => {
    placeOrder(selectedItems);
    // Navigate on successful order placement
    // We handle this in a setTimeout to allow the success toast to appear first
    setTimeout(() => {
      if (!hasError) {
        setIsOrderDialogOpen(false);
        navigate('/quotes');
      }
    }, 1500);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Header with action button */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <PurchasingHeader />
              
              <Button 
                onClick={handlePlaceOrders}
                disabled={selectedItems.length === 0}
                size="lg"
                className="ml-auto"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Review & Place Orders
              </Button>
            </div>
            
            {/* Main content area */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Selection panel with tabs */}
                <QuoteSelectionPanel 
                  selectedItems={selectedItems}
                  chefRequests={chefRequests}
                  manuallySelectedItems={manuallySelectedItems}
                  missingItems={missingItems}
                  validationIssues={validationIssues}
                  onUpdateItemQuantity={handleUpdateItemQuantity}
                  onAddManualItem={handleAddManualItem}
                  onAddMissingItem={handleAddMissingItem}
                  onSkipItem={handleSkipMissingItem}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order confirmation modal */}
      <OrderPreviewModal 
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
        onConfirm={handleConfirmOrders}
        supplierGroups={supplierGroups}
        selectedItems={selectedItems}
        manuallySelectedItems={manuallySelectedItems}
        validationIssues={validationIssues}
        skippedItems={skippedItems}
        specialInstructions={specialInstructions}
        onUpdateInstructions={handleUpdateInstructions}
        isPlacingOrder={isPlacingOrder}
      />
    </SidebarProvider>
  );
};

export default PurchasingAssistant;
