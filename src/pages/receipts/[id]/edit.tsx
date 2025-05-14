
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptForm } from "@/components/receipts/receipt-form";

// Mock receipt data
const getReceipt = (id: string) => {
  const mockReceipts = [
    {
      id: "1",
      client: {
        id: "1",
        clientName: "John Smith",
        shopName: "Golden Creations",
        phoneNumber: "555-123-4567",
        address: "123 Jewel Street, Diamond City"
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
      ]
    },
    {
      id: "2",
      client: {
        id: "2",
        clientName: "Sarah Johnson",
        shopName: "Silver Linings",
        phoneNumber: "555-987-6543",
        address: "456 Precious Lane, Gold Town"
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
      ]
    }
  ];
  
  return mockReceipts.find(receipt => receipt.id === id);
};

export default function EditReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
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
          setReceipt(foundReceipt);
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

  // Transform receipt data to form values format
  const getFormValues = (receipt) => {
    if (!receipt) return null;

    return {
      clientName: receipt.client.clientName,
      shopName: receipt.client.shopName,
      mobile: receipt.client.phoneNumber,
      address: receipt.client.address || "",
      items: receipt.items,
    };
  };

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/receipts")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Receipts
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Edit Receipt</h1>
        <p className="text-muted-foreground">
          Update receipt information
        </p>
      </div>

      <div className="bg-card card-premium rounded-lg p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading receipt data...</span>
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-8">{error}</div>
        ) : receipt ? (
          <ReceiptForm 
            defaultValues={getFormValues(receipt)} 
            client={receipt.client} 
            receiptId={id} 
          />
        ) : null}
      </div>
    </div>
  );
}
