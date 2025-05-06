
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import ChefLayout from '@/components/layout/ChefLayout';
import { Search, Filter, Clock, Plus, Check, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUniqueCategories, getProductsByCategory } from '@/data/productDatabase';
import { InventoryItem } from '@/components/inventory/types';

// Define the type for request items
interface RequestItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  stockStatus: string;
  stockValue?: string | number; // Making stockValue optional
}

// Sample request data
const sampleRequests = [
  {
    id: 'req-1',
    title: 'Weekly Produce Order',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    category: 'produce',
    items: [
      { id: 'item-1', name: 'Tomatoes', quantity: 10, unit: 'kg' },
      { id: 'item-2', name: 'Lettuce', quantity: 15, unit: 'heads' },
      { id: 'item-3', name: 'Carrots', quantity: 8, unit: 'kg' }
    ]
  },
  {
    id: 'req-2',
    title: 'Meat Stock',
    status: 'approved',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    category: 'meat',
    items: [
      { id: 'item-4', name: 'Beef Sirloin', quantity: 20, unit: 'kg' },
      { id: 'item-5', name: 'Chicken Breast', quantity: 15, unit: 'kg' }
    ]
  },
  {
    id: 'req-3',
    title: 'Dairy Products',
    status: 'completed',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    category: 'dairy',
    items: [
      { id: 'item-6', name: 'Milk', quantity: 20, unit: 'liters' },
      { id: 'item-7', name: 'Cheese', quantity: 5, unit: 'kg' },
      { id: 'item-8', name: 'Yogurt', quantity: 30, unit: 'cups' }
    ]
  },
  {
    id: 'req-4',
    title: 'Dry Goods',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    category: 'dry goods',
    items: [
      { id: 'item-9', name: 'Rice', quantity: 25, unit: 'kg' },
      { id: 'item-10', name: 'Flour', quantity: 15, unit: 'kg' },
      { id: 'item-11', name: 'Sugar', quantity: 10, unit: 'kg' }
    ]
  },
  {
    id: 'req-5',
    title: 'Special Ingredients',
    status: 'rejected',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    category: 'specialty',
    items: [
      { id: 'item-12', name: 'Saffron', quantity: 100, unit: 'g' },
      { id: 'item-13', name: 'Truffle Oil', quantity: 5, unit: 'bottles' }
    ]
  }
];

// Add delivered requests
const deliveredRequests = [
  {
    id: 'req-6',
    title: 'Weekly Seafood Order',
    status: 'delivered',
    deliveryDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)),
    category: 'seafood',
    items: [
      { id: 'item-14', name: 'Salmon', quantity: 15, unit: 'kg' },
      { id: 'item-15', name: 'Shrimp', quantity: 7, unit: 'kg' }
    ]
  },
  {
    id: 'req-7',
    title: 'Monthly Dry Goods',
    status: 'delivered',
    deliveryDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    category: 'dry goods',
    items: [
      { id: 'item-16', name: 'Pasta', quantity: 25, unit: 'kg' },
      { id: 'item-17', name: 'Canned Tomatoes', quantity: 40, unit: 'cans' }
    ]
  }
];

// Combine all requests
const allRequests = [...sampleRequests, ...deliveredRequests];

// Add sample inventory data for products
const sampleInventory: InventoryItem[] = [
  { id: '1', name: 'Onions', category: 'Vegetables', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '2', name: 'Chicken Breast', category: 'Meat', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '3', name: 'Olive Oil', category: 'Oils', currentStock: 'High', unit: 'liter', counted: false },
  { id: '4', name: 'Salt', category: 'Spices', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '5', name: 'Flour', category: 'Dry Goods', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '6', name: 'Eggs', category: 'Dairy', currentStock: 'Low', unit: 'dozen', counted: false },
  { id: '7', name: 'Bell Peppers', category: 'Vegetables', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '8', name: 'Beef Sirloin', category: 'Beef', currentStock: 'Low', unit: 'kg', counted: false },
  { id: '9', name: 'Sugar', category: 'Dry Goods', currentStock: 'Medium', unit: 'kg', counted: false },
  { id: '10', name: 'Butter', category: 'Dairy', currentStock: 'Low', unit: 'kg', counted: false },
];

const RequestCard = ({ request }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewRequest = () => {
    setShowDetails(true);
  };

  // Format delivery info
  const getDeliveryInfo = () => {
    if (request.status === 'delivered' && request.deliveryDate) {
      return (
        <div className="flex items-center gap-1 text-xs text-emerald-600">
          <Check className="h-3 w-3" />
          <span>Delivered on {format(request.deliveryDate, 'MMM d, yyyy')}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-sm mb-3">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{request.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <Clock className="inline-block h-3 w-3 mr-1" />
                  Due: {format(request.dueDate, 'MMM d, yyyy')}
                </p>
                {getDeliveryInfo()}
              </div>
              {getStatusBadge(request.status)}
            </div>
            
            <div className="text-sm">
              <p className="text-gray-500">{request.items.length} items</p>
              <ul className="mt-1 text-gray-700">
                {request.items.slice(0, 2).map(item => (
                  <li key={item.id} className="text-xs">• {item.name} ({item.quantity} {item.unit})</li>
                ))}
                {request.items.length > 2 && (
                  <li className="text-xs text-gray-500">• and {request.items.length - 2} more...</li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleViewRequest}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{request.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {getStatusBadge(request.status)}
              <span className="text-xs text-gray-500">
                Requested for: {format(request.dueDate, 'MMM d, yyyy')}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {request.status === 'delivered' && (
              <div className="bg-teal-50 p-3 rounded-md text-sm flex items-center gap-2">
                <Check className="h-4 w-4 text-teal-600" />
                <span>Delivered on {format(request.deliveryDate, 'MMM d, yyyy')}</span>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-2">Items</h4>
              <ul className="space-y-2">
                {request.items.map(item => (
                  <li key={item.id} className="text-sm flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-gray-600">{item.quantity} {item.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {request.notes && (
              <div>
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{request.notes}</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-2">
            {request.status !== 'delivered' && request.status !== 'rejected' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast.success(`Marked ${request.title} as delivered`);
                  setShowDetails(false);
                }}
                className="w-full sm:w-auto"
              >
                Mark as Delivered
              </Button>
            )}
            <Button 
              size="sm"
              onClick={() => setShowDetails(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RequestsHeader = ({ searchTerm, onSearchChange, onCreateRequest }) => {
  return (
    <div className="flex flex-col xs:flex-row justify-between gap-3 xs:items-center mb-4">
      <h1 className="text-lg xs:text-xl font-bold">Requests</h1>
      <div className="flex gap-2 w-full xs:w-auto">
        <div className="relative flex-1 xs:min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-8 h-9"
          />
        </div>
        <Button variant="outline" size="sm" className="shrink-0 flex items-center gap-1">
          <Filter className="h-4 w-4" />
          <span className="hidden xs:inline">Filter</span>
        </Button>
        <Button size="sm" className="shrink-0 flex items-center gap-1" onClick={onCreateRequest}>
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">New</span>
        </Button>
      </div>
    </div>
  );
};

const NewRequestDialog = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<RequestItem[]>([{ id: '1', name: '', quantity: '', unit: '', stockStatus: '' }]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  
  // Get all available categories from database
  const categories = getUniqueCategories();
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTitle('');
      setCategory('');
      setDueDate('');
      setNotes('');
      setItems([{ id: '1', name: '', quantity: '', unit: '', stockStatus: '' }]);
      setCategoryProducts([]);
    }
  }, [open]);
  
  // When category changes, update the product list
  useEffect(() => {
    if (category) {
      // Get products for the selected category
      const products = getProductsByCategory(category);
      
      // Combine with inventory data to show stock levels
      const productsWithStock = products.map(product => {
        const inventoryItem = sampleInventory.find(item => 
          item.name.toLowerCase() === product.name.toLowerCase() && 
          item.category.toLowerCase() === category.toLowerCase()
        );
        
        return {
          ...product,
          currentStock: inventoryItem?.currentStock || 'Unknown',
          stockValue: inventoryItem?.actualCount !== undefined ? inventoryItem.actualCount : 'No count',
          defaultUnit: product.units[0] || 'kg'
        };
      });
      
      setCategoryProducts(productsWithStock);
      
      // Pre-populate items with products from this category
      if (productsWithStock.length > 0) {
        setItems(
          productsWithStock.map((product, index) => ({
            id: `item-${index + 1}`,
            name: product.name,
            quantity: '',
            unit: product.defaultUnit,
            stockStatus: product.currentStock,
            stockValue: product.stockValue
          }))
        );
      }
    } else {
      setCategoryProducts([]);
      setItems([{ id: '1', name: '', quantity: '', unit: '', stockStatus: '' }]);
    }
  }, [category]);
  
  const handleAddItem = () => {
    setItems([...items, { 
      id: `item-${items.length + 1}`, 
      name: '', 
      quantity: '', 
      unit: 'kg', 
      stockStatus: '',
      stockValue: 'No count'
    }]);
  };
  
  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // If changing the name, also update the stock status and unit
        if (field === 'name') {
          const selectedProduct = categoryProducts.find(p => p.name === value);
          return { 
            ...item, 
            [field]: value,
            stockStatus: selectedProduct?.currentStock || '',
            stockValue: selectedProduct?.stockValue || 'No count',
            unit: selectedProduct?.defaultUnit || item.unit
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !category || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check if all items have names and quantities
    const validItems = items.every(item => item.name && item.quantity);
    if (!validItems) {
      toast.error("Please specify name and quantity for all items");
      return;
    }
    
    // Create a new request object
    const newRequest = {
      id: `req-${Date.now()}`,
      title: title,
      status: 'pending',
      dueDate: new Date(dueDate),
      category: category,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: parseFloat(item.quantity),
        unit: item.unit
      })),
      notes: notes
    };
    
    // In a real application, this would be sent to a backend API
    // For demo purposes, we'll just show a toast and close the dialog
    console.log("New request created:", newRequest);
    
    toast.success("Request created successfully");
    toast.info("The request has been sent to suppliers for quotes");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Create a new order request for your kitchen supplies.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Request Title</Label>
              <Input 
                id="title" 
                placeholder="E.g., Weekly Produce Order" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Required By</Label>
              <Input 
                id="dueDate" 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required 
              />
            </div>
            
            <div>
              <Label className="mb-2 block">Items</Label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <div className="mb-1 text-xs text-gray-500">Name</div>
                      <Select 
                        value={item.name} 
                        onValueChange={(value) => handleItemChange(item.id, 'name', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryProducts.map((product) => (
                            <SelectItem key={product.id} value={product.name}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <div className="mb-1 text-xs text-gray-500">Qty</div>
                      <Input 
                        placeholder="Qty" 
                        className="h-9"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <div className="mb-1 text-xs text-gray-500">Unit</div>
                      <Select 
                        value={item.unit} 
                        onValueChange={(value) => handleItemChange(item.id, 'unit', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="each">each</SelectItem>
                          <SelectItem value="liter">liter</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="box">box</SelectItem>
                          <SelectItem value="dozen">dozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-24 flex-shrink-0">
                      <div className="mb-1 text-xs text-gray-500">In Stock</div>
                      <div className="h-9 flex items-center border rounded px-2 bg-gray-50">
                        <span className="text-sm">
                          {item.stockValue !== undefined ? item.stockValue : 'No count'}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9 flex-shrink-0 mt-6"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <span className="sr-only">Remove</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs"
                onClick={handleAddItem}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Another Item
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any specific requirements or notes for the supplier"
                value={notes}
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  
  // Filter requests based on search and active tab
  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      request.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && request.status === activeTab;
  });
  
  // Get counts by status
  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const completedCount = allRequests.filter(r => r.status === 'completed').length;
  const deliveredCount = allRequests.filter(r => r.status === 'delivered').length;
  
  // Define tabs
  const tabs = [
    { id: 'all', label: `All (${allRequests.length})` },
    { id: 'pending', label: `Pending (${pendingCount})` },
    { id: 'approved', label: `Approved (${approvedCount})` },
    { id: 'completed', label: `Completed (${completedCount})` },
    { id: 'delivered', label: `Delivered (${deliveredCount})` },
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateRequest = () => {
    setIsNewRequestOpen(true);
  };

  return (
    <ChefLayout>
      <div className="space-y-4">
        <RequestsHeader 
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          onCreateRequest={handleCreateRequest}
        />
        
        <NewRequestDialog 
          open={isNewRequestOpen}
          onOpenChange={setIsNewRequestOpen}
        />
        
        {/* Status tabs with carousel for better mobile experience */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="relative">
            <Carousel opts={{ align: 'start', loop: false }} className="w-full">
              <CarouselContent className="-ml-1">
                <TabsList className="h-auto p-1 bg-transparent w-full flex gap-1">
                  {tabs.map((tab) => (
                    <CarouselItem key={tab.id} className="basis-auto pl-1 min-w-fit">
                      <TabsTrigger 
                        value={tab.id} 
                        className="whitespace-nowrap px-4 py-2"
                      >
                        {tab.label}
                      </TabsTrigger>
                    </CarouselItem>
                  ))}
                </TabsList>
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Tab content */}
          <div className="mt-4">
            <TabsContent value="all" className="m-0">
              <div className="space-y-1">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map(request => (
                    <RequestCard key={request.id} request={request} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <p className="text-gray-500">No requests found.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {['pending', 'approved', 'completed', 'delivered'].map(status => (
              <TabsContent key={status} value={status} className="m-0">
                <div className="space-y-1">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map(request => (
                      <RequestCard key={request.id} request={request} />
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <CardContent>
                        <p className="text-gray-500">No {status} requests found.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </ChefLayout>
  );
};

export default Requests;
