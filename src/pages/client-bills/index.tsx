
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ClientBillsPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Bills</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Client bills will be displayed here. This page is currently under development.</p>
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
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
