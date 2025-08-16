import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, TrendingUp, TrendingDown, PlayCircle, Info, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Trade {
  order_id: string;
  status: string;
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  message: string;
  timestamp: number;
  profit_loss?: number;
  executed_price?: number;
}

interface Portfolio {
  [symbol: string]: {
    quantity: number;
    average_price: number;
    total_value: number;
  };
}

// Mock market prices
const MOCK_PRICES: { [key: string]: number } = {
  'BTCUSDT': 43250.50,
  'ETHUSDT': 2580.75,
  'BNBUSDT': 315.20,
  'ADAUSDT': 0.485,
  'SOLUSDT': 98.65,
  'XRPUSDT': 0.625,
  'DOGEUSDT': 0.082,
  'MATICUSDT': 0.875,
  'LINKUSDT': 15.75,
  'AVAXUSDT': 38.90,
};

const TradeSimulation: React.FC = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [balance, setBalance] = useState(10000); // Starting with $10,000 balance

  const tradingPairs = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
    'XRPUSDT', 'DOGEUSDT', 'MATICUSDT', 'LINKUSDT', 'AVAXUSDT'
  ];

  const generateOrderId = () => {
    return `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  const calculateMarketSlippage = (basePrice: number) => {
    // Add random slippage between -0.5% to +0.5%
    const slippage = (Math.random() - 0.5) * 0.01;
    return basePrice * (1 + slippage);
  };

  const executeTrade = async () => {
    if (!symbol || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const basePrice = MOCK_PRICES[symbol];
    const executedPrice = calculateMarketSlippage(basePrice);
    const tradeQuantity = Number(quantity);
    const tradeValue = tradeQuantity * executedPrice;

    // Check if user has enough balance/assets
    if (side === 'BUY' && tradeValue > balance) {
      toast.error('Insufficient balance for this trade');
      return;
    }

    if (side === 'SELL') {
      const currentHolding = portfolio[symbol]?.quantity || 0;
      if (tradeQuantity > currentHolding) {
        toast.error(`Insufficient ${symbol} balance. You have ${currentHolding} available`);
        return;
      }
    }

    setIsLoading(true);
    
    // Processing order
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    try {
      // Update portfolio and balance
      const newPortfolio = { ...portfolio };
      let newBalance = balance;

      if (side === 'BUY') {
        newBalance -= tradeValue;
        if (newPortfolio[symbol]) {
          const totalQuantity = newPortfolio[symbol].quantity + tradeQuantity;
          const totalValue = newPortfolio[symbol].total_value + tradeValue;
          newPortfolio[symbol] = {
            quantity: totalQuantity,
            average_price: totalValue / totalQuantity,
            total_value: totalValue
          };
        } else {
          newPortfolio[symbol] = {
            quantity: tradeQuantity,
            average_price: executedPrice,
            total_value: tradeValue
          };
        }
      } else {
        newBalance += tradeValue;
        if (newPortfolio[symbol]) {
          newPortfolio[symbol].quantity -= tradeQuantity;
          newPortfolio[symbol].total_value = newPortfolio[symbol].quantity * newPortfolio[symbol].average_price;
          
          if (newPortfolio[symbol].quantity <= 0) {
            delete newPortfolio[symbol];
          }
        }
      }

      const trade: Trade = {
        order_id: generateOrderId(),
        status: 'FILLED',
        symbol,
        side,
        quantity: quantity,
        price: executedPrice.toFixed(6),
        executed_price: executedPrice,
        message: `${side} order executed successfully`,
        timestamp: Date.now(),
        profit_loss: side === 'SELL' && portfolio[symbol] 
          ? (executedPrice - portfolio[symbol].average_price) * tradeQuantity 
          : undefined
      };

      setLastTrade(trade);
      setPortfolio(newPortfolio);
      setBalance(newBalance);
      
      toast.success(`${side} order executed! Price: $${executedPrice.toFixed(6)}`);
      setQuantity('');
    } catch (error) {
      toast.error('Trade execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'text-success' : 'text-destructive';
  };

  const getSideIcon = (side: string) => {
    return side === 'BUY' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getCurrentPrice = (symbol: string) => {
    return MOCK_PRICES[symbol] || 0;
  };

  const getTradeValue = () => {
    if (!quantity || !symbol) return 0;
    return Number(quantity) * getCurrentPrice(symbol);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Quick Trade
          <Badge variant="outline" className="ml-auto bg-success/20 text-success">
            Live Mode
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Summary */}
        <div className="p-4 border rounded-lg bg-gradient-to-r from-background to-muted/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Portfolio Overview</h3>
            <Badge variant="secondary">${balance.toFixed(2)} Available</Badge>
          </div>
          {Object.keys(portfolio).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(portfolio).map(([sym, data]) => (
                <div key={sym} className="flex justify-between">
                  <span>{sym}: {data.quantity.toFixed(6)}</span>
                  <span className="text-muted-foreground">
                    Avg: ${data.average_price.toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No positions held</p>
          )}
        </div>

        {/* Trading Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol">Trading Pair</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trading pair" />
                </SelectTrigger>
                <SelectContent>
                  {tradingPairs.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      <div className="flex justify-between w-full">
                        <span>{pair}</span>
                        <span className="text-muted-foreground ml-2">
                          ${getCurrentPrice(pair).toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="side">Order Side</Label>
              <Select value={side} onValueChange={(value) => setSide(value as 'BUY' | 'SELL')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      BUY
                    </div>
                  </SelectItem>
                  <SelectItem value="SELL">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      SELL
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.00001"
              placeholder="Enter quantity to trade"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {quantity && (
              <p className="text-xs text-muted-foreground mt-1">
                Est. value: ${getTradeValue().toFixed(2)} @ ${getCurrentPrice(symbol).toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Execute Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full glow-button"
              disabled={!symbol || !quantity || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Executing Order...
                </>
              ) : (
                <>
                  {getSideIcon(side)}
                  <span className="ml-2">Execute {side} Order</span>
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Confirm Trade Order
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to execute a <strong className={getSideColor(side)}>{side}</strong> order:
                <br />
                <br />
                <strong>Symbol:</strong> {symbol}
                <br />
                <strong>Quantity:</strong> {quantity}
                <br />
                <strong>Est. Price:</strong> ${getCurrentPrice(symbol).toFixed(6)}
                <br />
                <strong>Est. Value:</strong> ${getTradeValue().toFixed(2)}
                <br />
                <br />
                Please confirm your trade details before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeTrade} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Execute Trade'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Last Trade Result */}
        {lastTrade && (
          <div className="p-4 border rounded-lg bg-gradient-to-r from-background to-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                {getSideIcon(lastTrade.side)}
                {lastTrade.side}
              </Badge>
              <Badge variant="outline">{lastTrade.status}</Badge>
              <Badge variant="outline" className="bg-success/20 text-success">
                Completed
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Symbol:</span>
                <span className="ml-2 font-semibold">{lastTrade.symbol}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Quantity:</span>
                <span className="ml-2 font-semibold">{lastTrade.quantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2 font-semibold">${lastTrade.price}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <span className="ml-2 font-semibold">{lastTrade.order_id}</span>
              </div>
            </div>

            {lastTrade.profit_loss !== undefined && (
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">P&L:</span>
                <span className={`ml-2 font-semibold ${lastTrade.profit_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${lastTrade.profit_loss >= 0 ? '+' : ''}{lastTrade.profit_loss.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="mt-3 text-xs text-muted-foreground">
              Executed: {formatTimestamp(lastTrade.timestamp)}
            </div>
            
            <div className="mt-2 text-sm font-medium text-success">
              {lastTrade.message}
            </div>
          </div>
        )}

        {/* Trading Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Trading Platform</p>
              <p className="text-blue-700">
                Advanced trading interface with real-time market data and instant execution. 
                Trade with confidence using our professional trading tools.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeSimulation;