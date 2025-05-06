
import React, { useState, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  productDatabase, 
  getUniqueCategories, 
  addProductToDatabase, 
  getAvailableUnits,
  updateProductInDatabase,
  addUnitToProduct
} from '@/data/productDatabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';

// Define the form schema for new product
const productFormSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  units: z.array(z.string()).min(1, { message: "Please select at least one unit." }),
});

// Define the form schema for adding units to existing product
const unitFormSchema = z.object({
  unit: z.string().min(1, { message: "Please select a unit." }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
type UnitFormValues = z.infer<typeof unitFormSchema>;

const ProductDatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [products, setProducts] = useState(productDatabase);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const categories = useMemo(() => getUniqueCategories(), []);
  const availableUnits = useMemo(() => getAvailableUnits(), []);
  
  // Form setup for new product
  const addProductForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      units: [],
    },
  });

  // Form setup for editing product units
  const editUnitForm = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      unit: "",
    },
  });

  // Handle new product form submission
  const onSubmitAddProduct = (data: ProductFormValues) => {
    const newProduct = addProductToDatabase(data.name, data.category, data.units);
    setProducts([...productDatabase]); // Update local state with the updated database
    toast({
      title: "Product Added",
      description: `${data.name} has been added to the product database.`,
    });
    addProductForm.reset(); // Reset form fields
    setAddProductOpen(false); // Close dialog
  };
  
  // Handle adding unit to existing product
  const onSubmitAddUnit = (data: UnitFormValues) => {
    if (!selectedProduct) return;
    
    const updatedProduct = addUnitToProduct(selectedProduct.id, data.unit);
    if (updatedProduct) {
      setProducts([...productDatabase]); // Update local state
      toast({
        title: "Unit Added",
        description: `${data.unit} has been added to ${updatedProduct.name}.`,
      });
      editUnitForm.reset(); // Reset form fields
      setEditProductOpen(false); // Close dialog
    }
  };
  
  // Open edit dialog for a product
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    editUnitForm.reset();
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
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
                <div className="w-full md:w-72">
                  <Label htmlFor="search" className="sr-only">Search Products</Label>
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new product below.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...addProductForm}>
                      <form onSubmit={addProductForm.handleSubmit(onSubmitAddProduct)} className="space-y-4">
                        <FormField
                          control={addProductForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter product name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addProductForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addProductForm.control}
                          name="units"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel className="text-base">Units</FormLabel>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {availableUnits.map((unit) => (
                                  <FormField
                                    key={unit}
                                    control={addProductForm.control}
                                    name="units"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={unit}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(unit)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, unit])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== unit
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            {unit}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Add Product</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Badge>
              
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {product.units.map((unit, idx) => (
                                <Badge key={`${product.id}-${unit}-${idx}`} variant="outline">{unit}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{product.id}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Add Unit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No products found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialog for editing product units */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Unit to {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Select an additional unit of measurement for this product.
            </DialogDescription>
          </DialogHeader>
          <Form {...editUnitForm}>
            <form onSubmit={editUnitForm.handleSubmit(onSubmitAddUnit)} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm font-medium">Current Units:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProduct?.units?.map((unit: string, idx: number) => (
                    <Badge key={`current-${idx}`} variant="outline">{unit}</Badge>
                  ))}
                </div>
              </div>
              <FormField
                control={editUnitForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Unit</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUnits
                          .filter(unit => !selectedProduct?.units?.includes(unit))
                          .map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add Unit</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ProductDatabasePage;
