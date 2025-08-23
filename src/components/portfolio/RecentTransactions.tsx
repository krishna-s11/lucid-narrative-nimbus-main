import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, RefreshCw, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface Transaction {
  id: string | number;
  type: "buy" | "sell";
  symbol: string;
  amount: number;
  price: number;
  usd_value: number;
  timestamp: number;
  status: string;
  fee: { cost: number; currency: string };
  order_id: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function RecentTransactions({ 
  transactions: propTransactions, 
  isLoading: propIsLoading,
  onRefresh 
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [transactionSummary, setTransactionSummary] = useState({
    total_trades: 0,
    total_volume: 0,
    successful_trades: 0,
    failed_trades: 0
  });

  // Fetch real transaction data
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const [transactionsData, summaryData] = await Promise.all([
        apiService.getUserTransactions(20),
        apiService.getTransactionSummary()
      ]);
      
      setTransactions(transactionsData);
      setTransactionSummary(summaryData);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Only show toast for manual refresh, not auto-refresh
      if (propIsLoading === false && !propTransactions) {
        if (transactionsData.length > 0) {
          toast.success(`Updated ${transactionsData.length} transactions`);
        } else {
          toast.info('No transactions found');
        }
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Only show error toast for manual refresh
      if (propIsLoading === false && !propTransactions) {
        toast.error('Failed to fetch transaction data');
      }
      // Set empty arrays if API fails
      setTransactions([]);
      setTransactionSummary({
        total_trades: 0,
        total_volume: 0,
        successful_trades: 0,
        failed_trades: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchTransactions();
    
    // Refresh every 60 seconds (less frequent than trending coins)
    const interval = setInterval(fetchTransactions, 60000);
    return () => clearInterval(interval);
  }, []);

  // Use prop data if provided, otherwise use fetched data
  const displayTransactions = propTransactions || transactions;
  const displayIsLoading = propIsLoading || isLoading;

  const formatTime = (timestamp: number) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (displayIsLoading) {
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
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Latest trading activity</span>
              {lastUpdated && (
                <>
                  <span>•</span>
                  <span>Updated: {lastUpdated}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {transactionSummary.total_trades > 0 && (
              <div className="text-right text-xs">
                <div className="text-success font-medium">
                  {transactionSummary.successful_trades} successful
                </div>
                <div className="text-muted-foreground">
                  ${transactionSummary.total_volume.toLocaleString()} volume
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTransactions}
              disabled={isLoading}
              className="p-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {displayTransactions.length > 0 ? (
          <div className="space-y-3">
            {displayTransactions.slice(0, 5).map((transaction) => (
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
                      <TrendingDown className="h-5 w-5" />
                    ) : (
                      <TrendingUp className="h-5 w-5" />
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
                      {transaction.fee.cost > 0 && (
                        <>
                          <span>•</span>
                          <span>Fee: {transaction.fee.cost} {transaction.fee.currency}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-sm">
                    {transaction.amount.toFixed(6)} {transaction.symbol.split('/')[0]}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      @ {formatCurrency(transaction.price)}
                    </p>
                    <p className="text-xs font-medium text-primary">
                      {formatCurrency(transaction.usd_value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {displayTransactions.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  +{displayTransactions.length - 5} more transactions
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent transactions</p>
            <p className="text-xs">Your trading activity will appear here</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}