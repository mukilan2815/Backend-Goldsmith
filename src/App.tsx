
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/dashboard-layout";

// Client routes
import ClientsPage from "./pages/clients";
import NewClientPage from "./pages/clients/new";
import ClientDetailsPage from "./pages/clients/[id]";
import EditClientPage from "./pages/clients/[id]/edit";

// Receipt routes
import ReceiptsPage from "./pages/receipts";
import NewReceiptPage from "./pages/receipts/new";
import ReceiptDetailsPage from "./pages/receipts/[id]";
import EditReceiptPage from "./pages/receipts/[id]/edit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            
            {/* Client Routes */}
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/new" element={<NewClientPage />} />
            <Route path="clients/:id" element={<ClientDetailsPage />} />
            <Route path="clients/:id/edit" element={<EditClientPage />} />
            
            {/* Receipt Routes */}
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="receipts/new" element={<NewReceiptPage />} />
            <Route path="receipts/:id" element={<ReceiptDetailsPage />} />
            <Route path="receipts/:id/edit" element={<EditReceiptPage />} />
            
            {/* Future Routes */}
            <Route path="receipts/admin" element={<div className="p-6">Admin Receipts Page Coming Soon</div>} />
            <Route path="reports" element={<div className="p-6">Reports Page Coming Soon</div>} />
            <Route path="settings" element={<div className="p-6">Settings Page Coming Soon</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
