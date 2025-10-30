import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, subMonths, startOfDay, endOfDay, startOfMonth } from "date-fns";
import { hr } from "date-fns/locale";
import { CalendarCheck, TrendingUp, Clock, Users, DollarSign, Euro } from "lucide-react";

interface DailyStats {
  date: string;
  count: number;
  revenue: number;
}

interface MonthlyStats {
  date: string;
  count: number;
  revenue: number;
}

const AnalyticsTab = () => {
  const [loading, setLoading] = useState(true);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [yearlyData, setYearlyData] = useState<MonthlyStats[]>([]);
  const [monthlyData, setMonthlyData] = useState<DailyStats[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    // Get total completed reservations and revenue
    const { data: allCompleted } = await supabase
      .from("reservations")
      .select("service_price")
      .eq("status", "completed");

    setTotalCompleted(allCompleted?.length || 0);
    setTotalRevenue(allCompleted?.reduce((sum, r) => sum + (r.service_price || 0), 0) || 0);

    // Get today's completed reservations and revenue
    const today = new Date();
    const { data: todayCompleted } = await supabase
      .from("reservations")
      .select("service_price")
      .eq("status", "completed")
      .gte("reservation_date", format(startOfDay(today), "yyyy-MM-dd"))
      .lte("reservation_date", format(endOfDay(today), "yyyy-MM-dd"));

    setTodayCompleted(todayCompleted?.length || 0);
    setTodayRevenue(todayCompleted?.reduce((sum, r) => sum + (r.service_price || 0), 0) || 0);

    // Get last 30 days completed reservations and revenue
    const thirtyDaysAgo = subDays(today, 30);
    const { data: last30Days } = await supabase
      .from("reservations")
      .select("service_price")
      .eq("status", "completed")
      .gte("reservation_date", format(thirtyDaysAgo, "yyyy-MM-dd"));

    setMonthlyTotal(last30Days?.length || 0);
    setMonthlyRevenue(last30Days?.reduce((sum, r) => sum + (r.service_price || 0), 0) || 0);

    // Get last 30 days data for trend chart
    const { data: last30DaysData } = await supabase
      .from("reservations")
      .select("reservation_date, service_price")
      .eq("status", "completed")
      .gte("reservation_date", format(thirtyDaysAgo, "yyyy-MM-dd"))
      .order("reservation_date");

    // Group by date for 30-day trend
    const grouped30Days: { [key: string]: { count: number; revenue: number } } = {};
    last30DaysData?.forEach((res) => {
      const date = res.reservation_date;
      if (!grouped30Days[date]) {
        grouped30Days[date] = { count: 0, revenue: 0 };
      }
      grouped30Days[date].count += 1;
      grouped30Days[date].revenue += res.service_price || 0;
    });

    // Create array for last 30 days
    const monthlyChartData: DailyStats[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      monthlyChartData.push({
        date: format(date, "dd.MM", { locale: hr }),
        count: grouped30Days[dateStr]?.count || 0,
        revenue: grouped30Days[dateStr]?.revenue || 0,
      });
    }

    setMonthlyData(monthlyChartData);

    // Get last 12 months data for yearly chart
    const { data: yearlyReservations } = await supabase
      .from("reservations")
      .select("reservation_date, service_price")
      .eq("status", "completed")
      .gte("reservation_date", format(subMonths(today, 12), "yyyy-MM-dd"))
      .order("reservation_date");

    // Group by month
    const groupedMonthly: { [key: string]: { count: number; revenue: number } } = {};
    yearlyReservations?.forEach((res) => {
      const monthKey = format(new Date(res.reservation_date), "yyyy-MM");
      if (!groupedMonthly[monthKey]) {
        groupedMonthly[monthKey] = { count: 0, revenue: 0 };
      }
      groupedMonthly[monthKey].count += 1;
      groupedMonthly[monthKey].revenue += res.service_price || 0;
    });

    // Create array for last 12 months
    const yearlyChartData: MonthlyStats[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(today, i);
      const monthKey = format(date, "yyyy-MM");
      yearlyChartData.push({
        date: format(date, "MMM", { locale: hr }),
        count: groupedMonthly[monthKey]?.count || 0,
        revenue: groupedMonthly[monthKey]?.revenue || 0,
      });
    }

    setYearlyData(yearlyChartData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Učitavanje statistike...</p>
      </div>
    );
  }

  const chartConfig = {
    count: {
      label: "Rezervacije",
      color: "hsl(var(--primary))",
    },
    revenue: {
      label: "Prihod (€)",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno završeno</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground">Svih vremena</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupan prihod</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Svih vremena</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCompleted}</div>
            <p className="text-xs text-muted-foreground">€{todayRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ovaj mjesec</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTotal}</div>
            <p className="text-xs text-muted-foreground">€{monthlyRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zadnjih 12 mjeseci</CardTitle>
          <CardDescription>Rezervacije i prihod po mjesecima</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-sm"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis 
                  yAxisId="left"
                  className="text-sm"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  className="text-sm"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  yAxisId="left"
                  dataKey="count" 
                  fill="var(--color-count)" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="revenue" 
                  fill="var(--color-revenue)" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend - Zadnjih 30 dana</CardTitle>
          <CardDescription>Linijski prikaz rezervacija i prihoda</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-sm"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis 
                  yAxisId="left"
                  className="text-sm"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  className="text-sm"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--color-count)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-count)", r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-revenue)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-revenue)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
