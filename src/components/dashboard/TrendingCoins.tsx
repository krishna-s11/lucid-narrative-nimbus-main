import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendingCoin {
  symbol: string;
  volume: number;
  last: number;
  change?: number;
}

interface TrendingCoinsProps {
  coins: TrendingCoin[];
  isLoading?: boolean;
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

export function TrendingCoins({ coins, isLoading = false }: TrendingCoinsProps) {
  if (isLoading) {
    return (
      <Card className="crypto-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold gradient-text">Trending Coins</h3>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
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
          </div>
        </div>
        <div className="space-y-4">
          {coins.slice(0, 5).map((coin, index) => (
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
                  <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <span>Vol:</span>
                    <span className="font-medium">{(coin.volume / 1000000).toFixed(1)}M</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${coin.last.toFixed(2)}</p>
                {coin.change && (
                  <p className={cn(
                    "text-sm flex items-center justify-end space-x-1 font-medium",
                    coin.change > 0 ? "text-success" : "text-danger"
                  )}>
                    {coin.change > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}