
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Trash, Plus, Loader, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger, 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { ReceiptItem } from "@/models/Receipt";
import { receiptServices } from "@/services/api";

// Validation schema
const receiptItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  tag: z.string().optional(),
  grossWeight: z.number().positive({ message: "Must be positive" }),
  stoneWeight: z.number().min(0, { message: "Cannot be negative" }),
  meltingPercent: z
    .number()
    .min(0, { message: "Min 0%" })
    .max(100, { message: "Max 100%" }),
  stoneAmount: z.number().min(0, { message: "Cannot be negative" }).optional(),
});

const receiptFormSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  metalType: z.string().min(1, { message: "Metal type is required" }),
  overallWeight: z.number().positive({ message: "Must be positive" }).optional(),
  unit: z.string().optional(),
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
  previousPath?: string;
}

export function ReceiptForm({ defaultValues, client, receiptId, previousPath = "/receipts/select-client" }: ReceiptFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherId, setVoucherId] = useState(`RC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [metalType, setMetalType] = useState("Gold");
  const [items, setItems] = useState<ReceiptItem[]>([
    {
      id: uuidv4(),
      description: "",
      tag: "",
      grossWeight: 0,
      stoneWeight: 0,
      meltingPercent: 0,
      rate: 0,
      netWeight: 0,
      finalWeight: 0,
      amount: 0,
      stoneAmount: 0,
    },
  ]);
  const [overallWeight, setOverallWeight] = useState(0);

  // Generate a real voucher ID when component mounts
  useEffect(() => {
    const fetchVoucherId = async () => {
      try {
        const response = await receiptServices.generateVoucherId();
        if (response && response.voucherId) {
          setVoucherId(response.voucherId);
        }
      } catch (error) {
        console.error("Error fetching voucher ID:", error);
        // Keep the randomly generated one if API fails
      }
    };
    
    fetchVoucherId();
  }, []);

  // Initialize form with client data if provided
  const today = new Date();
  const initialValues = defaultValues || {
    date: today,
    metalType: metalType,
    overallWeight: 0,
    unit: "g",
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
    meltingPercent: number
  ) => {
    const netWeight = grossWeight - stoneWeight;
    const finalWeight = (netWeight * meltingPercent) / 100;
    
    return {
      netWeight,
      finalWeight,
    };
  };

  // Add a new item row
  const addItem = () => {
    const newItem: ReceiptItem = {
      id: uuidv4(),
      description: "",
      tag: "",
      grossWeight: 0,
      stoneWeight: 0,
      meltingPercent: 0,
      rate: 0,
      netWeight: 0,
      finalWeight: 0,
      amount: 0,
      stoneAmount: 0,
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
          if (["grossWeight", "stoneWeight", "meltingPercent"].includes(field)) {
            const { netWeight, finalWeight } = calculateDerivedValues(
              field === "grossWeight" ? value : item.grossWeight,
              field === "stoneWeight" ? value : item.stoneWeight,
              field === "meltingPercent" ? value : item.meltingPercent
            );
            
            updatedItem.netWeight = netWeight;
            updatedItem.finalWeight = finalWeight;
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
        grossWeight: acc.grossWeight + (Number(item.grossWeight) || 0),
        stoneWeight: acc.stoneWeight + (Number(item.stoneWeight) || 0),
        netWeight: acc.netWeight + (Number(item.netWeight) || 0),
        finalWeight: acc.finalWeight + (Number(item.finalWeight) || 0),
        stoneAmount: acc.stoneAmount + (Number(item.stoneAmount) || 0),
      };
    },
    { grossWeight: 0, stoneWeight: 0, netWeight: 0, finalWeight: 0, stoneAmount: 0 }
  );

  // Handle form submission
  const onSubmit = async (formData: ReceiptFormValues) => {
    console.log("Form submission started", { formData, client, items });
    setIsSubmitting(true);
    
    try {
      if (!client || !client.id) {
        toast({
          variant: "destructive",
          title: "Missing Client",
          description: "Please select a client before creating a receipt.",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare receipt data with the exact structure needed for MongoDB
      const receiptData = {
        clientId: client.id,
        clientName: client.clientName || "",
        shopName: client.shopName || "",
        phoneNumber: client.phoneNumber || "",
        metalType: formData.metalType,
        overallWeight: parseFloat(formData.overallWeight?.toString() || overallWeight.toString()),
        issueDate: formData.date,
        tableData: items.map((item) => ({
          itemName: item.description,
          tag: item.tag || "",
          grossWt: item.grossWeight.toString(),
          stoneWt: item.stoneWeight.toString(),
          meltingTouch: item.meltingPercent.toString(),
          stoneAmt: (item.stoneAmount || 0).toString(),
        })),
        voucherId: voucherId,
        totals: {
          grossWt: totals.grossWeight,
          stoneWt: totals.stoneWeight,
          netWt: totals.netWeight,
          finalWt: totals.finalWeight,
          stoneAmt: totals.stoneAmount,
        },
      };

      console.log("Saving receipt data:", JSON.stringify(receiptData));

      // Send data to the server with explicit conversion to JSON
      const result = await receiptServices.createReceipt(receiptData);
      console.log("Receipt creation result:", result);
      
      toast({
        title: "Receipt Created",
        description: `Receipt ${result.voucherId || voucherId} created successfully.`,
      });
      
      // Navigate back to receipts page
      navigate("/receipts");
    } catch (error) {
      console.error("Error saving receipt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save receipt: ${error.message || "Unknown error"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Receipt Details */}
        <div className="bg-background/50 p-6 rounded-md border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Receipt Details</h3>
            <div className="bg-primary/10 px-3 py-1 rounded-md text-primary font-medium">
              Voucher ID: {voucherId}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Metal Type */}
            <FormField
              control={form.control}
              name="metalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Metal Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setMetalType(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overall Weight */}
            <FormField
              control={form.control}
              name="overallWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Overall weight"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        field.onChange(value);
                        setOverallWeight(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ct">ct</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
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
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2 text-sm font-medium text-center">S.No.</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">Item Name</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">Tag</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">Gross (wt)</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">Stone (wt)</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">Net (wt)</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">M/T (%)</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">Final (wt)</th>
                  <th className="py-2 px-2 text-sm font-medium text-center">Stone Amt</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 px-2 text-center">{index + 1}</td>
                    <td className="py-2 px-2">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Item description"
                        className="bg-card border border-input"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        value={item.tag || ""}
                        onChange={(e) => updateItem(item.id, "tag", e.target.value)}
                        placeholder="Tag"
                        className="bg-card border border-input"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        value={item.grossWeight}
                        onChange={(e) => updateItem(item.id, "grossWeight", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-card border border-input text-center"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        value={item.stoneWeight}
                        onChange={(e) => updateItem(item.id, "stoneWeight", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-card border border-input text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      {item.netWeight.toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        value={item.meltingPercent}
                        onChange={(e) => updateItem(item.id, "meltingPercent", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-card border border-input text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      {item.finalWeight.toFixed(3)}
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        value={item.stoneAmount || 0}
                        onChange={(e) => updateItem(item.id, "stoneAmount", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-card border border-input text-center"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                        disabled={items.length === 1}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {/* Totals Row */}
                <tr className="font-medium bg-accent/20">
                  <td className="py-2 px-2 text-right" colSpan={3}>Totals</td>
                  <td className="py-2 px-2 text-center">{totals.grossWeight.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center">{totals.stoneWeight.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center">{totals.netWeight.toFixed(2)}</td>
                  <td className="py-2 px-2"></td>
                  <td className="py-2 px-2 text-center">{totals.finalWeight.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{totals.stoneAmount.toFixed(2)}</td>
                  <td className="py-2 px-2"></td>
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
            onClick={() => navigate(previousPath)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Receipt
          </Button>
        </div>
      </form>
    </Form>
  );
}
