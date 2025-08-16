import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw, Calendar, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState } from "react";

interface ChartDataPoint {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  chartData: {
    data: ChartDataPoint[];
  } | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function PortfolioChart({ chartData, isLoading = false, onRefresh }: PortfolioChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7D');
  
  const periods = [
    { label: '1D', value: '1D' },
    { label: '7D', value: '7D' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' }
  ];

  // Calculate performance metrics
  const data = chartData?.data || [];
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const changePercent = firstValue > 0 ? ((change / firstValue) * 100) : 0;
  const isPositive = change >= 0;

  // Format data for chart
  const formattedData = data.map((point, index) => ({
    ...point,
    formattedDate: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    index
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="crypto-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
          <div className="animate-pulse w-8 h-8 bg-muted rounded" />
        </div>
        <div className="h-80 bg-muted/20 rounded-lg animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="premium-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold gradient-text">Portfolio Performance</h3>
              <p className="text-xs text-muted-foreground">Total value over time</p>
            </div>
          </div>
          
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Value</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(lastValue)}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Period Change</span>
            </div>
            <div className="flex items-center space-x-2">
              <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{formatCurrency(change)}
              </p>
              <Badge 
                variant={isPositive ? "default" : "destructive"}
                className={`flex items-center space-x-1 ${
                  isPositive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                }`}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center space-x-2 mb-4">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={`text-xs ${
                selectedPeriod === period.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-primary/10'
              }`}
            >
              {period.label}
            </Button>
          ))}
        </div>
        
        {/* Chart */}
        <div className="h-80 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#portfolioGradient)"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No portfolio data available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add some holdings to see your performance
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Legend */}
        {data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Portfolio Value</span>
                </div>
                <div className="text-muted-foreground">
                  Period: {periods.find(p => p.value === selectedPeriod)?.label}
                </div>
              </div>
              <div className="text-muted-foreground">
                Data points: {data.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}