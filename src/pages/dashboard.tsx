
import { ArrowUp, Users, FileText, ShoppingBag, LineChart, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to GoldCraft Business Management
          </p>
        </div>
        <div className="space-x-2 mt-4 md:mt-0">
          <Button onClick={() => navigate("/clients/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
          <Button variant="outline" onClick={() => navigate("/clients")}>
            <Users className="mr-2 h-4 w-4" /> View Clients
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              +8 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Transacted</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">358.2g</div>
            <p className="text-xs text-muted-foreground">
              +42.5g from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8g</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 inline mr-1" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card className="overflow-hidden card-premium">
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>
              Newly added clients in the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 bg-muted h-9 w-9 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Michael Brown - Gem Masters
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Added May 10, 2024
                  </p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/clients/3")}
                  >
                    View
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 bg-muted h-9 w-9 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Sarah Johnson - Silver Linings
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Added May 1, 2024
                  </p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/clients/2")}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden card-premium">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest transactions and client interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 bg-muted h-9 w-9 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New Receipt Created
                  </p>
                  <p className="text-sm text-muted-foreground">
                    John Smith - Gold Chain (18.7g)
                  </p>
                </div>
                <div className="ml-auto flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 bg-muted h-9 w-9 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New Client Added
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Michael Brown - Gem Masters
                  </p>
                </div>
                <div className="ml-auto flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 bg-muted h-9 w-9 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Admin Receipt Created
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sarah Johnson - Old Gold Exchange
                  </p>
                </div>
                <div className="ml-auto flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
