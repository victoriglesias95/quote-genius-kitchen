
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { SupplierProducts } from '@/components/suppliers/SupplierProducts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Supplier } from '@/components/suppliers/SupplierList';
import { Badge } from '@/components/ui/badge';

// Import sample suppliers data
// This is a simplified example - in a real app, you'd fetch this data from an API
import { sampleSuppliers } from './Suppliers';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the supplier with the matching ID
  const supplier = sampleSuppliers.find(s => s.id === id);
  
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
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-navy">{supplier.name}</h1>
                  <Badge variant={supplier.status === 'active' ? 'default' : 'outline'} className={supplier.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
                    {supplier.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-dark-gray">{supplier.category}</p>
              </div>
              <Button onClick={() => navigate(`/suppliers/${id}/edit`)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Supplier
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{supplier.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{supplier.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{supplier.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-xl font-semibold">Products</h2>
                  <p className="text-sm text-gray-500">Total: {supplier.products.length} products</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-24 mb-4 bg-gray-50 rounded-md">
                    <Package className="h-8 w-8 text-gray-400 mr-3" />
                    <div className="text-center">
                      <p className="font-medium">Default Products</p>
                      <p className="text-sm text-gray-500">Products this supplier typically provides</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <SupplierProducts products={supplier.products} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SupplierDetail;
