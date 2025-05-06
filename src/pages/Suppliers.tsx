import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { SupplierList, Supplier } from '@/components/suppliers/SupplierList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample suppliers data for demonstration
export const sampleSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Farm Fresh Produce',
    category: 'Produce',
    contactPerson: 'Jane Smith',
    email: 'jane@farmfresh.com',
    phone: '(555) 123-4567',
    status: 'active',
    products: [
      { id: '101', name: 'Organic Apples', category: 'Fruits', unit: 'kg', defaultPrice: 3.99 },
      { id: '102', name: 'Carrots', category: 'Vegetables', unit: 'kg', defaultPrice: 2.49 },
      { id: '103', name: 'Lettuce', category: 'Vegetables', unit: 'each', defaultPrice: 1.99 },
      { id: '104', name: 'Tomatoes', category: 'Vegetables', unit: 'kg', defaultPrice: 4.29 }
    ]
  },
  {
    id: '2',
    name: 'Seafood Suppliers Inc.',
    category: 'Seafood',
    contactPerson: 'Mike Johnson',
    email: 'mike@seafoodsup.com',
    phone: '(555) 234-5678',
    status: 'active',
    products: [
      { id: '201', name: 'Fresh Salmon', category: 'Fish', unit: 'kg', defaultPrice: 19.99 },
      { id: '202', name: 'Shrimp', category: 'Shellfish', unit: 'kg', defaultPrice: 24.99 },
      { id: '203', name: 'Cod Fillets', category: 'Fish', unit: 'kg', defaultPrice: 15.49 }
    ]
  },
  {
    id: '3',
    name: 'Quality Meats',
    category: 'Meat',
    contactPerson: 'Robert Williams',
    email: 'robert@qualitymeats.com',
    phone: '(555) 345-6789',
    status: 'inactive',
    products: [
      { id: '301', name: 'Beef Sirloin', category: 'Beef', unit: 'kg', defaultPrice: 18.99 },
      { id: '302', name: 'Chicken Breast', category: 'Poultry', unit: 'kg', defaultPrice: 9.99 },
      { id: '303', name: 'Pork Chops', category: 'Pork', unit: 'kg', defaultPrice: 12.49 },
      { id: '304', name: 'Ground Beef', category: 'Beef', unit: 'kg', defaultPrice: 11.99 }
    ]
  },
  {
    id: '4',
    name: 'Organic Dairy Co.',
    category: 'Dairy',
    contactPerson: 'Sarah Brown',
    email: 'sarah@organicdairy.com',
    phone: '(555) 456-7890',
    status: 'active',
    products: [
      { id: '401', name: 'Organic Milk', category: 'Milk', unit: 'liter', defaultPrice: 3.79 },
      { id: '402', name: 'Cheese', category: 'Cheese', unit: 'kg', defaultPrice: 14.99 },
      { id: '403', name: 'Yogurt', category: 'Yogurt', unit: 'kg', defaultPrice: 6.49 }
    ]
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
