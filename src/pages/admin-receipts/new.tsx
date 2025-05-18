
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminReceiptForm } from "@/components/admin-receipts/admin-receipt-form";

export default function NewAdminReceiptPage() {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-serif font-bold">Create New Admin Receipt</h1>
        <p className="text-muted-foreground">
          Create a new admin receipt by filling out the form below
        </p>
      </div>

      <div className="bg-card card-premium rounded-lg p-6">
        <AdminReceiptForm />
      </div>
    </div>
  );
}
