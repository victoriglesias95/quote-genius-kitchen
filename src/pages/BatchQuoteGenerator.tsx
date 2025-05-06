
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, PlusCircle, Check, X, ShoppingCart, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sampleSuppliers } from '@/pages/Suppliers';
import { Request, RequestItem } from '@/components/chef/requests/types';
import { findSuppliersForProduct, buildSupplierQuoteRequests, aggregateItems, generateSupplierQuoteRequests } from '@/services/supplierProductService';

const BatchQuoteGenerator = () => {
  const navigate = useNavigate();
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 week from now
  const [title, setTitle] = useState<string>('Combined Quote Request');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  
  // Fetch all pending chef requests
  const { data: chefRequests = [], isLoading } = useQuery({
    queryKey: ['pendingChefRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*, request_items(*)')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data;
    }
  });

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequestIds(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };
  
  // Get all selected requests
  const selectedRequests = chefRequests.filter(req => selectedRequestIds.includes(req.id));
  
  // Extract and aggregate all items from selected requests
  const allItems = selectedRequests.map(req => req.request_items);
  const aggregatedItems = aggregateItems(allItems);
  
  // Match products to suppliers
  const supplierItemsMap = buildSupplierQuoteRequests(aggregatedItems);
  
  // Format for display and toggle supplier selection
  const supplierMatches = Array.from(supplierItemsMap.entries()).map(([supplierId, items]) => {
    const supplier = sampleSuppliers.find(s => s.id === supplierId);
    return {
      id: supplierId,
      name: supplier?.name || 'Unknown Supplier',
      itemCount: items.length,
      items
    };
  });

  const toggleSupplierSelection = (supplierId: string) => {
    setSelectedSuppliers(prev => {
      if (prev.includes(supplierId)) {
        return prev.filter(id => id !== supplierId);
      } else {
        return [...prev, supplierId];
      }
    });
  };

  // Initially select all suppliers when matches change
  React.useEffect(() => {
    if (supplierMatches.length > 0) {
      setSelectedSuppliers(supplierMatches.map(supplier => supplier.id));
    }
  }, [JSON.stringify(supplierMatches.map(s => s.id))]);
  
  const handleSubmit = async () => {
    if (selectedRequestIds.length === 0) {
      toast.error("Please select at least one request");
      return;
    }

    if (selectedSuppliers.length === 0) {
      toast.error("Please select at least one supplier");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter items for selected suppliers only
      const filteredSupplierMap = new Map<string, RequestItem[]>();
      
      // Only include selected suppliers
      selectedSuppliers.forEach(supplierId => {
        const items = supplierItemsMap.get(supplierId);
        if (items) {
          filteredSupplierMap.set(supplierId, items);
        }
      });
      
      // Generate quote requests just for selected suppliers
      const quoteIds = [];
      
      for (const [supplierId, items] of filteredSupplierMap.entries()) {
        const supplier = sampleSuppliers.find(s => s.id === supplierId);
        if (supplier) {
          const quoteId = await createQuoteRequest(
            title,
            supplierId,
            supplier.name,
            dueDate,
            'Combined',
            items
          );
          quoteIds.push(quoteId);
        }
      }
      
      if (quoteIds.length > 0) {
        toast.success(`Generated ${quoteIds.length} quote requests successfully`);
        
        // Update the status of all selected chef requests
        const { error } = await supabase
          .from('requests')
          .update({ status: 'approved' })
          .in('id', selectedRequestIds);
          
        if (error) {
          console.error("Error updating request status:", error);
        }
        
        // Navigate back to quotes page
        setTimeout(() => navigate('/quotes'), 1500);
      } else {
        toast.error("No quote requests were generated");
      }
    } catch (error) {
      console.error("Error generating quote requests:", error);
      toast.error("Failed to generate quote requests");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <Button variant="outline" onClick={() => navigate('/quotes')} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotes
            </Button>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-navy">Batch Quote Generator</h1>
                <p className="text-dark-gray">Create multiple quote requests from chef requests automatically</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-1">Quote Request Title</label>
                      <Input 
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Combined Quote Request"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date</label>
                      <DatePicker date={dueDate} setDate={setDueDate} />
                    </div>
                    <div className="mt-6">
                      <Button 
                        className="w-full" 
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedRequestIds.length === 0 || selectedSuppliers.length === 0}
                      >
                        {isSubmitting ? 'Generating...' : 'Generate Quote Requests'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Chef Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center p-4">
                        Loading requests...
                      </div>
                    ) : chefRequests.length === 0 ? (
                      <div className="text-center p-4">
                        No pending chef requests found
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Supplier Match</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chefRequests.map(request => {
                            // Check if all items have supplier matches
                            const itemsWithMatch = request.request_items.filter(item => 
                              findSuppliersForProduct(item.name).length > 0
                            );
                            const allItemsHaveMatch = itemsWithMatch.length === request.request_items.length;
                            
                            return (
                              <TableRow key={request.id} className="cursor-pointer" onClick={() => toggleRequestSelection(request.id)}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedRequestIds.includes(request.id)}
                                    onCheckedChange={() => toggleRequestSelection(request.id)}
                                  />
                                </TableCell>
                                <TableCell>{request.title}</TableCell>
                                <TableCell>{request.request_items.length} items</TableCell>
                                <TableCell>{new Date(request.due_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {allItemsHaveMatch ? (
                                    <div className="flex items-center text-green-600">
                                      <Check className="h-4 w-4 mr-1" />
                                      <span>{itemsWithMatch.length}/{request.request_items.length}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-orange-500">
                                      <PlusCircle className="h-4 w-4 mr-1" />
                                      <span>{itemsWithMatch.length}/{request.request_items.length}</span>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                
                {selectedRequestIds.length > 0 && (
                  <>
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Aggregated Items</CardTitle>
                        <CardDescription>Combined items from all selected requests</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Total Quantity</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Supplier Matches</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {aggregatedItems.map((item, index) => {
                              const matchingSuppliers = findSuppliersForProduct(item.name);
                              
                              return (
                                <TableRow key={index}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{item.unit}</TableCell>
                                  <TableCell>
                                    {matchingSuppliers.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {matchingSuppliers.slice(0, 3).map(supplier => (
                                          <Badge key={supplier.id} variant="outline" className="bg-blue-50 text-blue-700">
                                            {supplier.name}
                                          </Badge>
                                        ))}
                                        {matchingSuppliers.length > 3 && (
                                          <Badge variant="outline">+{matchingSuppliers.length - 3} more</Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-red-500">
                                        <X className="h-4 w-4 mr-1" />
                                        <span>No matching suppliers</span>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Supplier Quote Requests</CardTitle>
                        <CardDescription>Select which suppliers to generate quote requests for</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {supplierMatches.length === 0 ? (
                          <div className="text-center p-4 flex flex-col items-center">
                            <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
                            <p className="text-lg font-medium">No matching suppliers found</p>
                            <p className="text-sm text-muted-foreground">None of the selected items match any supplier's product list</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {supplierMatches.map(supplier => (
                              <Card key={supplier.id} className={`border-2 ${selectedSuppliers.includes(supplier.id) ? 'border-blue-500' : 'border-gray-200'}`}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <Checkbox 
                                        checked={selectedSuppliers.includes(supplier.id)} 
                                        onCheckedChange={() => toggleSupplierSelection(supplier.id)}
                                        id={`supplier-${supplier.id}`}
                                      />
                                      <div>
                                        <label htmlFor={`supplier-${supplier.id}`} className="text-lg font-medium cursor-pointer">{supplier.name}</label>
                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                          <ShoppingCart className="h-4 w-4" />
                                          <span>{supplier.itemCount} products</span>
                                          <Calendar className="h-4 w-4 ml-2" />
                                          <span>Due: {dueDate.toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Badge>{supplier.itemCount} items</Badge>
                                  </div>
                                  
                                  <div className="mt-4 max-h-40 overflow-y-auto border rounded-md">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Product</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>Unit</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {supplier.items.map((item, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BatchQuoteGenerator;
