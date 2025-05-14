
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// This would be replaced with an API call to fetch actual clients
const initialClients = [
  {
    id: "1",
    shopName: "Golden Creations",
    clientName: "John Smith",
    phoneNumber: "555-123-4567",
    address: "123 Jewel Street, Diamond City",
  },
  {
    id: "2",
    shopName: "Silver Linings",
    clientName: "Sarah Johnson",
    phoneNumber: "555-987-6543",
    address: "456 Precious Lane, Gold Town",
  },
  {
    id: "3",
    shopName: "Gem Masters",
    clientName: "Michael Brown",
    phoneNumber: "555-456-7890",
    address: "789 Crystal Avenue, Platinum Heights",
  },
];

export default function ClientSelectionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    shopName: "",
    clientName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    // In a real app, this would be an API call with the MONGO_URI
    // Something like: fetch('/api/clients')
    
    // Simulate API call
    setTimeout(() => {
      setClients(initialClients);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter clients based on search filters
  const filteredClients = clients.filter((client) => {
    const shopNameMatch = client.shopName.toLowerCase().includes(searchFilters.shopName.toLowerCase());
    const clientNameMatch = client.clientName.toLowerCase().includes(searchFilters.clientName.toLowerCase());
    const phoneMatch = client.phoneNumber.includes(searchFilters.phoneNumber);
    
    return shopNameMatch && clientNameMatch && phoneMatch;
  });

  const handleCreateReceipt = (client) => {
    navigate("/receipts/new", { state: { client } });
  };

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Client Receipt - Select Client</h1>
        <p className="text-muted-foreground">
          Filter and select a client. Client data will be loaded from MongoDB once configured.
        </p>
      </div>

      <div className="bg-card card-premium rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Input
              placeholder="Filter by Shop Name"
              value={searchFilters.shopName}
              onChange={(e) => setSearchFilters({...searchFilters, shopName: e.target.value})}
            />
          </div>
          <div className="relative">
            <Input
              placeholder="Filter by Client Name"
              value={searchFilters.clientName}
              onChange={(e) => setSearchFilters({...searchFilters, clientName: e.target.value})}
            />
          </div>
          <div className="relative">
            <Input
              placeholder="Filter by Phone Number"
              value={searchFilters.phoneNumber}
              onChange={(e) => setSearchFilters({...searchFilters, phoneNumber: e.target.value})}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading clients...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4">
                    <div>
                      <h3 className="text-lg font-semibold">{client.clientName}</h3>
                      <p className="text-sm text-muted-foreground">Shop: {client.shopName}</p>
                      <p className="text-sm text-muted-foreground">Phone: {client.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">Address: {client.address}</p>
                    </div>
                    <Button 
                      onClick={() => handleCreateReceipt(client)}
                      className="mt-4 md:mt-0"
                    >
                      Create Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>No clients match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
