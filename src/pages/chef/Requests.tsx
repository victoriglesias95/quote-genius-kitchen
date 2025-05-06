import React, { useState } from 'react';
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
import { Search, Filter, Clock, Plus, Check } from 'lucide-react';

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
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Request created successfully");
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
              <Input id="title" placeholder="E.g., Weekly Produce Order" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="E.g., produce, meat, dairy" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Required By</Label>
              <Input id="dueDate" type="date" required />
            </div>
            
            <div>
              <Label htmlFor="items">Items</Label>
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <Input placeholder="Item name" className="flex-1" />
                  <Input placeholder="Qty" className="w-20" />
                  <Input placeholder="Unit" className="w-20" />
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Item name" className="flex-1" />
                  <Input placeholder="Qty" className="w-20" />
                  <Input placeholder="Unit" className="w-20" />
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" className="mt-2 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add Another Item
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Any specific requirements or notes for the supplier" />
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
