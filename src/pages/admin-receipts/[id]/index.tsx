
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock data for demo
const mockReceipt = {
  _id: "receipt123",
  voucherId: "GA-2304-5678",
  clientId: "client123",
  clientName: "Golden Creations",
  status: "incomplete",
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
    givenTotal: 107.57,
    receivedTotal: 45,
    operation: "subtract-given-received",
    result: 62.57
  }
};

export default function AdminReceiptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch receipt data
  useEffect(() => {
    const fetchReceiptData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setReceipt(mockReceipt);
      } catch (error) {
        console.error("Error fetching receipt:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceiptData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-6 flex justify-center items-center min-h-[600px]">
        <p className="text-xl text-muted-foreground">Loading receipt details...</p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Receipt Not Found</h2>
          <p className="text-muted-foreground mb-6">The receipt you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/admin-receipts")}>Return to Receipts</Button>
        </div>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  // Helper for operation text
  const getOperationText = (operation) => {
    switch (operation) {
      case 'subtract-given-received':
        return 'Subtract (Given - Received)';
      case 'subtract-received-given':
        return 'Subtract (Received - Given)';
      case 'add':
        return 'Add';
      default:
        return operation;
    }
  };

  return (
    <div className="container py-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Receipt View</h1>
            <p className="text-gray-500">Client: {receipt.clientName} (ID: {receipt.clientId})</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" 
              onClick={() => navigate("/admin-receipts")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download Receipt
            </Button>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Given Details Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Given Details</h2>
          <p className="text-gray-600 mb-4">Date: {formatDate(receipt.given.date)}</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">S.No.</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Product Name</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Pure Weight</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Pure %</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Melting</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.given.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 text-center">{index + 1}</td>
                    <td className="py-2 px-4 text-center">{item.productName}</td>
                    <td className="py-2 px-4 text-center">{item.pureWeight}</td>
                    <td className="py-2 px-4 text-center">{item.purePercent}</td>
                    <td className="py-2 px-4 text-center">{item.melting}</td>
                    <td className="py-2 px-4 text-center">{item.total.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={5} className="py-2 px-4 text-right font-medium">Total:</td>
                  <td className="py-2 px-4 text-center font-medium">{receipt.given.total.toFixed(3)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Received Details Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Received Details</h2>
          <p className="text-gray-600 mb-4">Date: {formatDate(receipt.received.date)}</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">S.No.</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Product Name</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Final Ornaments (wt)</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Stone Weight</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Sub Total</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Making Charge (%)</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.received.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 text-center">{index + 1}</td>
                    <td className="py-2 px-4 text-center">{item.productName}</td>
                    <td className="py-2 px-4 text-center">{item.finalOrnamentsWt}</td>
                    <td className="py-2 px-4 text-center">{item.stoneWeight}</td>
                    <td className="py-2 px-4 text-center">{item.subTotal.toFixed(3)}</td>
                    <td className="py-2 px-4 text-center">{item.makingChargePercent}</td>
                    <td className="py-2 px-4 text-center">{item.total.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={2} className="py-2 px-4 text-right font-medium">Total:</td>
                  <td className="py-2 px-4 text-center font-medium">{receipt.received.totalOrnamentsWt.toFixed(3)}</td>
                  <td className="py-2 px-4 text-center font-medium">{receipt.received.totalStoneWeight.toFixed(3)}</td>
                  <td className="py-2 px-4 text-center font-medium">{receipt.received.totalSubTotal.toFixed(3)}</td>
                  <td className="py-2 px-4"></td>
                  <td className="py-2 px-4 text-center font-medium">{receipt.received.total.toFixed(3)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Total Summary Section */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Total Summary</h2>
          <p className="text-gray-600 mb-4">Final calculation based on Given and Received totals. This is for on-screen viewing and can be manually adjusted. This section is not saved and only for PDF output.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Given Total</p>
              <p className="font-medium">{receipt.manualCalculation.givenTotal.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Operation</p>
              <p className="font-medium">{getOperationText(receipt.manualCalculation.operation)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Received Total</p>
              <p className="font-medium">{receipt.manualCalculation.receivedTotal.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Result</p>
              <p className="font-medium">{receipt.manualCalculation.result.toFixed(3)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
