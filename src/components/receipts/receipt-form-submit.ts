
import { toast } from "@/hooks/use-toast";
import { receiptServices } from "@/services/receipt-services";
import { ReceiptItem } from "@/models/Receipt";

export interface ReceiptFormData {
  client: {
    id: string;
    name: string;
    shopName: string;
    mobile: string;
    address?: string;
  };
  date: Date;
  metalType: string;
  overallWeight?: number;
  voucherId?: string;
  items: ReceiptItem[];
}

export async function submitReceiptForm(formData: ReceiptFormData, navigate: (path: string) => void) {
  console.log("Receipt form submission started with data:", formData);
  
  try {
    if (!formData.client || !formData.client.id) {
      toast({
        variant: "destructive",
        title: "Missing Client",
        description: "Please select a client before creating a receipt.",
      });
      return false;
    }

    // Calculate totals from items
    const totals = formData.items.reduce(
      (acc, item) => {
        return {
          grossWt: acc.grossWt + (Number(item.grossWeight) || 0),
          stoneWt: acc.stoneWt + (Number(item.stoneWeight) || 0),
          netWt: acc.netWt + (Number(item.netWeight) || 0),
          finalWt: acc.finalWt + (Number(item.finalWeight) || 0),
          stoneAmt: acc.stoneAmt + (Number(item.stoneAmount) || 0),
        };
      },
      { grossWt: 0, stoneWt: 0, netWt: 0, finalWt: 0, stoneAmt: 0 }
    );

    // Prepare receipt data in exact format expected by backend
    const receiptData = {
      clientId: formData.client.id,
      clientName: formData.client.name || "",
      shopName: formData.client.shopName || "",
      phoneNumber: formData.client.mobile || "",
      metalType: formData.metalType,
      overallWeight: formData.overallWeight || 0,
      issueDate: formData.date,
      voucherId: formData.voucherId,
      tableData: formData.items.map((item) => ({
        itemName: item.description,
        tag: item.tag || "",
        // Explicitly convert numeric values to strings as required by the MongoDB schema
        grossWt: item.grossWeight.toString(),
        stoneWt: item.stoneWeight.toString(),
        meltingTouch: item.meltingPercent.toString(),
        stoneAmt: (item.stoneAmount || 0).toString()
      })),
      totals: {
        grossWt: totals.grossWt,
        stoneWt: totals.stoneWt,
        netWt: totals.netWt,
        finalWt: totals.finalWt,
        stoneAmt: totals.stoneAmt
      }
    };

    console.log("Submitting receipt data to server:", JSON.stringify(receiptData));

    // Send data to the server
    const result = await receiptServices.createReceipt(receiptData);
    console.log("Receipt creation successful:", result);
    
    toast({
      title: "Receipt Created",
      description: `Receipt ${result.voucherId || formData.voucherId} created successfully.`,
    });
    
    // Navigate back to receipts page
    navigate("/receipts");
    return true;
  } catch (error) {
    console.error("Error saving receipt:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to save receipt: ${error.message || "Unknown error"}`,
    });
    return false;
  }
}
