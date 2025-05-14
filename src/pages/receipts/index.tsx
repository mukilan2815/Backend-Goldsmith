
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Eye, Edit, Trash, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for receipts
const initialReceipts = [
  {
    id: "1",
    client: {
      id: "1",
      name: "John Smith",
      shopName: "Golden Creations",
      mobile: "555-123-4567",
      address: "123 Jewel Street, Diamond City",
    },
    totalGrossWeight: 25.5,
    totalStoneWeight: 5.2,
    totalNetWeight: 20.3,
    totalFinalWeight: 18.7,
    totalAmount: 93500,
    createdAt: "2024-05-10T09:30:00Z",
  },
  {
    id: "2",
    client: {
      id: "2",
      name: "Sarah Johnson",
      shopName: "Silver Linings",
      mobile: "555-987-6543",
      address: "456 Precious Lane, Gold Town",
    },
    totalGrossWeight: 18.7,
    totalStoneWeight: 3.2,
    totalNetWeight: 15.5,
    totalFinalWeight: 14.3,
    totalAmount: 71500,
    createdAt: "2024-05-12T14:45:00Z",
  },
  {
    id: "3",
    client: {
      id: "3",
      name: "Michael Brown",
      shopName: "Gem Masters",
      mobile: "555-456-7890",
      address: "789 Crystal Avenue, Platinum Heights",
    },
    totalGrossWeight: 32.1,
    totalStoneWeight: 8.4,
    totalNetWeight: 23.7,
    totalFinalWeight: 21.8,
    totalAmount: 109000,
    createdAt: "2024-05-14T11:15:00Z",
  },
];

export default function ReceiptsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState(initialReceipts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);

  // Filter receipts based on search term and filter type
  const filteredReceipts = receipts.filter((receipt) => {
    const searchLower = searchTerm.toLowerCase();
    let matches = true;
    
    // Search term filter
    if (searchTerm) {
      matches =
        receipt.client.name.toLowerCase().includes(searchLower) ||
        receipt.client.shopName.toLowerCase().includes(searchLower) ||
        receipt.client.mobile.includes(searchTerm);
      
      if (!matches) return false;
    }
    
    // Type filter
    // For now, we don't have receipt types, but this could be implemented later
    
    return matches;
  });

  const handleCreateReceipt = () => {
    navigate("/receipts/new");
  };

  const handleViewReceipt = (id: string) => {
    navigate(`/receipts/${id}`);
  };

  const handleEditReceipt = (id: string) => {
    navigate(`/receipts/${id}/edit`);
  };

  const openDeleteDialog = (id: string) => {
    setReceiptToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReceipt = () => {
    if (!receiptToDelete) return;
    
    // In a real app, this would make an API call
    setReceipts(receipts.filter((receipt) => receipt.id !== receiptToDelete));
    
    toast({
      title: "Receipt Deleted",
      description: "The receipt has been successfully removed.",
    });
    
    setDeleteDialogOpen(false);
    setReceiptToDelete(null);
  };

  const handleDownloadPDF = (id: string) => {
    toast({
      title: "PDF Download",
      description: "PDF download feature will be implemented soon.",
    });
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Receipts</h1>
          <p className="text-muted-foreground">
            Manage your client receipts
          </p>
        </div>
        <Button onClick={handleCreateReceipt} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Create Receipt
        </Button>
      </div>

      <div className="bg-card card-premium rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name, shop name or phone number"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Receipts</SelectItem>
              <SelectItem value="regular">Regular Receipts</SelectItem>
              <SelectItem value="admin">Admin Receipts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Gross Wt (g)</TableHead>
                <TableHead className="text-right">Final Wt (g)</TableHead>
                <TableHead className="text-right">Total Amount (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.client.shopName}</TableCell>
                    <TableCell>{receipt.client.name}</TableCell>
                    <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{receipt.totalGrossWeight.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{receipt.totalFinalWeight.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{receipt.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewReceipt(receipt.id)}
                          title="View Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditReceipt(receipt.id)}
                          title="Edit Receipt"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadPDF(receipt.id)}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(receipt.id)}
                          title="Delete Receipt"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {searchTerm ? "No receipts match your search" : "No receipts found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReceipt}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
