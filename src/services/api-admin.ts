
import axios from "axios";

// Base URL for API calls
const API_URL = process.env.NODE_ENV === "production" 
  ? "/api" 
  : "http://localhost:5000/api";

// Configuration for API requests
const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Admin Receipt Services
 */
export const adminReceiptServices = {
  // Get all admin receipts
  getAdminReceipts: async () => {
    try {
      // Simulate API call for now
      // In production, use: const { data } = await axios.get(`${API_URL}/admin-receipts`, config);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = [
        {
          _id: "1",
          clientName: "Golden Creations",
          status: "complete",
          voucherId: "GA-2304-1001",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 100
          },
          received: {
            date: new Date().toISOString(),
            total: 95
          }
        },
        {
          _id: "2",
          clientName: "Silver Linings",
          status: "incomplete",
          voucherId: "GA-2304-1002",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 50
          },
          received: {
            date: new Date().toISOString(),
            total: 30
          }
        },
        {
          _id: "3",
          clientName: "Gem Masters",
          status: "empty",
          voucherId: "GA-2304-1003",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 0
          },
          received: {
            date: new Date().toISOString(),
            total: 0
          }
        }
      ];
      
      return mockData;
    } catch (error) {
      throw error;
    }
  },

  // Get admin receipt by ID
  getAdminReceiptById: async (id: string) => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.get(`${API_URL}/admin-receipts/${id}`, config);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = {
        _id: id,
        clientId: "client123",
        clientName: "Golden Creations",
        status: "incomplete",
        voucherId: `GA-2304-${1000 + parseInt(id)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        given: {
          date: new Date().toISOString(),
          items: [
            {
              productName: "Gold Bar",
              pureWeight: "100",
              purePercent: "99.5",
              melting: "92.5",
              total: 107.57
            }
          ],
          totalPureWeight: 99.5,
          total: 107.57
        },
        received: {
          date: new Date().toISOString(),
          items: [
            {
              productName: "Gold Ring",
              finalOrnamentsWt: "50",
              stoneWeight: "5",
              makingChargePercent: "10",
              subTotal: 45,
              total: 4.5
            }
          ],
          totalOrnamentsWt: 50,
          totalStoneWeight: 5,
          totalSubTotal: 45,
          total: 4.5
        },
        manualCalculation: {
          givenTotal: 100,
          receivedTotal: 50,
          operation: "subtract-given-received",
          result: 50
        }
      };
      
      return mockData;
    } catch (error) {
      throw error;
    }
  },

  // Create a new admin receipt
  createAdminReceipt: async (receiptData) => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.post(`${API_URL}/admin-receipts`, receiptData, config);
      
      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...receiptData,
        _id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  },

  // Update an admin receipt
  updateAdminReceipt: async (id: string, receiptData) => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.put(`${API_URL}/admin-receipts/${id}`, receiptData, config);
      
      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...receiptData,
        _id: id,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete an admin receipt
  deleteAdminReceipt: async (id: string) => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.delete(`${API_URL}/admin-receipts/${id}`, config);
      
      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { message: "Admin receipt deleted successfully" };
    } catch (error) {
      throw error;
    }
  },

  // Generate a unique voucher ID
  getVoucherId: async () => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.get(`${API_URL}/admin-receipts/generate-voucher-id`, config);
      
      // Generate mock voucher ID
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      
      return { voucherId: `GA-${year}${month}-${randomNum}` };
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Admin Bill Services
 */
export const adminBillServices = {
  // Get all admin bills
  getAdminBills: async (params = {}) => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.get(`${API_URL}/admin-bills`, { ...config, params });
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = [
        {
          _id: "1",
          clientName: "Golden Creations",
          status: "complete",
          voucherId: "GA-2304-1001",
          createdAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 100
          },
          received: {
            date: new Date().toISOString(),
            total: 95
          }
        },
        {
          _id: "2",
          clientName: "Silver Linings",
          status: "incomplete",
          voucherId: "GA-2304-1002",
          createdAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 50
          },
          received: {
            date: new Date().toISOString(),
            total: 30
          }
        },
        {
          _id: "3",
          clientName: "Gem Masters",
          status: "empty",
          voucherId: "GA-2304-1003",
          createdAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 0
          },
          received: {
            date: new Date().toISOString(),
            total: 0
          }
        },
        {
          _id: "4",
          clientName: "Platinum Plus",
          status: "complete",
          voucherId: "GA-2304-1004",
          createdAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 75
          },
          received: {
            date: new Date().toISOString(),
            total: 70
          }
        },
        {
          _id: "5",
          clientName: "Diamond Designs",
          status: "complete",
          voucherId: "GA-2304-1005",
          createdAt: new Date().toISOString(),
          given: {
            date: new Date().toISOString(),
            total: 120
          },
          received: {
            date: new Date().toISOString(),
            total: 115
          }
        },
      ];
      
      return mockData;
    } catch (error) {
      throw error;
    }
  },

  // Get admin bill by ID
  getAdminBillById: async (id: string) => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.get(`${API_URL}/admin-bills/${id}`, config);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = {
        _id: id,
        clientId: "client123",
        clientName: "Golden Creations",
        status: "complete",
        voucherId: `GA-2304-${1000 + parseInt(id)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        given: {
          date: new Date().toISOString(),
          items: [
            {
              productName: "Gold Bar",
              pureWeight: "100",
              purePercent: "99.5",
              melting: "92.5",
              total: 107.57
            }
          ],
          totalPureWeight: 99.5,
          total: 107.57
        },
        received: {
          date: new Date().toISOString(),
          items: [
            {
              productName: "Gold Ring",
              finalOrnamentsWt: "50",
              stoneWeight: "5",
              makingChargePercent: "10",
              subTotal: 45,
              total: 4.5
            }
          ],
          totalOrnamentsWt: 50,
          totalStoneWeight: 5,
          totalSubTotal: 45,
          total: 4.5
        }
      };
      
      return mockData;
    } catch (error) {
      throw error;
    }
  },

  // Delete an admin bill
  deleteAdminBill: async (id: string) => {
    try {
      // Simulate API call
      // In production, use: const { data } = await axios.delete(`${API_URL}/admin-bills/${id}`, config);
      
      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { message: "Admin bill deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
};
