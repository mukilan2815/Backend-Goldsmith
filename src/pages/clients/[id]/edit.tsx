
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// The initial clients mock data - would be from API
const initialClients = [
  {
    id: "1",
    shopName: "Golden Creations",
    clientName: "John Smith",
    phoneNumber: "555-123-4567",
    address: "123 Jewel Street, Diamond City",
    createdAt: "2024-04-15T10:30:00Z",
  },
  {
    id: "2",
    shopName: "Silver Linings",
    clientName: "Sarah Johnson",
    phoneNumber: "555-987-6543",
    address: "456 Precious Lane, Gold Town",
    createdAt: "2024-05-01T14:45:00Z",
  },
  {
    id: "3",
    shopName: "Gem Masters",
    clientName: "Michael Brown",
    phoneNumber: "555-456-7890",
    address: "789 Crystal Avenue, Platinum Heights",
    createdAt: "2024-05-10T09:15:00Z",
  },
];

// Define the form validation schema
const clientFormSchema = z.object({
  shopName: z.string().min(1, { message: "Shop name is required" }),
  clientName: z.string().min(1, { message: "Client name is required" }),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\+?[0-9\s\-()]+$/, {
      message: "Please enter a valid phone number",
    }),
  address: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function EditClientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      shopName: "",
      clientName: "",
      phoneNumber: "",
      address: "",
    },
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Find client by ID
        const client = initialClients.find((c) => c.id === id);
        if (client) {
          // Set form values
          form.reset({
            shopName: client.shopName,
            clientName: client.clientName,
            phoneNumber: client.phoneNumber,
            address: client.address || "",
          });
        } else {
          toast({
            title: "Client not found",
            description: "The requested client could not be found.",
            variant: "destructive",
          });
          navigate("/clients");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load client details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, navigate, toast, form]);

  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call to update the client
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Client updated",
        description: "Client information has been updated successfully.",
      });

      navigate(`/clients/${id}`);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating the client.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/clients/${id}`)}
        className="mb-6 -ml-3"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Client Details
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Edit Client</h1>
        <p className="text-muted-foreground">
          Update client information
        </p>
      </div>

      <div className="bg-card card-premium rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter shop name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
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
                    <Textarea
                      placeholder="Enter client address (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/clients/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
