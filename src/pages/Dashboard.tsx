
import React, { useEffect, useState } from 'react';
import { FileText, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentRequests } from '@/components/dashboard/RecentRequests';
import { UpcomingRequests } from '@/components/dashboard/UpcomingRequests';
import { QuoteMetrics } from '@/components/dashboard/QuoteMetrics';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRequests } from '@/services/requestsService';
import { useQuoteItems } from '@/hooks/useQuoteItems';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    quoteRequests: 0,
    ingredients: 0,
    costSavings: 0,
  });

  // Fetch recent quote requests
  const { data: requests, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ['dashboardRequests'],
    queryFn: async () => {
      try {
        const allRequests = await fetchAllRequests();
        // Return only the most recent 3 requests
        return allRequests
          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
          .slice(0, 3)
          .map(req => ({
            id: req.id,
            title: req.title,
            supplier: req.quotes[0]?.supplierName || 'Multiple suppliers',
            requestDate: getRelativeTimeString(req.dueDate),
            status: getRequestStatus(req),
            items: req.items.length,
          }));
      } catch (error) {
        console.error('Failed to fetch dashboard requests:', error);
        throw error;
      }
    }
  });

  // Fetch quote items for metrics
  const { quoteItems, isLoading: itemsLoading } = useQuoteItems();

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get count of suppliers
        const { count: supplierCount, error: supplierError } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true });

        if (supplierError) throw supplierError;

        // Get count of ingredients/products
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productError) throw productError;

        // Get count of quote requests
        const { count: quoteCount, error: quoteError } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true });

        if (quoteError) throw quoteError;

        // Calculate cost savings (in a real app, this would come from actual data)
        // For now, we'll use a placeholder calculation based on quote items
        const costSavings = quoteItems.reduce((total, item) => {
          // If item is the lowest price, we count it as savings
          if (item.isLowestPrice) {
            // Estimate savings at 15% compared to average price
            return total + (item.price * item.quantity * 0.15);
          }
          return total;
        }, 0);

        setStats({
          totalSuppliers: supplierCount || 0,
          quoteRequests: quoteCount || 0,
          ingredients: productCount || 0,
          costSavings: costSavings || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      }
    };

    fetchDashboardStats();
  }, [quoteItems]);

  // Convert request status to UI status
  const getRequestStatus = (request: any) => {
    if (request.status === 'completed' && request.quotes.length > 0) {
      return 'received';
    } else if (request.status === 'pending') {
      return 'pending';
    } else {
      return 'expired';
    }
  };

  // Convert date to relative time string
  const getRelativeTimeString = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Show error if any data fetching fails
  useEffect(() => {
    if (requestsError) {
      toast.error('Failed to load recent requests');
      console.error(requestsError);
    }
  }, [requestsError]);

  const isLoading = requestsLoading || itemsLoading;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
          <p className="text-dark-gray">Welcome back to your procurement dashboard</p>
        </div>
        <Button asChild>
          <Link to="/quotes/new">New Quote Request</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Suppliers" 
          value={isLoading ? "..." : stats.totalSuppliers.toString()} 
          icon={<Users className="h-4 w-4" />}
          description="Active restaurant suppliers"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard 
          title="Quote Requests" 
          value={isLoading ? "..." : stats.quoteRequests.toString()} 
          icon={<FileText className="h-4 w-4" />}
          description="Year to date"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Ingredients" 
          value={isLoading ? "..." : stats.ingredients.toString()} 
          icon={<Package className="h-4 w-4" />}
          description="In your catalog"
        />
        <StatCard 
          title="Cost Savings" 
          value={isLoading ? "..." : `$${stats.costSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={<TrendingUp className="h-4 w-4" />}
          description="YTD compared to last year"
          trend={{ value: 23, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 animate-fade-in">
          <QuoteMetrics />
        </Card>
        <UpcomingRequests />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <RecentRequests requests={requests || []} />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <Dashboard />
        </div>
      </div>
    </SidebarProvider>
  );
}
