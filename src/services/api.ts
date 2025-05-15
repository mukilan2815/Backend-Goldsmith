
// API service for handling backend requests
import axios from 'axios';

// For local development, this would point to your local server
// For Lovable deployment, this should point to your deployed API
const API_URL = import.meta.env.PROD 
  ? 'https://your-api-url.com/api'  // Replace with your deployed API URL
  : 'http://localhost:5000/api';    // Local development server

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Client services
export const clientServices = {
  // Get all clients
  getClients: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
  
  // Get client by ID
  getClient: async (id: string) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  },
  
  // Create new client
  createClient: async (clientData: any) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  
  // Update client
  updateClient: async (id: string, clientData: any) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  },
  
  // Delete client
  deleteClient: async (id: string) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  }
};

// Receipt services
export const receiptServices = {
  // Get all receipts
  getReceipts: async () => {
    try {
      const response = await api.get('/receipts');
      return response.data;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  },
  
  // Get receipt by ID
  getReceipt: async (id: string) => {
    try {
      const response = await api.get(`/receipts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching receipt ${id}:`, error);
      throw error;
    }
  },
  
  // Get receipts by client ID
  getClientReceipts: async (clientId: string) => {
    try {
      const response = await api.get(`/receipts/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching receipts for client ${clientId}:`, error);
      throw error;
    }
  },
  
  // Create new receipt
  createReceipt: async (receiptData: any) => {
    try {
      const response = await api.post('/receipts', receiptData);
      return response.data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },
  
  // Update receipt
  updateReceipt: async (id: string, receiptData: any) => {
    try {
      const response = await api.put(`/receipts/${id}`, receiptData);
      return response.data;
    } catch (error) {
      console.error(`Error updating receipt ${id}:`, error);
      throw error;
    }
  },
  
  // Delete receipt
  deleteReceipt: async (id: string) => {
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
  }
};

export default {
  clientServices,
  receiptServices,
};
