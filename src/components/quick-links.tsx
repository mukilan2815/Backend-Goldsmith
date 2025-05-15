
import { NavLink } from "react-router-dom";
import { Plus, FileText, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const QuickLinkItem = ({ icon, label, to }: QuickLinkProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export const QuickLinks = () => {
  return (
    <div className="px-3 py-2">
      <h3 className="mb-2 px-2 text-sm font-semibold">Quick Links</h3>
      <div className="space-y-1">
        <QuickLinkItem
          icon={<Plus className="h-4 w-4" />}
          label="New Client"
          to="/clients/new"
        />
        <QuickLinkItem
          icon={<FileText className="h-4 w-4" />}
          label="Client Receipt"
          to="/receipts/select-client"
        />
        <QuickLinkItem
          icon={<BarChart3 className="h-4 w-4" />}
          label="Client Bill"
          to="/client-bills"
        />
        <QuickLinkItem
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Admin Receipt"
          to="/admin-receipts"
        />
        <QuickLinkItem
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Admin Bill"
          to="/admin-bills"
        />
      </div>
    </div>
  );
}
