
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { SupplierProducts as SupplierProductsComponent } from '@/components/suppliers/SupplierProducts';
import { MultiProductSelector } from '@/components/suppliers/MultiProductSelector';
import { Supplier, Product } from '@/components/suppliers/SupplierList';
import { sampleSuppliers } from './Suppliers';
import { toast } from 'sonner';

const SupplierProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the supplier with the matching ID
  const supplierIndex = sampleSuppliers.findIndex(s => s.id === id);
  const supplier = sampleSuppliers[supplierIndex];
  
  const [products, setProducts] = useState<Product[]>(supplier?.products || []);
  
  if (!supplier) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <SidebarToggle />
            <div className="p-6 md:p-8">
              <Button variant="outline" onClick={() => navigate('/suppliers')} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Suppliers
              </Button>
              <div className="text-center p-12">
                <h2 className="text-2xl font-bold mb-2">Supplier Not Found</h2>
                <p className="text-gray-500">The supplier you're looking for doesn't exist or has been removed.</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const handleAddProducts = (newProducts: Product[]) => {
    // Update the local state
    setProducts([...products, ...newProducts]);
    
    // In a real app, this would be an API call
    // For now, we'll update the sampleSuppliers array directly
    sampleSuppliers[supplierIndex].products = [...products, ...newProducts];
    
    toast.success(`Added ${newProducts.length} product${newProducts.length !== 1 ? 's' : ''} to ${supplier.name}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <Button variant="outline" onClick={() => navigate(`/suppliers/${id}`)} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Supplier Details
            </Button>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-navy">Manage Products</h1>
                <p className="text-dark-gray">{supplier.name}</p>
              </div>
            </div>
            
            <MultiProductSelector 
              existingProducts={products}
              onAddProducts={handleAddProducts}
            />
            
            <SupplierProductsComponent products={products} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SupplierProducts;
