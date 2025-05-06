import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Plus, Trash, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Supplier, Product } from '@/components/suppliers/SupplierList';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productDatabase, getUniqueCategories, ProductDatabase } from '@/data/productDatabase';

// Import sample suppliers data and update function
import { sampleSuppliers } from './Suppliers';

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the supplier with the matching ID
  const supplierIndex = sampleSuppliers.findIndex(s => s.id === id);
  const supplier = sampleSuppliers[supplierIndex];
  
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = React.useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = React.useState(false);
  const [currentProduct, setCurrentProduct] = React.useState<Product | null>(null);
  const [products, setProducts] = React.useState<Product[]>(supplier?.products || []);

  // State for product selection
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [filteredProducts, setFilteredProducts] = React.useState<ProductDatabase[]>(productDatabase);
  
  // Get unique categories for the dropdown
  const categories = getUniqueCategories();

  // Create validation schema for supplier form
  const supplierSchema = z.object({
    name: z.string().min(1, "Supplier name is required"),
    category: z.string().min(1, "Category is required"),
    contactPerson: z.string().min(1, "Contact person is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    status: z.enum(["active", "inactive"])
  });

  // Create validation schema for product form (now only needs price)
  const productSchema = z.object({
    productId: z.string().min(1, "Please select a product"),
    defaultPrice: z.coerce.number().min(0, "Price must be a positive number").optional()
  });

  // Set up form for supplier details
  const supplierForm = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier ? {
      name: supplier.name,
      category: supplier.category,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      status: supplier.status
    } : {
      name: "",
      category: "",
      contactPerson: "",
      email: "",
      phone: "",
      status: "active" 
    }
  });

  // Set up form for product details
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productId: "",
      defaultPrice: undefined
    }
  });

  // Set up form for editing product price
  const editProductForm = useForm<{ defaultPrice: number | undefined }>({
    defaultValues: {
      defaultPrice: undefined
    }
  });

  React.useEffect(() => {
    // Filter products based on category and search query
    let filtered = productDatabase;
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery]);

  if (!supplier && id !== 'new') {
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

  const handleAddProduct = (data: z.infer<typeof productSchema>) => {
    // Find the selected product in our database
    const selectedProduct = productDatabase.find(p => p.id === data.productId);
    
    if (!selectedProduct) {
      toast.error('Product not found in database');
      return;
    }
    
    // Check if product is already in supplier's list
    const existingProduct = products.find(p => p.name === selectedProduct.name);
    if (existingProduct) {
      toast.error('This product is already in the supplier\'s list');
      return;
    }
    
    // Create a new product with required fields to match Product type
    const newProduct: Product = {
      id: `${supplier?.id || 'new'}-${Date.now()}`, // In a real app, this would be generated by the backend
      name: selectedProduct.name,
      category: selectedProduct.category,
      units: selectedProduct.units, // Use the units array from the selected product
      defaultPrice: data.defaultPrice
    };
    
    setProducts([...products, newProduct]);
    setIsAddProductDialogOpen(false);
    productForm.reset();
    toast.success('Product added successfully');
  };

  const handleEditProduct = (data: { defaultPrice: number | undefined }) => {
    if (!currentProduct) return;
    
    const updatedProducts = products.map(p => 
      p.id === currentProduct.id ? { 
        ...p,
        defaultPrice: data.defaultPrice
      } : p
    );
    
    setProducts(updatedProducts);
    setIsEditProductDialogOpen(false);
    setCurrentProduct(null);
    toast.success('Product price updated successfully');
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast.success('Product removed successfully');
  };

  const openEditProductDialog = (product: Product) => {
    setCurrentProduct(product);
    editProductForm.reset({
      defaultPrice: product.defaultPrice
    });
    setIsEditProductDialogOpen(true);
  };

  const handleSupplierSubmit = (data: z.infer<typeof supplierSchema>) => {
    // In a real app, this would be an API call to update the supplier
    const isNewSupplier = id === 'new';
    const newSupplierId = isNewSupplier ? `${Date.now()}` : id;
    
    if (isNewSupplier) {
      // Add new supplier - ensure all required fields are included
      const newSupplier: Supplier = {
        id: newSupplierId,
        name: data.name,
        category: data.category,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        status: data.status,
        products: products.map(p => ({
          ...p,
          id: p.id.startsWith('new') ? `${newSupplierId}-${Date.now()}-${p.name}` : p.id
        }))
      };
      
      sampleSuppliers.push(newSupplier);
      toast.success('Supplier created successfully');
    } else if (supplierIndex !== -1) {
      // Update existing supplier
      sampleSuppliers[supplierIndex] = {
        ...sampleSuppliers[supplierIndex],
        ...data,
        products
      };
      toast.success('Supplier updated successfully');
    }
    
    navigate(`/suppliers/${newSupplierId}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <Button variant="outline" onClick={() => navigate(id === 'new' ? '/suppliers' : `/suppliers/${id}`)} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {id === 'new' ? 'Back to Suppliers' : 'Back to Supplier Details'}
            </Button>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-navy">
                  {id === 'new' ? 'Add New Supplier' : 'Edit Supplier'}
                </h1>
                <p className="text-dark-gray">
                  {id === 'new' ? 'Create a new supplier' : 'Update supplier information and products'}
                </p>
              </div>
              <Button onClick={supplierForm.handleSubmit(handleSupplierSubmit)} className="gap-2">
                <Save className="h-4 w-4" />
                {id === 'new' ? 'Create Supplier' : 'Save Changes'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Supplier Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...supplierForm}>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={supplierForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter supplier name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Produce, Seafood, Meat" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter contact name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="email@example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(555) 123-4567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={supplierForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-7">
                            <FormControl>
                              <Checkbox 
                                checked={field.value === "active"}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? "active" : "inactive");
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Active Supplier
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Default Products</CardTitle>
                <Button onClick={() => setIsAddProductDialogOpen(true)} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Units</th>
                        <th className="text-right p-4 font-medium">Default Price</th>
                        <th className="p-4 w-[100px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? (
                        products.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">{product.name}</td>
                            <td className="p-4">{product.category}</td>
                            <td className="p-4">{product.units.join(', ')}</td>
                            <td className="p-4 text-right">{product.defaultPrice ? `$${product.defaultPrice.toFixed(2)}` : 'N/A'}</td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => openEditProductDialog(product)}
                                >
                                  <span className="sr-only">Edit</span>
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                    <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                  </svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-destructive" 
                                  onClick={() => handleRemoveProduct(product.id)}
                                >
                                  <span className="sr-only">Remove</span>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-500">
                            No products available. Click "Add Product" to add one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Add Product Dialog */}
            <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Product from Database</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Search and filter */}
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Product list */}
                  <div className="max-h-[300px] overflow-y-auto border rounded-md">
                    {filteredProducts.length > 0 ? (
                      <div className="divide-y">
                        {filteredProducts.map(product => (
                          <div 
                            key={product.id}
                            className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                            onClick={() => productForm.setValue('productId', product.id)}
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.category} • {product.units.join(', ')}
                              </p>
                            </div>
                            <Checkbox 
                              checked={productForm.getValues('productId') === product.id}
                              onCheckedChange={() => productForm.setValue('productId', product.id)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No products found matching your criteria
                      </div>
                    )}
                  </div>
                  
                  {/* Price field */}
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(handleAddProduct)}>
                      <FormField
                        control={productForm.control}
                        name="defaultPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Price for this Supplier (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                {...field} 
                                value={field.value === undefined ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                placeholder="0.00" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {productForm.formState.errors.productId && (
                        <p className="text-sm font-medium text-destructive mt-2">
                          {productForm.formState.errors.productId.message}
                        </p>
                      )}
                      
                      <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Product</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Edit Product Dialog */}
            <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Product Price</DialogTitle>
                </DialogHeader>
                {currentProduct && (
                  <div className="py-4">
                    <div className="mb-4">
                      <h3 className="font-semibold">{currentProduct.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentProduct.category} • {currentProduct.units.join(', ')}
                      </p>
                    </div>
                    
                    <form onSubmit={editProductForm.handleSubmit(handleEditProduct)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Default Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={editProductForm.watch('defaultPrice') === undefined ? '' : editProductForm.watch('defaultPrice')}
                          onChange={e => editProductForm.setValue('defaultPrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditProductDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Update Price</Button>
                      </DialogFooter>
                    </form>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EditSupplier;
