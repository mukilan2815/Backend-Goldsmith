
import { useState } from "react";
import {
  Users,
  FileSpreadsheet,
  Weight,
  FileText,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  ReceiptsTrendChart,
  MetalTypeTrendChart,
  WeightProcessedChart,
} from "@/components/dashboard/overview-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("this-month");

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your goldsmith business
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Clients"
          value="124"
          description="Active clients"
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Receipts"
          value="348"
          description="All receipts"
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Admin Receipts"
          value="156"
          description="Special receipts"
          icon={<FileSpreadsheet className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Weight"
          value="1,450 g"
          description="Gold processed"
          icon={<Weight className="h-4 w-4" />}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ReceiptsTrendChart />
        <MetalTypeTrendChart />
      </div>

      <div className="mb-8">
        <WeightProcessedChart />
      </div>

      {/* Recent Activity */}
      <div className="bg-card card-premium rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-medium">Recent Activity</h2>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="receipts">Receipts</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {/* Activity Item */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-md hover:bg-accent/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                {i % 2 === 0 ? (
                  <FileText className="h-5 w-5 text-gold" />
                ) : (
                  <Users className="h-5 w-5 text-gold" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {i % 2 === 0
                    ? `New receipt created for Client #${i * 10}`
                    : `New client added: Client #${i * 10}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {i % 2 === 0 ? "Receipt #1234" : "By Admin"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
