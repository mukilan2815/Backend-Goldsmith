
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminBillsPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Bills</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Admin bills will be displayed here. This page is currently under development.</p>
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <div className="py-4 text-center">
              <p>No admin bills found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBillsPage;
