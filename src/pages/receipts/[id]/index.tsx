
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Download, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Receipt } from "@/models/Receipt";

// Mock receipt data retrieval function
const getReceipt = (id: string) => {
  const mockReceipts = [
    {
      id: "1",
      client: {
        id: "1",
        name: "John Smith",
        shopName: "Golden Creations",
        mobile: "555-123-4567",
        address: "123 Jewel Street, Diamond City",
      },
      items: [
        {
          id: "item1",
          description: "Gold Ring",
          grossWeight: 12.5,
          stoneWeight: 2.3,
          meltingPercent: 92,
          rate: 5000,
          netWeight: 10.2,
          finalWeight: 9.38,
          amount: 46900
        },
        {
          id: "item2",
          description: "Gold Chain",
          grossWeight: 18.7,
          stoneWeight: 0,
          meltingPercent: 91.6,
          rate: 4800,
          netWeight: 18.7,
          finalWeight: 17.13,
          amount: 82224
        }
      ],
      totalGrossWeight: 31.2,
      totalStoneWeight: 2.3,
      totalNetWeight: 28.9,
      totalFinalWeight: 26.51,
      totalAmount: 129124,
      createdAt: "2024-05-10T09:30:00Z",
      updatedAt: "2024-05-10T09:30:00Z",
    },
    {
      id: "2",
      client: {
        id: "2",
        name: "Sarah Johnson",
        shopName: "Silver Linings",
        mobile: "555-987-6543",
        address: "456 Precious Lane, Gold Town",
      },
      items: [
        {
          id: "item3",
          description: "Silver Bracelet",
          grossWeight: 28.4,
          stoneWeight: 3.2,
          meltingPercent: 92.5,
          rate: 800,
          netWeight: 25.2,
          finalWeight: 23.31,
          amount: 18648
        }
      ],
      totalGrossWeight: 28.4,
      totalStoneWeight: 3.2,
      totalNetWeight: 25.2,
      totalFinalWeight: 23.31,
      totalAmount: 18648,
      createdAt: "2024-05-12T14:45:00Z",
      updatedAt: "2024-05-12T14:45:00Z",
    }
  ];
  
  return mockReceipts.find(receipt => receipt.id === id);
};

export default function ReceiptDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Receipt ID is missing");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      setTimeout(() => {
        const foundReceipt = getReceipt(id);
        if (foundReceipt) {
          setReceipt(foundReceipt as Receipt);
        } else {
          setError("Receipt not found");
        }
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError("Failed to load receipt data");
      setIsLoading(false);
    }
  }, [id]);

  const handleDownloadPDF = () => {
    // This would be implemented with a library like jsPDF
    console.log("Download PDF for receipt:", id);
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center py-20">
          <Loader className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading receipt details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center text-destructive py-8">{error}</div>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/receipts")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Receipts
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Receipt Details</h1>
          <p className="text-muted-foreground">
            {receipt.client.shopName} - {receipt.client.name}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline"
            onClick={() => navigate(`/receipts/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Receipt
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <div className="bg-card card-premium rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Receipt Items</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-1 text-sm font-medium">Description</th>
                    <th className="text-right py-2 px-1 text-sm font-medium">Gross Wt (g)</th>
                    <th className="text-right py-2 px-1 text-sm font-medium">Stone Wt (g)</th>
                    <th className="text-right py-2 px-1 text-sm font-medium">Melting %</th>
                    <th className="text-right py-2 px-1 text-sm font-medium">Rate (₹/g)</th>
                    <th className="text-right py-2 px-1 text-sm font-medium">Net Wt (g)</th>
                    <th className="text-right py-2 px-1 text-sm font-medium">Final Wt (g)</th>
                    <th className="text-right py-2 px-1 text-sm font-medium">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-2 px-1">{item.description}</td>
                      <td className="py-2 px-1 text-right">{item.grossWeight.toFixed(2)}</td>
                      <td className="py-2 px-1 text-right">{item.stoneWeight.toFixed(2)}</td>
                      <td className="py-2 px-1 text-right">{item.meltingPercent.toFixed(1)}</td>
                      <td className="py-2 px-1 text-right">{item.rate.toLocaleString()}</td>
                      <td className="py-2 px-1 text-right">{item.netWeight.toFixed(2)}</td>
                      <td className="py-2 px-1 text-right">{item.finalWeight.toFixed(2)}</td>
                      <td className="py-2 px-1 text-right">{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Totals Row */}
                  <tr className="font-medium bg-accent/20">
                    <td className="py-2 px-1 text-left">Totals</td>
                    <td className="py-2 px-1 text-right">{receipt.totalGrossWeight.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right">{receipt.totalStoneWeight.toFixed(2)}</td>
                    <td className="py-2 px-1"></td>
                    <td className="py-2 px-1"></td>
                    <td className="py-2 px-1 text-right">{receipt.totalNetWeight.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right">{receipt.totalFinalWeight.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right">{receipt.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-card card-premium rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium mb-4">Client Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Shop Name</p>
                <p className="font-medium">{receipt.client.shopName}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Client Name</p>
                <p className="font-medium">{receipt.client.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-medium">{receipt.client.mobile}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{receipt.client.address || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-card card-premium rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Receipt Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Receipt ID</p>
                <p className="font-medium">{receipt.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Created On</p>
                <p className="font-medium">
                  {new Date(receipt.createdAt).toLocaleDateString()} {" "}
                  {new Date(receipt.createdAt).toLocaleTimeString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(receipt.updatedAt).toLocaleDateString()} {" "}
                  {new Date(receipt.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
