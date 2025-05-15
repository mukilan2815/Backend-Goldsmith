
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { QuickLinks } from "@/components/quick-links";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background">
        <Sidebar 
          isOpen={true}
          onClose={() => {}}
        >
          <QuickLinks />
        </Sidebar>
        <div className="flex flex-1 flex-col min-h-screen max-h-screen overflow-y-auto">
          <Navbar onMenuClick={() => {}} />
          <main className="flex-1 pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
