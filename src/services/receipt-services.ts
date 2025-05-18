
import { api } from './api-config';

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
