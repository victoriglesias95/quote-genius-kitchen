
import React, { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  Badge, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Input,
  Button,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui';
import ChefLayout from '@/components/layout/ChefLayout';
import { Search, Filter, Clock } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

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

const RequestCard = ({ request }: { request: any }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewRequest = () => {
    toast.info(`Viewing request details for ${request.title}`);
    // In a real app, this would navigate to a request detail page
  };

  return (
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
  );
};

const RequestsHeader = ({ searchTerm, onSearchChange }: { searchTerm: string, onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
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
      </div>
    </div>
  );
};

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter requests based on search and active tab
  const filteredRequests = sampleRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      request.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && request.status === activeTab;
  });
  
  // Get counts by status
  const pendingCount = sampleRequests.filter(r => r.status === 'pending').length;
  const approvedCount = sampleRequests.filter(r => r.status === 'approved').length;
  const completedCount = sampleRequests.filter(r => r.status === 'completed').length;
  
  // Define tabs
  const tabs = [
    { id: 'all', label: `All (${sampleRequests.length})` },
    { id: 'pending', label: `Pending (${pendingCount})` },
    { id: 'approved', label: `Approved (${approvedCount})` },
    { id: 'completed', label: `Completed (${completedCount})` },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <ChefLayout>
      <div className="space-y-4">
        <RequestsHeader 
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
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
            
            {['pending', 'approved', 'completed'].map(status => (
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
