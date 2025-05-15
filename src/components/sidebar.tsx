import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  FileSpreadsheet,
  BarChart3,
  Settings,
  FilePlus,
  User,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode; // Add children to the props
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  isCollapsed?: boolean;
  hasSubmenu?: boolean;
  children?: React.ReactNode;
}

function SidebarItem({
  href,
  icon,
  title,
  isActive,
  isCollapsed,
  hasSubmenu = false,
  children,
}: SidebarItemProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  useEffect(() => {
    if (isActive && hasSubmenu) {
      setIsSubmenuOpen(true);
    }
  }, [isActive, hasSubmenu]);

  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  if (hasSubmenu) {
    return (
      <div>
        <Link
          to={href}
          onClick={toggleSubmenu}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-accent text-accent-foreground font-medium"
          )}
        >
          {icon}
          {!isCollapsed && (
            <>
              <span className="grow">{title}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-all",
                  isSubmenuOpen && "transform rotate-90"
                )}
              />
            </>
          )}
        </Link>
        {isSubmenuOpen && !isCollapsed && (
          <div className="pl-4 mt-1 space-y-1">{children}</div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium"
      )}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
    </Link>
  );
}

export function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 w-64 border-r bg-background transition-transform duration-300 ease-in-out",
          isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gold flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-serif font-bold">G</span>
            </div>
            <h1 className="font-serif font-bold text-lg gold-gradient">
              GoldCraft
            </h1>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          {/* This is where we add the children prop */}
          {children}
          
          <div className="px-3 py-2 space-y-1">
            <SidebarItem
              href="/"
              icon={<Home className="h-4 w-4" />}
              title="Dashboard"
              isActive={location.pathname === "/"}
            />
            
            <SidebarItem
              href="/clients"
              icon={<Users className="h-4 w-4" />}
              title="Clients"
              isActive={location.pathname.startsWith("/clients")}
              hasSubmenu
            >
              <SidebarItem
                href="/clients"
                icon={<User className="h-4 w-4" />}
                title="Client List"
                isActive={location.pathname === "/clients"}
              />
              <SidebarItem
                href="/clients/new"
                icon={<FilePlus className="h-4 w-4" />}
                title="Add Client"
                isActive={location.pathname === "/clients/new"}
              />
            </SidebarItem>
            
            <SidebarItem
              href="/receipts"
              icon={<FileSpreadsheet className="h-4 w-4" />}
              title="Receipts"
              isActive={location.pathname.startsWith("/receipts")}
              hasSubmenu
            >
              <SidebarItem
                href="/receipts"
                icon={<FileSpreadsheet className="h-4 w-4" />}
                title="Regular Receipts"
                isActive={location.pathname === "/receipts"}
              />
              <SidebarItem
                href="/receipts/admin"
                icon={<FileSpreadsheet className="h-4 w-4" />}
                title="Admin Receipts"
                isActive={location.pathname === "/receipts/admin"}
              />
              <SidebarItem
                href="/receipts/new"
                icon={<FilePlus className="h-4 w-4" />}
                title="New Receipt"
                isActive={location.pathname === "/receipts/new"}
              />
            </SidebarItem>
            
            <SidebarItem
              href="/reports"
              icon={<BarChart3 className="h-4 w-4" />}
              title="Reports"
              isActive={location.pathname === "/reports"}
            />
            
            <Separator className="my-2" />
            
            <SidebarItem
              href="/settings"
              icon={<Settings className="h-4 w-4" />}
              title="Settings"
              isActive={location.pathname === "/settings"}
            />
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
