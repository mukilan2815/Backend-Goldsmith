
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for clients
const initialClients = [
  {
    id: "1",
    name: "John Smith",
    shopName: "Golden Creations",
    mobile: "555-123-4567",
    address: "123 Jewel Street, Diamond City",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    shopName: "Silver Linings",
    mobile: "555-987-6543",
    address: "456 Precious Lane, Gold Town",
  },
  {
    id: "3",
    name: "Michael Brown",
    shopName: "Gem Masters",
    mobile: "555-456-7890",
    address: "789 Crystal Avenue, Platinum Heights",
  },
  {
    id: "4",
    name: "Emma Wilson",
    shopName: "Royal Jewels",
    mobile: "555-321-7654",
    address: "101 Crown Road, Emerald Valley",
  },
  {
    id: "5",
    name: "David Lee",
    shopName: "Precious Metals",
    mobile: "555-789-0123",
    address: "202 Gold Street, Ruby City",
  },
];

export default function ClientSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState(initialClients);

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.mobile.includes(searchTerm)
  );

  // Select client and navigate to receipt creation
  const selectClient = (client) => {
    navigate("/receipts/new", { 
      state: { 
        client,
        from: location.pathname // Store the current path to return to when cancelled
      } 
    });
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
        <h1 className="text-3xl font-serif font-bold">Select Client</h1>
        <p className="text-muted-foreground">
          Choose a client to create a receipt for
        </p>
      </div>

      <div className="bg-card card-premium rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name, shop name or phone number"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate("/clients/new")}>
            <UserPlus className="mr-2 h-4 w-4" /> New Client
          </Button>
        </div>

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.shopName}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.mobile}</TableCell>
                    <TableCell className="max-w-xs truncate">{client.address}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => selectClient(client)}
                        size="sm"
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    {searchTerm ? "No clients match your search" : "No clients found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
