
import axios from 'axios';
import { toast } from "@/hooks/use-toast";

// For local development, this would point to your local server
const API_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increasing timeout for slower connections
  timeout: 30000, // 30 seconds
});

// Add interceptors for better error handling and loading states
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = 'Connection to server failed. Please check your backend is running.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check if your backend server is running.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = `Request error: ${error.message}`;
    }
    
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
    
    return Promise.reject(error);
  }
);

// Client services
export const clientServices = {
  // Get all clients
  getClients: async (params = {}) => {
    try {
      const response = await api.get('/clients', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
  
  // Get client by ID
  getClient: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  },
  
  // Create new client
  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  
  // Update client
  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  },
  
  // Delete client
  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  },
  
  // Search clients
  searchClients: async (query) => {
    try {
      const response = await api.get(`/clients/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }
};

// Receipt services
export const receiptServices = {
  // Get all receipts
  getReceipts: async (params = {}) => {
    try {
      const response = await api.get('/receipts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  },
  
  // Get receipt by ID
  getReceipt: async (id) => {
    try {
      const response = await api.get(`/receipts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching receipt ${id}:`, error);
      throw error;
    }
  },
  
  // Get receipts by client ID
  getClientReceipts: async (clientId, params = {}) => {
    try {
      const response = await api.get(`/receipts/client/${clientId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching receipts for client ${clientId}:`, error);
      throw error;
    }
  },
  
  // Create new receipt
  createReceipt: async (receiptData) => {
    try {
      console.log('Sending receipt data to server:', JSON.stringify(receiptData));
      
      // Ensure data is properly formatted for the backend
      const formattedData = {
        clientId: receiptData.clientId,
        clientInfo: {
          clientName: receiptData.clientName || "",
          shopName: receiptData.shopName || "",
          phoneNumber: receiptData.phoneNumber || ""
        },
        metalType: receiptData.metalType,
        overallWeight: parseFloat(receiptData.overallWeight || 0),
        issueDate: receiptData.issueDate || new Date(),
        items: receiptData.tableData?.map(item => ({
          itemName: item.itemName || "",
          tag: item.tag || "",
          grossWt: parseFloat(item.grossWt) || 0,
          stoneWt: parseFloat(item.stoneWt) || 0,
          meltingTouch: parseFloat(item.meltingTouch) || 0,
          stoneAmt: parseFloat(item.stoneAmt) || 0,
          totalInvoiceAmount: parseFloat(item.totalInvoiceAmount) || 0
        })) || [],
        voucherId: receiptData.voucherId,
        totals: {
          grossWt: parseFloat(receiptData.totals?.grossWt) || 0,
          stoneWt: parseFloat(receiptData.totals?.stoneWt) || 0,
          netWt: parseFloat(receiptData.totals?.netWt) || 0,
          finalWt: parseFloat(receiptData.totals?.finalWt) || 0,
          stoneAmt: parseFloat(receiptData.totals?.stoneAmt) || 0,
          totalInvoiceAmount: parseFloat(receiptData.totals?.totalInvoiceAmount) || 0
        },
        // Payment tracking fields
        payments: receiptData.payments || [],
        totalPaidAmount: parseFloat(receiptData.totalPaidAmount) || 0,
        balanceDue: parseFloat(receiptData.balanceDue) || 0,
        paymentStatus: receiptData.paymentStatus || 'Pending'
      };
      
      console.log('Formatted receipt data:', JSON.stringify(formattedData));
      
      const response = await api.post('/receipts', formattedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Receipt creation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },
  
  // Update receipt
  updateReceipt: async (id, receiptData) => {
    try {
      const response = await api.put(`/receipts/${id}`, receiptData);
      return response.data;
    } catch (error) {
      console.error(`Error updating receipt ${id}:`, error);
      throw error;
    }
  },
  
  // Delete receipt
  deleteReceipt: async (id) => {
    try {
      const response = await api.delete(`/receipts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting receipt ${id}:`, error);
      throw error;
    }
  },
  
  // Generate unique voucher ID
  generateVoucherId: async () => {
    try {
      const response = await api.get('/receipts/generate-voucher-id');
      return response.data;
    } catch (error) {
      console.error('Error generating voucher ID:', error);
      throw error;
    }
  },
  
  // Search receipts
  searchReceipts: async (query) => {
    try {
      const response = await api.get(`/receipts/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching receipts:', error);
      throw error;
    }
  }
};

// Export analytics and other services
export const analyticsServices = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error; 
    }
  },
  
  getSalesByDate: async (startDate, endDate) => {
    try {
      const response = await api.get(`/analytics/sales?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw error;
    }
  },
  
  getMetalTypeDistribution: async () => {
    try {
      const response = await api.get('/analytics/metal-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching metal type distribution:', error);
      throw error;
    }
  },
  
  getYearlyComparison: async () => {
    try {
      const response = await api.get('/analytics/yearly-comparison');
      return response.data;
    } catch (error) {
      console.error('Error fetching yearly comparison:', error);
      throw error;
    }
  }
};

export default {
  clientServices,
  receiptServices,
  analyticsServices,
};
