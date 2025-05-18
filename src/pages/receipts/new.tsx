
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptForm } from "@/components/receipts/receipt-form";

export default function NewReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [previousPath, setPreviousPath] = useState("/receipts/select-client");

  // Check if client data was passed via location state
  useEffect(() => {
    if (location.state?.client) {
      setClient(location.state.client);
    }
    
    // Store the previous path if it exists in the state
    if (location.state?.from) {
      setPreviousPath(location.state.from);
    }
  }, [location]);

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
        <h1 className="text-3xl font-serif font-bold">Create New Receipt</h1>
        <p className="text-muted-foreground">
          {client 
            ? `Creating receipt for ${client.shopName}`
            : "Create a new receipt by filling out the form below"}
        </p>
      </div>

      <div className="bg-card card-premium rounded-lg p-6">
        <ReceiptForm client={client} previousPath={previousPath} />
      </div>
    </div>
  );
}
