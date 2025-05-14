
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Pencil,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Building,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

// Mock receipts data
const mockReceipts = [
  {
    id: "r1",
    issueDate: "2024-05-01T10:00:00Z",
    metalType: "Gold",
    totals: {
      grossWt: 25.5,
      stoneWt: 2.3,
      netWt: 23.2,
      finalWt: 21.344,
      stoneAmt: 15000,
    },
    clientId: "1",
  },
  {
    id: "r2",
    issueDate: "2024-05-10T14:30:00Z",
    metalType: "Gold",
    totals: {
      grossWt: 18.7,
      stoneWt: 1.5,
      netWt: 17.2,
      finalWt: 15.824,
      stoneAmt: 12000,
    },
    clientId: "1",
  },
];

export default function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchClient = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Find client by ID
        const foundClient = initialClients.find((c) => c.id === id);
        if (foundClient) {
          setClient(foundClient);
          
          // Find receipts for this client
          const clientReceipts = mockReceipts.filter(r => r.clientId === id);
          setReceipts(clientReceipts);
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
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/clients")}
        className="mb-6 -ml-3"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">{client.clientName}</h1>
          <p className="text-muted-foreground">{client.shopName}</p>
        </div>
        <Button
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          variant="outline"
          className="mt-4 md:mt-0"
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit Client
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contact Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-3">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{client.phoneNumber}</span>
            </div>
            {client.address && (
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1 shrink-0" />
                <span>{client.address}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Business Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-3">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{client.shopName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                Client since {new Date(client.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-3">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{receipts.length} Receipts</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Active Customer</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receipts">
        <TabsList className="mb-6">
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="admin-receipts">Admin Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts">
          <Card className="card-premium">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle>Client Receipts</CardTitle>
                  <CardDescription>
                    All receipts issued to this client
                  </CardDescription>
                </div>
                <Button className="mt-4 md:mt-0">
                  <FileText className="mr-2 h-4 w-4" /> Create New Receipt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {receipts.length > 0 ? (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Metal Type</TableHead>
                        <TableHead>Gross Wt (g)</TableHead>
                        <TableHead>Net Wt (g)</TableHead>
                        <TableHead>Final Wt (g)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell>
                            {new Date(receipt.issueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{receipt.metalType}</TableCell>
                          <TableCell>{receipt.totals.grossWt.toFixed(2)}</TableCell>
                          <TableCell>{receipt.totals.netWt.toFixed(2)}</TableCell>
                          <TableCell>{receipt.totals.finalWt.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No receipts found for this client
                  </p>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" /> Create First Receipt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Client Bills</CardTitle>
              <CardDescription>
                All bills issued to this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-12">
                <p className="text-muted-foreground">
                  No bills found for this client
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin-receipts">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Admin Receipts</CardTitle>
              <CardDescription>
                All admin receipts involving this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-12">
                <p className="text-muted-foreground">
                  No admin receipts found for this client
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
