
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// For local development, this would point to your local server
// For production, this should point to your deployed API
const API_URL = import.meta.env.PROD 
  ? 'https://your-deployed-api.com/api'  // Replace with your deployed API URL
  : 'http://localhost:5000/api';         // Local development server

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors for better error handling and loading states
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
    return Promise.reject(error);
  }
);

// Client services
export const clientServices = {
  // Get all clients
  getClients: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  
  // Get client by ID
  getClient: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  
  // Create new client
  createClient: async (clientData: any) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  // Update client
  updateClient: async (id: string, clientData: any) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  // Delete client
  deleteClient: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
  
  // Search clients
  searchClients: async (query: string) => {
    const response = await api.get(`/clients/search?query=${query}`);
    return response.data;
  }
};

// Receipt services
export const receiptServices = {
  // Get all receipts
  getReceipts: async () => {
    const response = await api.get('/receipts');
    return response.data;
  },
  
  // Get receipt by ID
  getReceipt: async (id: string) => {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  },
  
  // Get receipts by client ID
  getClientReceipts: async (clientId: string) => {
    const response = await api.get(`/receipts/client/${clientId}`);
    return response.data;
  },
  
  // Create new receipt
  createReceipt: async (receiptData: any) => {
    const response = await api.post('/receipts', receiptData);
    return response.data;
  },
  
  // Update receipt
  updateReceipt: async (id: string, receiptData: any) => {
    const response = await api.put(`/receipts/${id}`, receiptData);
    return response.data;
  },
  
  // Delete receipt
  deleteReceipt: async (id: string) => {
    const response = await api.delete(`/receipts/${id}`);
    return response.data;
  },
  
  // Generate unique voucher ID
  generateVoucherId: async () => {
    const response = await api.get('/receipts/generate-voucher-id');
    return response.data;
  },
  
  // Search receipts
  searchReceipts: async (query: string) => {
    const response = await api.get(`/receipts/search?query=${query}`);
    return response.data;
  }
};

// Dashboard analytics services
export const analyticsServices = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
  
  // Get sales by date range
  getSalesByDate: async (startDate: string, endDate: string) => {
    const response = await api.get(`/analytics/sales?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  // Get metal type distribution
  getMetalTypeDistribution: async () => {
    const response = await api.get('/analytics/metal-types');
    return response.data;
  },
  
  // Get yearly comparison data
  getYearlyComparison: async () => {
    const response = await api.get('/analytics/yearly-comparison');
    return response.data;
  }
};

// Admin receipt services
export const adminReceiptServices = {
  // Get all admin receipts
  getAdminReceipts: async () => {
    const response = await api.get('/admin-receipts');
    return response.data;
  },
  
  // Get admin receipt by ID
  getAdminReceipt: async (id: string) => {
    const response = await api.get(`/admin-receipts/${id}`);
    return response.data;
  },
  
  // Create new admin receipt
  createAdminReceipt: async (receiptData: any) => {
    const response = await api.post('/admin-receipts', receiptData);
    return response.data;
  },
  
  // Update admin receipt
  updateAdminReceipt: async (id: string, receiptData: any) => {
    const response = await api.put(`/admin-receipts/${id}`, receiptData);
    return response.data;
  },
  
  // Delete admin receipt
  deleteAdminReceipt: async (id: string) => {
    const response = await api.delete(`/admin-receipts/${id}`);
    return response.data;
  }
};

// Admin bill services
export const adminBillServices = {
  // Get all admin bills
  getAdminBills: async () => {
    const response = await api.get('/admin-bills');
    return response.data;
  },
  
  // Get admin bill by ID
  getAdminBill: async (id: string) => {
    const response = await api.get(`/admin-bills/${id}`);
    return response.data;
  },
  
  // Create new admin bill
  createAdminBill: async (billData: any) => {
    const response = await api.post('/admin-bills', billData);
    return response.data;
  },
  
  // Update admin bill
  updateAdminBill: async (id: string, billData: any) => {
    const response = await api.put(`/admin-bills/${id}`, billData);
    return response.data;
  },
  
  // Delete admin bill
  deleteAdminBill: async (id: string) => {
    const response = await api.delete(`/admin-bills/${id}`);
    return response.data;
  }
};

export default {
  clientServices,
  receiptServices,
  analyticsServices,
  adminReceiptServices,
  adminBillServices
};
