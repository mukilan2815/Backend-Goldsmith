
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { billServices } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Eye, Download, Trash2, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ClientBill {
  _id: string;
  clientInfo: {
    clientName: string;
    shopName: string;
    phoneNumber: string;
  };
  metalType: string;
  issueDate: string;
  totals: {
    finalWt: number;
    stoneAmt: number;
  };
  voucherId: string;
}

const ClientBillsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [billsPerPage] = useState(10);
  
  const {
    data: bills,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['clientBills'],
    queryFn: billServices.getBills,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await billServices.deleteBill(id);
        toast({
          title: "Success",
          description: "Bill deleted successfully",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete bill",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await billServices.downloadBill(id);
      toast({
        title: "Success",
        description: "Bill download initiated",
      });
      // In a real application, we would handle the PDF download here
      console.log(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download bill",
        variant: "destructive",
      });
    }
  };

  // Filter bills based on search term
  const filteredBills = bills 
    ? bills.filter((bill: ClientBill) => 
        bill.clientInfo.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.clientInfo.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.voucherId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Calculate pagination
  const indexOfLastBill = page * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Bills</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Bills</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by client name, shop name or voucher ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : isError ? (
            <p className="text-center py-4 text-destructive">
              Error loading bills. Please try again later.
            </p>
          ) : currentBills.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voucher ID</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Shop Name</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Metal Type</TableHead>
                      <TableHead>Final Weight</TableHead>
                      <TableHead>Stone Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBills.map((bill: ClientBill) => (
                      <TableRow key={bill._id}>
                        <TableCell>{bill.voucherId}</TableCell>
                        <TableCell>{bill.clientInfo.clientName}</TableCell>
                        <TableCell>{bill.clientInfo.shopName}</TableCell>
                        <TableCell>
                          {new Date(bill.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{bill.metalType}</TableCell>
                        <TableCell>{bill.totals.finalWt.toFixed(2)} g</TableCell>
                        <TableCell>${bill.totals.stoneAmt.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/receipts/${bill._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(bill._id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(bill._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="py-4 text-center">
              <p>No client bills found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBillsPage;
