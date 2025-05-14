
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { X, Plus, Loader, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ReceiptItem } from "@/models/Receipt";

// Validation schema
const receiptItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  grossWeight: z.number().positive({ message: "Must be positive" }),
  stoneWeight: z.number().min(0, { message: "Cannot be negative" }),
  meltingPercent: z
    .number()
    .min(0, { message: "Min 0%" })
    .max(100, { message: "Max 100%" }),
  rate: z.number().positive({ message: "Must be positive" }),
});

const receiptFormSchema = z.object({
  clientName: z.string().min(1, { message: "Client name is required" }),
  shopName: z.string().min(1, { message: "Shop name is required" }),
  mobile: z.string().min(1, { message: "Mobile number is required" }),
  address: z.string().optional(),
  metalType: z.string().min(1, { message: "Metal type is required" }),
  items: z.array(receiptItemSchema).min(1, { message: "Add at least one item" }).refine(
    (items) => {
      return items.every((item) => item.stoneWeight <= item.grossWeight);
    },
    {
      message: "Stone weight cannot exceed gross weight",
      path: ["items"],
    }
  ),
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

interface ReceiptFormProps {
  defaultValues?: ReceiptFormValues;
  client?: {
    id: string;
    shopName: string;
    clientName: string;
    phoneNumber: string;
    address?: string;
  };
  receiptId?: string;
}

export function ReceiptForm({ defaultValues, client, receiptId }: ReceiptFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherId, setVoucherId] = useState(`RC-${Math.floor(100000 + Math.random() * 900000)}`); // Generate random voucher ID
  const [metalType, setMetalType] = useState("Gold");
  const [items, setItems] = useState<ReceiptItem[]>([
    {
      id: uuidv4(),
      description: "",
      grossWeight: 0,
      stoneWeight: 0,
      meltingPercent: 0,
      rate: 0,
      netWeight: 0,
      finalWeight: 0,
      amount: 0,
    },
  ]);

  // Initialize form with client data if provided
  const initialValues = defaultValues || {
    clientName: client?.clientName || "",
    shopName: client?.shopName || "",
    mobile: client?.phoneNumber || "",
    address: client?.address || "",
    metalType: metalType,
    items: items,
  };

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: initialValues,
  });

  // Calculate derived values
  const calculateDerivedValues = (
    grossWeight: number,
    stoneWeight: number,
    meltingPercent: number,
    rate: number
  ) => {
    const netWeight = grossWeight - stoneWeight;
    const finalWeight = (netWeight * meltingPercent) / 100;
    const amount = finalWeight * rate;
    
    return {
      netWeight,
      finalWeight,
      amount,
    };
  };

  // Add a new item row
  const addItem = () => {
    const newItem: ReceiptItem = {
      id: uuidv4(),
      description: "",
      grossWeight: 0,
      stoneWeight: 0,
      meltingPercent: 0,
      rate: 0,
      netWeight: 0,
      finalWeight: 0,
      amount: 0,
    };
    
    setItems([...items, newItem]);
  };

  // Remove an item row
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      toast({
        variant: "destructive",
        title: "Cannot remove",
        description: "At least one item is required",
      });
    }
  };

  // Update an item field
  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate derived values if needed
          if (["grossWeight", "stoneWeight", "meltingPercent", "rate"].includes(field)) {
            const { netWeight, finalWeight, amount } = calculateDerivedValues(
              field === "grossWeight" ? value : item.grossWeight,
              field === "stoneWeight" ? value : item.stoneWeight,
              field === "meltingPercent" ? value : item.meltingPercent,
              field === "rate" ? value : item.rate
            );
            
            updatedItem.netWeight = netWeight;
            updatedItem.finalWeight = finalWeight;
            updatedItem.amount = amount;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Calculate totals
  const totals = items.reduce(
    (acc, item) => {
      return {
        grossWeight: acc.grossWeight + item.grossWeight,
        stoneWeight: acc.stoneWeight + item.stoneWeight,
        netWeight: acc.netWeight + item.netWeight,
        finalWeight: acc.finalWeight + item.finalWeight,
        amount: acc.amount + item.amount,
      };
    },
    { grossWeight: 0, stoneWeight: 0, netWeight: 0, finalWeight: 0, amount: 0 }
  );

  // Handle form submission
  const onSubmit = async (formData: ReceiptFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare receipt data with calculated values
      const receiptData = {
        id: receiptId || uuidv4(),
        voucherId: voucherId,
        clientId: client?.id || uuidv4(),
        clientInfo: {
          name: formData.clientName,
          shopName: formData.shopName,
          phoneNumber: formData.mobile,
          address: formData.address || "",
        },
        metalType: formData.metalType || metalType,
        items: items.map((item) => ({
          itemName: item.description,
          tag: "",  // Optional tag field
          grossWt: item.grossWeight,
          stoneWt: item.stoneWeight,
          meltingTouch: item.meltingPercent,
          stoneAmt: 0, // Default to 0 for now
          netWt: item.netWeight,
          finalWt: item.finalWeight,
        })),
        totals: {
          grossWt: totals.grossWeight,
          stoneWt: totals.stoneWeight,
          netWt: totals.netWeight,
          finalWt: totals.finalWeight,
          stoneAmt: 0, // Default to 0 for now
        },
        issueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real app, this would call an API endpoint
      // await fetch('/api/receipts', { 
      //   method: 'POST', 
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(receiptData) 
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: receiptId ? "Receipt Updated" : "Receipt Created",
        description: `Receipt ${voucherId} ${receiptId ? "updated" : "created"} successfully.`,
      });
      
      // Navigate back to receipts page
      navigate("/receipts");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save receipt. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate PDF
  const generatePDF = () => {
    toast({
      title: "PDF Generation",
      description: "PDF download functionality will be implemented soon.",
    });
    // PDF generation logic will be implemented in a separate function
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Voucher ID */}
        <div className="bg-background/50 p-6 rounded-md border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Receipt Details</h3>
            <div className="bg-primary/10 px-3 py-1 rounded-md text-primary font-medium">
              Voucher ID: {voucherId}
            </div>
          </div>

          {/* Metal Type */}
          <div className="mb-6">
            <FormLabel>Metal Type</FormLabel>
            <div className="flex gap-2">
              {["Gold", "Silver", "Platinum"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={metalType === type ? "default" : "outline"}
                  onClick={() => setMetalType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-background/50 p-6 rounded-md border">
          <h3 className="text-lg font-medium mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Client name"
                      {...field}
                      readOnly={!!client} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="shopName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Shop name"
                      {...field}
                      readOnly={!!client} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Mobile number"
                      {...field}
                      readOnly={!!client} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Address"
                      {...field}
                      readOnly={!!client} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-background/50 p-6 rounded-md border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Receipt Items</h3>
            <Button
              type="button" 
              onClick={addItem}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

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
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 px-1">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Item description"
                        className="border-0 bg-transparent p-1 h-8 focus-visible:ring-0"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        value={item.grossWeight}
                        onChange={(e) => updateItem(item.id, "grossWeight", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="border-0 bg-transparent p-1 h-8 focus-visible:ring-0 text-right"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        value={item.stoneWeight}
                        onChange={(e) => updateItem(item.id, "stoneWeight", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="border-0 bg-transparent p-1 h-8 focus-visible:ring-0 text-right"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        value={item.meltingPercent}
                        onChange={(e) => updateItem(item.id, "meltingPercent", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="border-0 bg-transparent p-1 h-8 focus-visible:ring-0 text-right"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="border-0 bg-transparent p-1 h-8 focus-visible:ring-0 text-right"
                      />
                    </td>
                    <td className="py-2 px-1 text-right">
                      {item.netWeight.toFixed(2)}
                    </td>
                    <td className="py-2 px-1 text-right">
                      {item.finalWeight.toFixed(2)}
                    </td>
                    <td className="py-2 px-1 text-right">
                      {item.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                        disabled={items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {/* Totals Row */}
                <tr className="font-medium bg-accent/20">
                  <td className="py-2 px-1 text-left">Totals</td>
                  <td className="py-2 px-1 text-right">{totals.grossWeight.toFixed(2)}</td>
                  <td className="py-2 px-1 text-right">{totals.stoneWeight.toFixed(2)}</td>
                  <td className="py-2 px-1"></td>
                  <td className="py-2 px-1"></td>
                  <td className="py-2 px-1 text-right">{totals.netWeight.toFixed(2)}</td>
                  <td className="py-2 px-1 text-right">{totals.finalWeight.toFixed(2)}</td>
                  <td className="py-2 px-1 text-right">{totals.amount.toFixed(2)}</td>
                  <td className="py-2 px-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/receipts")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={generatePDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Receipt
          </Button>
        </div>
      </form>
    </Form>
  );
}
