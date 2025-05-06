
import React, { useState, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { productDatabase, getUniqueCategories } from '@/data/productDatabase';

// Import our new components
import ProductTable from '@/components/products/ProductTable';
import CategoryFilter from '@/components/products/CategoryFilter';
import ProductControls from '@/components/products/ProductControls';
import AddProductForm from '@/components/products/AddProductForm';
import AddUnitForm from '@/components/products/AddUnitForm';

const ProductDatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [products, setProducts] = useState(productDatabase);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const categories = useMemo(() => getUniqueCategories(), []);
  
  // Function to handle product list refresh
  const refreshProducts = () => {
    setProducts([...productDatabase]);
  };
  
  // Function to handle edit product
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setEditProductOpen(true);
  };
  
  // Filter products based on search term and selected category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === null || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-navy">Product Database</h1>
                <p className="text-dark-gray">Master list of products available in the system</p>
              </div>
              <ProductControls 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClick={() => setAddProductOpen(true)}
              />
            </div>
            
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Product Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductTable 
                  products={filteredProducts} 
                  onEditProduct={handleEditProduct} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialog for adding new product */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for the new product below.
            </DialogDescription>
          </DialogHeader>
          <AddProductForm 
            onSuccess={refreshProducts} 
            onClose={() => setAddProductOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing product units */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Unit to {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Select an additional unit of measurement for this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <AddUnitForm
              product={selectedProduct}
              onSuccess={refreshProducts}
              onClose={() => setEditProductOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ProductDatabasePage;
