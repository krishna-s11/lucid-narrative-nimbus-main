import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  type: "buy" | "sell";
  symbol: string;
  amount: number;
  price: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Mock data for demonstration - replace with real API data
const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: "buy",
    symbol: "BTC/USDT",
    amount: 0.156,
    price: 43247.85,
    timestamp: "2024-01-18T10:30:00Z",
    status: "completed"
  },
  {
    id: 2,
    type: "sell",
    symbol: "ETH/USDT",
    amount: 2.45,
    price: 2634.92,
    timestamp: "2024-01-18T09:15:00Z",
    status: "completed"
  },
  {
    id: 3,
    type: "buy",
    symbol: "SOL/USDT",
    amount: 15.8,
    price: 98.43,
    timestamp: "2024-01-18T08:45:00Z",
    status: "completed"
  },
  {
    id: 4,
    type: "buy",
    symbol: "BNB/USDT",
    amount: 8.5,
    price: 318.76,
    timestamp: "2024-01-18T07:20:00Z",
    status: "completed"
  },
  {
    id: 5,
    type: "sell",
    symbol: "ADA/USDT",
    amount: 1250,
    price: 0.487,
    timestamp: "2024-01-17T16:20:00Z",
    status: "completed"
  },
  {
    id: 6,
    type: "buy",
    symbol: "XRP/USDT",
    amount: 890,
    price: 0.628,
    timestamp: "2024-01-17T14:10:00Z",
    status: "completed"
  },
  {
    id: 7,
    type: "sell",
    symbol: "MATIC/USDT",
    amount: 750,
    price: 0.876,
    timestamp: "2024-01-17T11:35:00Z",
    status: "completed"
  }
];

export function RecentTransactions({ 
  transactions = mockTransactions, 
  isLoading = false,
  onRefresh 
}: RecentTransactionsProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className="crypto-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse p-3 rounded-lg bg-card/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="space-y-1">
                  <div className="w-20 h-4 bg-muted rounded" />
                  <div className="w-16 h-3 bg-muted rounded" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="w-16 h-4 bg-muted rounded" />
                <div className="w-12 h-3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="premium-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold gradient-text">Recent Transactions</h3>
            <p className="text-xs text-muted-foreground">Latest trading activity</p>
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

        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/70 transition-all duration-300 border border-border/50 hover:border-border group"
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                  transaction.type === "buy" 
                    ? "bg-success/20 text-success" 
                    : "bg-danger/20 text-danger"
                )}>
                  {transaction.type === "buy" ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {transaction.type.toUpperCase()} {transaction.symbol}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        transaction.status === "completed" && "text-success border-success/50",
                        transaction.status === "pending" && "text-warning border-warning/50",
                        transaction.status === "failed" && "text-danger border-danger/50"
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(transaction.timestamp)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-sm">
                  {transaction.amount} {transaction.symbol.split('/')[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  @ ${transaction.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent transactions</p>
            <p className="text-xs">Your trading activity will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
}