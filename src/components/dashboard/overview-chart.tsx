
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "Jan",
    receipts: 5,
    weight: 240,
    adminReceipts: 2,
    gold: 120,
    silver: 80,
    platinum: 40,
  },
  {
    name: "Feb",
    receipts: 8,
    weight: 290,
    adminReceipts: 3,
    gold: 140,
    silver: 90,
    platinum: 60,
  },
  {
    name: "Mar",
    receipts: 12,
    weight: 350,
    adminReceipts: 5,
    gold: 180,
    silver: 100,
    platinum: 70,
  },
  {
    name: "Apr",
    receipts: 9,
    weight: 330,
    adminReceipts: 4,
    gold: 160,
    silver: 110,
    platinum: 60,
  },
  {
    name: "May",
    receipts: 15,
    weight: 400,
    adminReceipts: 6,
    gold: 200,
    silver: 120,
    platinum: 80,
  },
  {
    name: "Jun",
    receipts: 18,
    weight: 450,
    adminReceipts: 7,
    gold: 220,
    silver: 140,
    platinum: 90,
  },
];

export function ReceiptsTrendChart() {
  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle>Receipts Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Line
              type="monotone"
              dataKey="receipts"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="adminReceipts"
              stroke="hsl(var(--gold))"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MetalTypeTrendChart() {
  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle>Metal Type Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Bar dataKey="gold" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="silver"
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="platinum"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function WeightProcessedChart() {
  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle>Weight Processed</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--gold-dark))"
              fill="hsl(var(--gold-light))"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
