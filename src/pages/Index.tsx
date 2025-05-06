
import React from 'react';
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

// Sample data
const recentRequests = [
  {
    id: '1',
    title: 'Weekly Produce Order',
    supplier: 'Farm Fresh Produce',
    requestDate: '3 days ago',
    status: 'received',
    items: 15,
  },
  {
    id: '2',
    title: 'Monthly Dairy Order',
    supplier: 'Dairy Best Inc.',
    requestDate: '1 week ago',
    status: 'pending',
    items: 8,
  },
  {
    id: '3',
    title: 'Seafood Special Order',
    supplier: 'Seafood Direct',
    requestDate: '2 weeks ago',
    status: 'expired',
    items: 6,
  }
] as const;

const Dashboard = () => {
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
          value="24" 
          icon={<Users className="h-4 w-4" />}
          description="Active restaurant suppliers"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard 
          title="Quote Requests" 
          value="156" 
          icon={<FileText className="h-4 w-4" />}
          description="Year to date"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Ingredients" 
          value="312" 
          icon={<Package className="h-4 w-4" />}
          description="In your catalog"
        />
        <StatCard 
          title="Cost Savings" 
          value="$12,480" 
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
        <RecentRequests requests={recentRequests} />
      </div>
    </div>
  );
};

const Index = () => {
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
};

export default Index;
