import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Target,
  Zap,
  Shield,
  BarChart3,
  Clock,
  DollarSign,
  Cpu,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface AITrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  confidence: number;
  reasoning: string;
  timestamp: number;
  status: 'ANALYZING' | 'EXECUTED' | 'PENDING';
  profit?: number;
}

interface MarketSignal {
  symbol: string;
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  strength: number;
  factors: string[];
}

const AIAutoTrading: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [riskLevel, setRiskLevel] = useState([3]);
  const [maxTradeSize, setMaxTradeSize] = useState([25]);
  const [aiTrades, setAiTrades] = useState<AITrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiPerformance, setAiPerformance] = useState({
    totalTrades: 0,
    successRate: 0.0,
    totalProfit: 0.0,
    avgConfidence: 0.0,
    activeTime: '0h 0m'
  });

  // Supported symbols for market analysis
  const supportedSymbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'];

  // Initialize with loading state for all symbols
  const [marketSignals, setMarketSignals] = useState<MarketSignal[]>(
    supportedSymbols.map(symbol => ({
      symbol,
      signal: 'NEUTRAL',
      strength: 0,
      factors: ['Loading...']
    }))
  );

  // Fetch market signals for all supported symbols
  const fetchMarketSignals = async () => {
    try {
      console.log('Fetching market signals for symbols:', supportedSymbols);
      
      // Try the new endpoint first
      let signals;
      try {
        signals = await apiService.getAllMarketSignals();
        console.log('Received all signals from new endpoint:', signals);
      } catch (error) {
        console.log('New endpoint failed, falling back to individual calls');
        // Fallback to individual calls
        signals = await apiService.getMarketSignalsForSymbols(supportedSymbols);
        console.log('Received signals from fallback method:', signals);
      }
      
      const formattedSignals = signals.map(response => ({
        symbol: response.symbol,
        signal: response.signal as MarketSignal['signal'],
        strength: response.strength,
        factors: response.factors
      }));
      
      console.log('Formatted signals:', formattedSignals);
      
      // Ensure we have all 5 symbols, even if some failed
      const finalSignals = supportedSymbols.map(symbol => {
        const existingSignal = formattedSignals.find(s => s.symbol === symbol);
        if (existingSignal) {
          return existingSignal;
        }
        // Fallback for missing symbols
        return {
          symbol,
          signal: 'NEUTRAL' as MarketSignal['signal'],
          strength: 50,
          factors: ['Data unavailable - using fallback']
        };
      });
      
      setMarketSignals(finalSignals);
      
      // Only show toast for manual refresh, not auto-refresh
      if (!isLoading) {
        if (finalSignals.length > 0) {
          toast.success(`Updated ${finalSignals.length} market signals`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch market signals:', error);
      // Set fallback signals when backend is not available
      const fallbackSignals: MarketSignal[] = supportedSymbols.map(symbol => ({
        symbol,
        signal: 'NEUTRAL',
        strength: 50,
        factors: ['Backend unavailable - using fallback data']
      }));
      setMarketSignals(fallbackSignals);
      // Only show error toast for manual refresh
      if (!isLoading) {
        toast.error('Failed to fetch market signals from backend');
      }
    }
  };

  // Fetch AI performance metrics
  const fetchAIPerformance = async () => {
    try {
      const performance = await apiService.getAIPerformance();
      setAiPerformance({
        totalTrades: performance.total_trades,
        successRate: performance.success_rate,
        totalProfit: performance.total_profit,
        avgConfidence: performance.avg_confidence,
        activeTime: performance.active_time
      });
    } catch (error) {
      console.error('Failed to fetch AI performance:', error);
      // Keep default values if API fails
      // Only show error toast for manual refresh, not auto-refresh
      if (!isLoading) {
        toast.error('Failed to fetch AI performance metrics');
      }
    }
  };

  // Execute AI auto trade
  const executeAIAutoTrade = async (symbol: string) => {
    setIsLoading(true);
    try {
      const result = await apiService.executeAIAutoTrade(
        symbol,
        riskLevel[0],
        maxTradeSize[0]
      );
      
      if (result.message.includes('successfully')) {
        toast.success(`AI auto trade executed: ${result.signal} ${symbol}`);
        
        // Add the trade to the list
        const newTrade: AITrade = {
          id: `AI${Date.now()}`,
          symbol: symbol,
          side: result.signal.includes('BUY') ? 'BUY' : 'SELL',
          quantity: result.trade_size,
          price: 0, // Will be filled by actual trade execution
          confidence: result.strength,
          reasoning: `AI Signal: ${result.signal} (${result.strength}% strength)`,
          timestamp: Date.now(),
          status: 'EXECUTED'
        };
        
        setAiTrades(prev => [newTrade, ...prev.slice(0, 4)]);
              } else {
          toast.info(`No trade executed: ${result.message}`);
        }
    } catch (error) {
      console.error('AI auto trade failed:', error);
      toast.error('AI auto trade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketSignals();
    fetchAIPerformance();
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchMarketSignals();
      fetchAIPerformance();
    }
  }, [isActive]);

  // Refresh data periodically when active
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      fetchMarketSignals();
      fetchAIPerformance();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY': return 'text-green-600 bg-green-100';
      case 'BUY': return 'text-green-500 bg-green-50';
      case 'NEUTRAL': return 'text-yellow-600 bg-yellow-100';
      case 'SELL': return 'text-red-500 bg-red-50';
      case 'STRONG_SELL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXECUTED': return 'text-success bg-success/20';
      case 'ANALYZING': return 'text-primary bg-primary/20';
      case 'PENDING': return 'text-warning bg-warning/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const handleToggleAI = () => {
    setIsActive(!isActive);
    toast.success(
      !isActive 
        ? 'AI Auto Trading activated. Market analysis initiated.' 
        : 'AI Auto Trading paused. All positions maintained.'
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Control Panel */}
      <Card className="premium-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="gradient-text">IRIS AI Trading Engine</span>
              <p className="text-sm text-muted-foreground font-normal">
                Advanced neural network powered trading system
              </p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1">
                <Activity className={`h-3 w-3 ${isActive ? 'animate-pulse' : ''}`} />
                {isActive ? 'ACTIVE' : 'PAUSED'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Control Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-trading" className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  AI Trading Engine
                </Label>
                <Switch
                  id="ai-trading"
                  checked={isActive}
                  onCheckedChange={handleToggleAI}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Risk Level: {riskLevel[0]}/5
                </Label>
                <Slider
                  value={riskLevel}
                  onValueChange={setRiskLevel}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Max Trade Size: {maxTradeSize[0]}%
                </Label>
                <Slider
                  value={maxTradeSize}
                  onValueChange={setMaxTradeSize}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card/50 border">
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-xl font-bold text-success">{aiPerformance.successRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50 border">
                  <p className="text-xs text-muted-foreground">Total Profit</p>
                  <p className="text-xl font-bold text-primary">${aiPerformance.totalProfit.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50 border">
                  <p className="text-xs text-muted-foreground">Total Trades</p>
                  <p className="text-xl font-bold">{aiPerformance.totalTrades}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50 border">
                  <p className="text-xs text-muted-foreground">Active Time</p>
                  <p className="text-xl font-bold">{aiPerformance.activeTime}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI Confidence</span>
                  <span>{aiPerformance.avgConfidence.toFixed(1)}%</span>
                </div>
                <Progress value={aiPerformance.avgConfidence} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Signals */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Real-Time Market Analysis
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarketSignals}
              disabled={isLoading}
              className="ml-auto"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketSignals.map((signal) => (
              <div key={signal.symbol} className={`p-4 rounded-lg border bg-card/50 ${signal.factors.includes('Loading...') ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{signal.symbol}</span>
                  <Badge className={getSignalColor(signal.signal)}>
                    {signal.factors.includes('Loading...') ? 'LOADING' : signal.signal.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Strength</span>
                    <span>{signal.factors.includes('Loading...') ? '--' : `${signal.strength}%`}</span>
                  </div>
                  <Progress value={signal.strength || 0} className="h-1" />
                  <div className="text-xs text-muted-foreground">
                    {signal.factors.join(' • ')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeAIAutoTrade(signal.symbol)}
                    disabled={isLoading || signal.factors.includes('Loading...') || signal.signal === 'NEUTRAL' || signal.strength < 60}
                    className="w-full mt-2"
                  >
                    {isLoading || signal.factors.includes('Loading...') ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {signal.factors.includes('Loading...') ? 'Loading...' : 'Execute Trade'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <strong>Debug Info:</strong> {marketSignals.length} signals loaded for {supportedSymbols.length} symbols
              <br />
              <strong>Symbols:</strong> {supportedSymbols.join(', ')}
              <br />
              <strong>Current Signals:</strong> {marketSignals.map(s => `${s.symbol}: ${s.signal}`).join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent AI Trades */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI Trading Activity
            <Badge variant="outline" className="ml-auto">
              Live Feed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiTrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No AI trades yet. Execute trades based on market signals above.</p>
              </div>
            ) : (
              aiTrades.map((trade) => (
                <div key={trade.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${trade.side === 'BUY' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                        {trade.side === 'BUY' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{trade.side} {trade.symbol}</span>
                          <Badge className={getStatusColor(trade.status)}>
                            {trade.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {trade.quantity} @ ${trade.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Target className="h-3 w-3" />
                        <span>{trade.confidence.toFixed(1)}%</span>
                      </div>
                      {trade.profit && (
                        <div className={`text-sm font-semibold ${trade.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                          {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">AI Reasoning:</span> {trade.reasoning}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span>Order ID: {trade.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAutoTrading;