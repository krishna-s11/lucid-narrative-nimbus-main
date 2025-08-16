import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, TrendingUp, TrendingDown, Shield, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface TradeResult {
  order_id: string;
  status: string;
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  message: string;
  timestamp: number;
}

const MLTrading: React.FC = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTrade, setLastTrade] = useState<TradeResult | null>(null);

  const tradingPairs = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
    'XRPUSDT', 'DOGEUSDT', 'MATICUSDT', 'LINKUSDT', 'AVAXUSDT'
  ];

  const executeTrade = async () => {
    if (!symbol || !quantity || !apiKey || !secretKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.executeBinanceTrade(
        symbol,
        Number(quantity),
        side,
        apiKey,
        secretKey
      );

      setLastTrade(result);
      toast.success(`${side} order executed successfully!`);
      
      // Clear sensitive data
      setApiKey('');
      setSecretKey('');
      setQuantity('');
    } catch (error) {
      console.error('Trade execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Trade execution failed';
      toast.error(`Trade failed: ${errorMessage}`);
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          ML Trading Engine
          <Badge variant="outline" className="ml-auto">
            Binance Integration
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                      {pair}
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <Label>Binance API Credentials</Label>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Input
                type="password"
                placeholder="Binance API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Binance Secret Key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your credentials are not stored and only used for this trade execution
            </p>
          </div>
        </div>

        {/* Execute Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full glow-button"
              disabled={!symbol || !quantity || !apiKey || !secretKey || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Executing Trade...
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
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirm Trade Execution
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to execute a <strong className={getSideColor(side)}>{side}</strong> order:
                <br />
                <br />
                <strong>Symbol:</strong> {symbol}
                <br />
                <strong>Quantity:</strong> {quantity}
                <br />
                <strong>Order Type:</strong> Market Order
                <br />
                <br />
                This action cannot be undone. Please ensure your API credentials are correct.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeTrade} disabled={isLoading}>
                {isLoading ? 'Executing...' : 'Confirm Trade'}
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
                <span className="ml-2 font-semibold">{lastTrade.price}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <span className="ml-2 font-semibold">{lastTrade.order_id}</span>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground">
              Executed: {formatTimestamp(lastTrade.timestamp)}
            </div>
            
            <div className="mt-2 text-sm font-medium text-success">
              {lastTrade.message}
            </div>
          </div>
        )}

        {/* Trading Safety Notice */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Trading Risk Warning</p>
              <p className="text-yellow-700">
                Cryptocurrency trading involves significant risk. Only trade with funds you can afford to lose. 
                This is a market order and will execute at current market prices.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLTrading;