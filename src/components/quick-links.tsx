
import { NavLink } from "react-router-dom";
import { Plus, FileText, Receipt, ShieldCheck, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuickLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  delay?: number;
}

const QuickLinkItem = ({ icon, label, to, delay = 0 }: QuickLinkProps) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: delay, duration: 0.3 }}
  >
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
  </motion.div>
);

export const QuickLinks = () => {
  return (
    <div className="px-3 py-2">
      <motion.h3 
        className="mb-2 px-2 text-sm font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Quick Links
      </motion.h3>
      <div className="space-y-1">
        <QuickLinkItem
          icon={<User className="h-4 w-4" />}
          label="New Client"
          to="/clients/new"
          delay={0.1}
        />
        <QuickLinkItem
          icon={<Receipt className="h-4 w-4" />}
          label="Client Receipt"
          to="/receipts/select-client"
          delay={0.2}
        />
        <QuickLinkItem
          icon={<FileText className="h-4 w-4" />}
          label="Client Bills"
          to="/client-bills"
          delay={0.3}
        />
        <QuickLinkItem
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Admin Receipt"
          to="/admin-receipts"
          delay={0.4}
        />
        <QuickLinkItem
          icon={<CreditCard className="h-4 w-4" />}
          label="Admin Bill"
          to="/admin-bills"
          delay={0.5}
        />
      </div>
    </div>
  );
}
