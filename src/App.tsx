
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
import Quotes from "./pages/Quotes";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import EditSupplier from "./pages/EditSupplier";
import SupplierProducts from "./pages/SupplierProducts";
import ProductComparison from "./pages/ProductComparison";
import ProductDatabasePage from "./pages/ProductDatabase";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Chef Pages
import Inventory from "./pages/chef/Inventory";
import Requests from "./pages/chef/Requests";

// Admin Pages
import UserManagement from "./pages/admin/UserManagement";
import Settings from "./pages/admin/Settings";

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
            <Route path="/register" element={<Register />} />
            
            {/* Redirect root to appropriate page */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Purchasing Department Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotes" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <Quotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotes/new" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <NewQuoteRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/suppliers" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/:id" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <SupplierDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <EditSupplier />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/:id/products" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <SupplierProducts />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/suppliers/new" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <EditSupplier />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/products/compare" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <ProductComparison />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/products/database" 
              element={
                <ProtectedRoute allowedRoles={['purchasing', 'admin']}>
                  <ProductDatabasePage />
                </ProtectedRoute>
              }
            />

            {/* Chef Routes */}
            <Route 
              path="/chef/inventory" 
              element={
                <ProtectedRoute allowedRoles={['chef', 'admin']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/chef/requests" 
              element={
                <ProtectedRoute allowedRoles={['chef', 'admin']}>
                  <Requests />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
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
