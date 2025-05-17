
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminReceiptsPage = () => {
  const [isLoading, setIsLoading] = useState(false);

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
          <p>Admin receipts will be displayed here. This page is currently under development.</p>
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <div className="py-4 text-center">
              <p>No admin receipts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReceiptsPage;
