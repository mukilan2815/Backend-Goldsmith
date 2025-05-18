
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminReceiptForm } from "@/components/admin-receipts/admin-receipt-form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock client data for demo
const mockClients = [
  { id: "1001", name: "Golden Creations" },
  { id: "1002", name: "Silver Linings" },
  { id: "1003", name: "Gem Masters" },
  { id: "1004", name: "Platinum Plus" },
  { id: "1005", name: "Diamond Designs" }
];

export default function NewAdminReceiptPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Filter clients based on search term
  const filteredClients = mockClients.filter(
    client => client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.id.includes(searchTerm)
  );

  // Select a client and proceed to the form
  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/admin-receipts")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Receipts
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">
          {selectedClient ? `Admin Receipt for: ${selectedClient.name}` : "Create New Admin Receipt"}
        </h1>
        <p className="text-muted-foreground">
          {selectedClient 
            ? "Manage given and received items. Data will be saved to the database once configured."
            : "First, select a client to create a receipt for."}
        </p>
      </div>

      {!selectedClient ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
            <div className="relative flex-1 mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by client name or ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Client ID</th>
                    <th className="py-2 px-4 text-left">Client Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="border-b">
                        <td className="py-2 px-4">{client.id}</td>
                        <td className="py-2 px-4">{client.name}</td>
                        <td className="py-2 px-4 text-right">
                          <Button onClick={() => handleSelectClient(client)}>
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-muted-foreground">
                        No clients found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card card-premium rounded-lg p-6">
          <AdminReceiptForm selectedClient={selectedClient} />
        </div>
      )}
    </div>
  );
}
