
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
            
            <Route path="receipts" element={<div className="p-6">Receipts Page Coming Soon</div>} />
            <Route path="receipts/admin" element={<div className="p-6">Admin Receipts Page Coming Soon</div>} />
            <Route path="receipts/new" element={<div className="p-6">New Receipt Page Coming Soon</div>} />
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
