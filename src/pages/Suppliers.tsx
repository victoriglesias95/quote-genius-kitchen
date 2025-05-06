
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { SupplierList } from '@/components/suppliers/SupplierList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample suppliers data for demonstration
const sampleSuppliers = [
  {
    id: '1',
    name: 'Farm Fresh Produce',
    category: 'Produce',
    contactPerson: 'Jane Smith',
    email: 'jane@farmfresh.com',
    phone: '(555) 123-4567',
    status: 'active' as const
  },
  {
    id: '2',
    name: 'Seafood Suppliers Inc.',
    category: 'Seafood',
    contactPerson: 'Mike Johnson',
    email: 'mike@seafoodsup.com',
    phone: '(555) 234-5678',
    status: 'active' as const
  },
  {
    id: '3',
    name: 'Quality Meats',
    category: 'Meat',
    contactPerson: 'Robert Williams',
    email: 'robert@qualitymeats.com',
    phone: '(555) 345-6789',
    status: 'inactive' as const
  },
  {
    id: '4',
    name: 'Organic Dairy Co.',
    category: 'Dairy',
    contactPerson: 'Sarah Brown',
    email: 'sarah@organicdairy.com',
    phone: '(555) 456-7890',
    status: 'active' as const
  }
];

const Suppliers = () => {
  const navigate = useNavigate();
  
  const handleViewSupplier = (id: string) => {
    navigate(`/suppliers/${id}`);
  };
  
  const handleEditSupplier = (id: string) => {
    navigate(`/suppliers/${id}/edit`);
  };
  
  const handleAddSupplier = () => {
    navigate('/suppliers/new');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-navy">Suppliers</h1>
                <p className="text-dark-gray">Manage your supplier relationships</p>
              </div>
              <Button onClick={handleAddSupplier} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Supplier
              </Button>
            </div>
            
            <SupplierList 
              suppliers={sampleSuppliers}
              onView={handleViewSupplier}
              onEdit={handleEditSupplier}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Suppliers;
