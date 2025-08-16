import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, Target, Zap, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import MLTrading from './MLTrading';
import TradeSimulation from '../simulation/TradeSimulation';
import AIAutoTrading from '../ai/AIAutoTrading';

interface PredictionData {
  symbol: string;
  current_price: number;
  predicted_price_range?: {
    low: number;
    high: number;
  };
  predicted_price?: {
    low: number;
    high: number;
  };
  market_pattern: string;
  timeframe: string;
  potential_gain_percent: number;
  potential_loss_percent: number;
  horizon?: string;
}

const MLPredictionsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('ALL');
  const [timeframe, setTimeframe] = useState('hourly');

  const supportedCoins = ['ALL', 'BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
  const timeframes = [
    { value: 'hourly', label: '1 Hour' },
    { value: 'daily', label: '1 Day' },
    { value: 'monthly', label: '1 Month' }
  ];

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPrediction(symbol, timeframe);
      
      if (response.predictions) {
        setPredictions(response.predictions);
      } else if (response.symbol) {
        setPredictions([{
          symbol: response.symbol,
          current_price: response.current_price!,
          predicted_price: response.predicted_price,
          market_pattern: response.market_pattern!,
          timeframe: timeframe,
          potential_gain_percent: response.potential_gain_percent || 0,
          potential_loss_percent: response.potential_loss_percent || 0,
          horizon: response.horizon
        }]);
      }
      
      toast.success('ML predictions updated successfully!');
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to fetch ML predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPredictions();
    }
  }, [isOpen]);

  const getPatternIcon = (pattern: string) => {
    const patternLower = pattern.toLowerCase();
    if (patternLower.includes('bullish')) return <TrendingUp className="h-4 w-4" />;
    if (patternLower.includes('bearish')) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getPatternColor = (pattern: string) => {
    const patternLower = pattern.toLowerCase();
    if (patternLower.includes('bullish')) return 'bg-success/20 text-success';
    if (patternLower.includes('bearish')) return 'bg-destructive/20 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getPriceRange = (prediction: PredictionData) => {
    return prediction.predicted_price_range || prediction.predicted_price;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="glow-button" size="lg">
          <Brain className="h-5 w-5 mr-2" />
          ML Predictions & Trading
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            IRIS ML Trading Suite
            <Badge variant="outline" className="ml-auto">
              Advanced Analytics
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              ML Predictions
            </TabsTrigger>
            <TabsTrigger value="ai-trading" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Auto Trading
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Quick Trade
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Live Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Door I/II Analysis
                  <Badge variant="outline" className="ml-auto">
                    AI Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select value={symbol} onValueChange={setSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-md z-50">
                        {supportedCoins.map((coin) => (
                          <SelectItem key={coin} value={coin}>
                            {coin === 'ALL' ? 'All Coins' : coin}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-md z-50">
                        {timeframes.map((tf) => (
                          <SelectItem key={tf.value} value={tf.value}>
                            {tf.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={fetchPredictions}
                    disabled={loading}
                    className="glow-button"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                    Predict
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Analyzing market patterns...</span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {predictions.map((prediction, index) => {
                      const priceRange = getPriceRange(prediction);
                      return (
                        <div
                          key={`${prediction.symbol}-${index}`}
                          className="p-4 border rounded-lg bg-gradient-to-r from-background to-muted/50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{prediction.symbol}</h3>
                              <Badge className={getPatternColor(prediction.market_pattern)}>
                                {getPatternIcon(prediction.market_pattern)}
                                {prediction.market_pattern}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Current Price</div>
                              <div className="font-bold text-lg">
                                {formatPrice(prediction.current_price)}
                              </div>
                            </div>
                          </div>

                          {priceRange && (
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-center p-3 bg-primary/10 rounded-lg">
                                <div className="text-sm text-muted-foreground">Predicted Low</div>
                                <div className="font-semibold text-lg text-primary">
                                  {formatPrice(priceRange.low)}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-success/10 rounded-lg">
                                <div className="text-sm text-muted-foreground">Predicted High</div>
                                <div className="font-semibold text-lg text-success">
                                  {formatPrice(priceRange.high)}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Potential Gain:</span>
                              <span className="ml-2 font-semibold text-success">
                                +{prediction.potential_gain_percent.toFixed(2)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Potential Loss:</span>
                              <span className="ml-2 font-semibold text-destructive">
                                -{prediction.potential_loss_percent.toFixed(2)}%
                              </span>
                            </div>
                          </div>

                          {prediction.horizon && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Prediction horizon: {prediction.horizon}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-trading" className="space-y-4">
            <AIAutoTrading />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <TradeSimulation />
          </TabsContent>

          <TabsContent value="trading" className="space-y-4">
            <MLTrading />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MLPredictionsModal;