
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Download } from "lucide-react";
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
    givenTotal: 100,
    receivedTotal: 50,
    operation: "subtract-given-received",
    result: 50
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

  // Helper to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-500">Complete</Badge>;
      case 'incomplete':
        return <Badge variant="default" className="bg-yellow-500">Incomplete</Badge>;
      case 'empty':
        return <Badge variant="default" className="bg-gray-400">Empty</Badge>;
      default:
        return <Badge variant="default" className="bg-gray-400">{status}</Badge>;
    }
  };

  // Helper for operation text
  const getOperationText = (operation) => {
    switch (operation) {
      case 'subtract-given-received':
        return 'Given - Received';
      case 'subtract-received-given':
        return 'Received - Given';
      case 'add':
        return 'Add';
      default:
        return operation;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-receipts")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Receipts
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin-receipts/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Receipt
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
          Admin Receipt Details 
          {getStatusBadge(receipt.status)}
        </h1>
        <p className="text-muted-foreground">
          Viewing receipt {receipt.voucherId} • Last updated on {formatDate(receipt.updatedAt)}
        </p>
      </div>

      {/* Client Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client ID</p>
              <p>{receipt.clientId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Name</p>
              <p>{receipt.clientName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Given Items Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Given Items</CardTitle>
          <p className="text-sm text-muted-foreground">Date: {formatDate(receipt.given.date)}</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">S.No.</th>
                  <th className="py-2 px-4 text-left">Product Name</th>
                  <th className="py-2 px-4 text-right">Pure Weight</th>
                  <th className="py-2 px-4 text-right">Pure Percent (%)</th>
                  <th className="py-2 px-4 text-right">Melting</th>
                  <th className="py-2 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.given.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{item.productName}</td>
                    <td className="py-2 px-4 text-right">{item.pureWeight}</td>
                    <td className="py-2 px-4 text-right">{item.purePercent}</td>
                    <td className="py-2 px-4 text-right">{item.melting}</td>
                    <td className="py-2 px-4 text-right">{item.total.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr>
                  <td colSpan={4} className="py-2 px-4"></td>
                  <td className="py-2 px-4 text-right font-medium">Total Pure Weight:</td>
                  <td className="py-2 px-4 text-right font-medium">
                    {receipt.given.totalPureWeight.toFixed(3)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-2 px-4"></td>
                  <td className="py-2 px-4 text-right font-medium">Grand Total (Net):</td>
                  <td className="py-2 px-4 text-right font-medium">
                    {receipt.given.total.toFixed(3)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Received Items Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Received Items</CardTitle>
          <p className="text-sm text-muted-foreground">Date: {formatDate(receipt.received.date)}</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">S.No.</th>
                  <th className="py-2 px-4 text-left">Product Name</th>
                  <th className="py-2 px-4 text-right">Final Ornaments Wt</th>
                  <th className="py-2 px-4 text-right">Stone Weight</th>
                  <th className="py-2 px-4 text-right">Making Charge (%)</th>
                  <th className="py-2 px-4 text-right">SubTotal</th>
                  <th className="py-2 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.received.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{item.productName}</td>
                    <td className="py-2 px-4 text-right">{item.finalOrnamentsWt}</td>
                    <td className="py-2 px-4 text-right">{item.stoneWeight}</td>
                    <td className="py-2 px-4 text-right">{item.makingChargePercent}</td>
                    <td className="py-2 px-4 text-right">{item.subTotal.toFixed(3)}</td>
                    <td className="py-2 px-4 text-right">{item.total.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr>
                  <td colSpan={2} className="py-2 px-4"></td>
                  <td className="py-2 px-4 text-right font-medium">
                    {receipt.received.totalOrnamentsWt.toFixed(3)}
                  </td>
                  <td className="py-2 px-4 text-right font-medium">
                    {receipt.received.totalStoneWeight.toFixed(3)}
                  </td>
                  <td className="py-2 px-4"></td>
                  <td className="py-2 px-4 text-right font-medium">
                    {receipt.received.totalSubTotal.toFixed(3)}
                  </td>
                  <td className="py-2 px-4 text-right font-medium">
                    {receipt.received.total.toFixed(3)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Calculation Section */}
      {receipt.manualCalculation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Manual Net Balance Calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manual Given Total</p>
                <p>{receipt.manualCalculation.givenTotal}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manual Received Total</p>
                <p>{receipt.manualCalculation.receivedTotal}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operation</p>
                <p>{getOperationText(receipt.manualCalculation.operation)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Result</p>
                <p className="font-medium">{receipt.manualCalculation.result.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
