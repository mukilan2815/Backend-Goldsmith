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
import { submitReceiptForm } from "./receipt-form-submit";

// Validation schema
const receiptItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  tag: z.string().optional(),
  grossWeight: z.coerce.number().positive({ message: "Must be positive" }),
  stoneWeight: z.coerce.number().min(0, { message: "Cannot be negative" }),
  meltingPercent: z.coerce
    .number()
    .min(0, { message: "Min 0%" })
    .max(100, { message: "Max 100%" }),
  stoneAmount: z.coerce.number().min(0, { message: "Cannot be negative" }).optional(),
});

const receiptFormSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  metalType: z.string().min(1, { message: "Metal type is required" }),
  overallWeight: z.coerce.number().positive({ message: "Must be positive" }).optional(),
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
    console.log("Form submission started with data:", formData);
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

      // Map form data to the expected submission format
      const submissionData = {
        client: {
          id: client.id,
          name: client.clientName,
          shopName: client.shopName,
          mobile: client.phoneNumber,
          address: client.address || "",
        },
        date: formData.date,
        metalType: formData.metalType,
        overallWeight: formData.overallWeight || overallWeight,
        voucherId: voucherId,
        items: items,
      };

      console.log("Submitting receipt:", JSON.stringify(submissionData));
      
      // Use the dedicated submit function
      const result = await submitReceiptForm(submissionData, navigate);
      
      if (!result) {
        setIsSubmitting(false);
      }
      // No need to set isSubmitting to false on success as the page will navigate away
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save receipt. Please try again.",
      });
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
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
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
                  <FormLabel>Metal Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setMetalType(value);
                    }}
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
                  <FormLabel>Overall Weight (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
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
            <h3 className="text-lg font-medium">Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2 text-left font-medium text-muted-foreground">Description</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Tag</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Gross Wt.</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Stone Wt.</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Net Wt.</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Melting %</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Final Wt.</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Stone Amt.</th>
                  <th className="p-2 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        placeholder="Tag"
                        value={item.tag}
                        onChange={(e) => updateItem(item.id, "tag", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={item.grossWeight}
                        onChange={(e) => updateItem(item.id, "grossWeight", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={item.stoneWeight}
                        onChange={(e) => updateItem(item.id, "stoneWeight", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        readOnly
                        value={item.netWeight.toFixed(2)}
                        className="bg-muted/30"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max="100"
                        value={item.meltingPercent}
                        onChange={(e) => updateItem(item.id, "meltingPercent", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        readOnly
                        value={item.finalWeight.toFixed(2)}
                        className="bg-muted/30"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={item.stoneAmount || 0}
                        onChange={(e) => updateItem(item.id, "stoneAmount", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-medium">
                  <td colSpan={2} className="p-2 text-right">
                    Totals:
                  </td>
                  <td className="p-2">
                    {totals.grossWeight.toFixed(2)}
                  </td>
                  <td className="p-2">
                    {totals.stoneWeight.toFixed(2)}
                  </td>
                  <td className="p-2">
                    {totals.netWeight.toFixed(2)}
                  </td>
                  <td className="p-2"></td>
                  <td className="p-2">
                    {totals.finalWeight.toFixed(2)}
                  </td>
                  <td className="p-2">
                    {totals.stoneAmount.toFixed(2)}
                  </td>
                  <td className="p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(previousPath)}
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
