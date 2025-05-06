
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewQuoteRequest from "./pages/NewQuoteRequest";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import EditSupplier from "./pages/EditSupplier";
import SupplierProducts from "./pages/SupplierProducts";
import ProductComparison from "./pages/ProductComparison";
import ProductDatabasePage from "./pages/ProductDatabase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quotes/new" element={<NewQuoteRequest />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/suppliers/:id/edit" element={<EditSupplier />} />
          <Route path="/suppliers/:id/products" element={<SupplierProducts />} />
          <Route path="/suppliers/new" element={<EditSupplier />} />
          <Route path="/products/compare" element={<ProductComparison />} />
          <Route path="/products/database" element={<ProductDatabasePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
