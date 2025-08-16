import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WalletBalanceProps {
  totalAssets: number;
  roi: number;
  totalLoss: number;
  portfolio?: Array<{
    id: number;
    btc_amount: number;
    purchase_price: number;
    created_at: string;
  }>;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WalletBalance({ 
  totalAssets, 
  roi, 
  totalLoss, 
  portfolio = [], 
  isLoading = false,
  onRefresh 
}: WalletBalanceProps) {
  const [isHidden, setIsHidden] = useState(false);
  
  // Calculate additional metrics from portfolio data
  const totalBtcAmount = portfolio.reduce((sum, item) => sum + item.btc_amount, 0);
  const avgPurchasePrice = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + item.purchase_price, 0) / portfolio.length 
    : 0;
  
  const formatCurrency = (amount: number) => {
    if (isHidden) return "••••••";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatBtc = (amount: number) => {
    if (isHidden) return "••••••";
    return `${amount.toFixed(8)} BTC`;
  };

  if (isLoading) {
    return (
      <Card className="crypto-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-32 h-6 bg-muted rounded" />
            <div className="w-8 h-8 bg-muted rounded" />
          </div>
          <div className="w-48 h-10 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full h-16 bg-muted rounded" />
            <div className="w-full h-16 bg-muted rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="premium-card p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5" />
      
      <div className="relative space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/20 backdrop-blur-sm flex-shrink-0">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold gradient-text truncate">Wallet Balance</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">Total Portfolio Value</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHidden(!isHidden)}
              className="p-2"
            >
              {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
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
        </div>

        {/* Main Balance */}
        <div className="space-y-2">
          <div className="text-2xl sm:text-4xl font-bold gradient-text break-all">
            {formatCurrency(totalAssets)}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Badge 
              variant={roi >= 0 ? "default" : "destructive"}
              className={cn(
                "flex items-center space-x-1 w-fit",
                roi >= 0 ? "bg-success/20 text-success hover:bg-success/30" : "bg-danger/20 text-danger hover:bg-danger/30"
              )}
            >
              {roi >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{roi >= 0 ? '+' : ''}{roi.toFixed(2)}% ROI</span>
            </Badge>
            {totalLoss > 0 && (
              <Badge variant="outline" className="text-muted-foreground w-fit">
                Loss: {formatCurrency(totalLoss)}
              </Badge>
            )}
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">BTC Holdings</p>
            <p className="text-lg sm:text-xl font-bold break-all">{formatBtc(totalBtcAmount)}</p>
          </div>
          
          <div className="p-3 sm:p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Avg. Purchase Price</p>
            <p className="text-lg sm:text-xl font-bold break-all">{formatCurrency(avgPurchasePrice)}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Portfolio Items</span>
            <span className="font-medium">{portfolio.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Status</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                roi >= 0 ? "text-success border-success/50" : "text-warning border-warning/50"
              )}
            >
              {roi >= 0 ? "Profitable" : "At Loss"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}