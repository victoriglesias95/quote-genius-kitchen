
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Quotes from '@/pages/Quotes';
import NewQuoteRequest from '@/pages/NewQuoteRequest';
import QuoteDetail from '@/pages/QuoteDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import Suppliers from '@/pages/Suppliers';
import SupplierDetail from '@/pages/SupplierDetail';
import EditSupplier from '@/pages/EditSupplier';
import SupplierProducts from '@/pages/SupplierProducts';
import Requests from '@/pages/chef/Requests';
import Inventory from '@/pages/chef/Inventory';
import Settings from '@/pages/admin/Settings';
import UserManagement from '@/pages/admin/UserManagement';
import BatchQuoteGenerator from '@/pages/BatchQuoteGenerator';
import ProductDatabase from '@/pages/ProductDatabase';
import ProductComparison from '@/pages/ProductComparison';
import PurchasingAssistant from '@/pages/PurchasingAssistant';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Quote Routes */}
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/new" element={<NewQuoteRequest />} />
          <Route path="/quotes/detail/:id" element={<QuoteDetail />} />
          <Route path="/quotes/batch" element={<BatchQuoteGenerator />} />
          <Route path="/quotes/purchasing-assistant" element={<PurchasingAssistant />} />
          
          {/* Supplier Routes */}
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/suppliers/:id/edit" element={<EditSupplier />} />
          <Route path="/suppliers/:id/products" element={<SupplierProducts />} />
          
          {/* Chef Routes */}
          <Route path="/chef/requests" element={<Requests />} />
          <Route path="/chef/inventory" element={<Inventory />} />
          
          {/* Admin Routes */}
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/users" element={<UserManagement />} />
          
          {/* Product Routes */}
          <Route path="/products/database" element={<ProductDatabase />} />
          <Route path="/products/compare" element={<ProductComparison />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
