import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface TrendingCoin {
  symbol: string;
  volume: number;
  last: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  bid: number;
  ask: number;
  timestamp: number;
}

interface TrendingCoinsProps {
  coins?: TrendingCoin[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Coin logo mapping
const getCoinLogo = (symbol: string) => {
  const coinSymbol = symbol.split('/')[0].toLowerCase();
  const logoMap: { [key: string]: string } = {
    'btc': '₿',
    'eth': 'Ξ',
    'bnb': 'BNB',
    'ada': '₳',
    'xrp': 'XRP',
    'dot': '●',
    'uni': '🦄',
    'link': '🔗',
    'ltc': 'Ł',
    'sol': '◉',
    'matic': '◊',
    'avax': '🔺',
  };
  return logoMap[coinSymbol] || coinSymbol.charAt(0).toUpperCase();
};

const getCoinColor = (symbol: string) => {
  const coinSymbol = symbol.split('/')[0].toLowerCase();
  const colorMap: { [key: string]: string } = {
    'btc': 'text-orange-400',
    'eth': 'text-blue-400',
    'bnb': 'text-yellow-400',
    'ada': 'text-blue-500',
    'xrp': 'text-blue-300',
    'dot': 'text-pink-400',
    'uni': 'text-purple-400',
    'link': 'text-purple-500',
    'ltc': 'text-gray-400',
    'sol': 'text-purple-600',
    'matic': 'text-purple-400',
    'avax': 'text-red-400',
  };
  return colorMap[coinSymbol] || 'text-primary';
};

export function TrendingCoins({ coins: propCoins, isLoading: propIsLoading, onRefresh }: TrendingCoinsProps) {
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch trending coins data
  const fetchTrendingCoins = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getTrendingCoins();
      setCoins(data);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Only show toast for manual refresh, not auto-refresh
      if (propIsLoading === false && !propCoins) {
        // This is a manual refresh, show success toast
        toast.success(`Updated ${data.length} trending coins`);
      }
    } catch (error) {
      console.error('Failed to fetch trending coins:', error);
      // Only show error toast for manual refresh
      if (propIsLoading === false && !propCoins) {
        toast.error('Failed to fetch trending coins data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchTrendingCoins();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTrendingCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  // Use prop data if provided, otherwise use fetched data
  const displayCoins = propCoins || coins;
  const displayIsLoading = propIsLoading || isLoading;

  if (displayIsLoading) {
    return (
      <Card className="crypto-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold gradient-text">Trending Coins</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse p-3 rounded-lg bg-card/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="w-16 h-4 bg-muted rounded" />
                    <div className="w-12 h-3 bg-muted rounded" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="w-20 h-4 bg-muted rounded" />
                  <div className="w-16 h-3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="crypto-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold gradient-text">Trending Coins</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                • {lastUpdated}
              </span>
            )}
            <button
              onClick={fetchTrendingCoins}
              disabled={isLoading}
              className="p-1 hover:bg-primary/10 rounded transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {displayCoins.slice(0, 5).map((coin, index) => (
            <div 
              key={coin.symbol} 
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/70 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
                    "bg-gradient-to-br from-card to-card/50 border border-border group-hover:scale-110",
                    getCoinColor(coin.symbol)
                  )}>
                    {getCoinLogo(coin.symbol)}
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">#{index + 1}</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    {coin.symbol}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center space-x-1">
                      <span>Vol:</span>
                      <span className="font-medium">{(coin.volume / 1000000).toFixed(1)}M</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      H: ${coin.high_24h?.toFixed(2) || '--'} | L: ${coin.low_24h?.toFixed(2) || '--'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">${coin.last.toFixed(2)}</p>
                <div className="space-y-1">
                  {coin.change_24h !== undefined && (
                    <p className={cn(
                      "text-sm flex items-center justify-end space-x-1 font-medium",
                      coin.change_24h > 0 ? "text-success" : "text-danger"
                    )}>
                      {coin.change_24h > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{coin.change_24h > 0 ? '+' : ''}{coin.change_24h.toFixed(2)}%</span>
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Bid: ${coin.bid?.toFixed(2) || '--'} | Ask: ${coin.ask?.toFixed(2) || '--'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayCoins.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No trending data available</p>
            <p className="text-xs">Market data will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
}