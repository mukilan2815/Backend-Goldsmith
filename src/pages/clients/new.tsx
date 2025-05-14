
import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Add New Client</h1>
        <p className="text-muted-foreground">
          Register a new client for your goldsmith business
        </p>
      </div>

      <div className="bg-card card-premium rounded-lg p-6">
        <ClientForm />
      </div>
    </div>
  );
}
