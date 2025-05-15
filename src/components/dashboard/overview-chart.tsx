
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { analyticsServices } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#B066FE"];

export function ReceiptsTrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const startDate = new Date();
        startDate.setMonth(today.getMonth() - 5);
        startDate.setDate(1);
        
        const response = await analyticsServices.getSalesByDate(
          startDate.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        
        const processedData = processMonthlyData(response);
        setData(processedData);
      } catch (error) {
        console.error("Error fetching receipt trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processMonthlyData = (rawData) => {
    // Group by month
    const monthlyData = {};
    
    rawData.forEach(item => {
      const date = new Date(item.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          name: monthYear,
          receipts: 0,
          weight: 0
        };
      }
      
      monthlyData[monthYear].receipts += item.count;
      monthlyData[monthYear].weight += item.totalWeight;
    });
    
    return Object.values(monthlyData);
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle>Receipt Trends</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="receipts"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="weight"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function MetalTypeTrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await analyticsServices.getMetalTypeDistribution();
        setData(response);
      } catch (error) {
        console.error("Error fetching metal type distribution:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle>Metal Type Distribution</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function WeightProcessedChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const yearlyData = await analyticsServices.getYearlyComparison();
        
        // Process data for comparison chart
        const processedData = processYearlyData(yearlyData);
        setData(processedData);
      } catch (error) {
        console.error("Error fetching weight processed data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processYearlyData = (data) => {
    const { currentYear, previousYear } = data;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    return months.map((month, idx) => {
      const monthNum = idx + 1;
      
      const currYearData = currentYear.find(item => item.month === monthNum) || { totalWeight: 0 };
      const prevYearData = previousYear.find(item => item.month === monthNum) || { totalWeight: 0 };
      
      return {
        name: month,
        currentYear: currYearData.totalWeight,
        previousYear: prevYearData.totalWeight,
      };
    });
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle>Weight Processed - Yearly Comparison</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentYear" name="Current Year" fill="#8884d8" />
              <Bar dataKey="previousYear" name="Previous Year" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
