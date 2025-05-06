
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewQuoteRequest from "./pages/NewQuoteRequest";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import EditSupplier from "./pages/EditSupplier";
import SupplierProducts from "./pages/SupplierProducts";
import ProductComparison from "./pages/ProductComparison";
import ProductDatabasePage from "./pages/ProductDatabase";
import Login from "./pages/Login";

// Chef Pages
import Inventory from "./pages/chef/Inventory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect root to appropriate page */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Purchasing Department Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotes/new" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <NewQuoteRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/suppliers" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/:id" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <SupplierDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <EditSupplier />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/:id/products" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <SupplierProducts />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/new" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <EditSupplier />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/products/compare" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <ProductComparison />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/products/database" 
              element={
                <ProtectedRoute allowedRoles={['purchasing']}>
                  <ProductDatabasePage />
                </ProtectedRoute>
              }
            />

            {/* Chef Routes */}
            <Route 
              path="/chef/inventory" 
              element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            {/* Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
