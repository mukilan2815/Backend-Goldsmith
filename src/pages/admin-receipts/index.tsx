
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { adminReceiptServices } from "@/services/api";
import { Eye, Trash2, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminReceipt {
  _id: string;
  clientName: string;
  status: 'complete' | 'incomplete' | 'empty';
  voucherId: string;
  createdAt: string;
  updatedAt: string;
  given: {
    date: string;
    total: number;
  };
  received: {
    date: string;
    total: number;
  };
}

const AdminReceiptsPage = () => {
  const [page, setPage] = useState(1);
  const [receiptsPerPage] = useState(10);
  
  const {
    data: adminReceipts,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['adminReceipts'],
    queryFn: adminReceiptServices.getAdminReceipts
  });
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin receipt?')) {
      try {
        await adminReceiptServices.deleteAdminReceipt(id);
        toast({
          title: "Success",
          description: "Admin receipt deleted successfully",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete admin receipt",
          variant: "destructive",
        });
      }
    }
  };
  
  // Calculate pagination
  const indexOfLastReceipt = page * receiptsPerPage;
  const indexOfFirstReceipt = indexOfLastReceipt - receiptsPerPage;
  const currentReceipts = adminReceipts ? 
    adminReceipts.slice(indexOfFirstReceipt, indexOfLastReceipt) : [];
  const totalPages = adminReceipts ? 
    Math.ceil(adminReceipts.length / receiptsPerPage) : 0;
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Receipts</h1>
        <Button asChild>
          <Link to="/admin-receipts/new">New Admin Receipt</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : isError ? (
            <p className="text-center py-4 text-destructive">
              Error loading admin receipts. Please try again later.
            </p>
          ) : adminReceipts && adminReceipts.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voucher ID</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Given Date</TableHead>
                      <TableHead>Received Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReceipts.map((receipt: AdminReceipt) => (
                      <TableRow key={receipt._id}>
                        <TableCell>{receipt.voucherId}</TableCell>
                        <TableCell>{receipt.clientName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                            receipt.status === 'complete' ? 'bg-green-100 text-green-800' :
                            receipt.status === 'incomplete' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {receipt.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(receipt.given.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(receipt.received.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin-receipts/${receipt._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin-receipts/${receipt._id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(receipt._id)}
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
              <p>No admin receipts found</p>
              <Button asChild className="mt-4">
                <Link to="/admin-receipts/new">Create New Admin Receipt</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReceiptsPage;
