
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
      <div className="h-16 w-16 rounded-full bg-gold flex items-center justify-center shadow-md mb-6">
        <span className="text-white text-2xl font-serif font-bold">G</span>
      </div>
      <h1 className="text-4xl font-serif font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground text-center mb-6">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate("/")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Button>
    </div>
  );
}
