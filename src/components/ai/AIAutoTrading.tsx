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
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [marketSignals, setMarketSignals] = useState<MarketSignal[]>([]);
  const [aiPerformance, setAiPerformance] = useState({
    totalTrades: 247,
    successRate: 84.2,
    totalProfit: 18750.45,
    avgConfidence: 92.3,
    activeTime: '18h 42m'
  });

  // Mock real-time AI trading data
  const mockSignals: MarketSignal[] = [
    {
      symbol: 'BTC/USDT',
      signal: 'STRONG_BUY',
      strength: 94,
      factors: ['Technical breakout', 'Volume surge', 'Sentiment positive']
    },
    {
      symbol: 'ETH/USDT',
      signal: 'BUY',
      strength: 78,
      factors: ['Support level hold', 'DeFi momentum', 'Institutional flow']
    },
    {
      symbol: 'SOL/USDT',
      signal: 'NEUTRAL',
      strength: 52,
      factors: ['Consolidation pattern', 'Mixed signals', 'Awaiting catalyst']
    },
    {
      symbol: 'ADA/USDT',
      signal: 'SELL',
      strength: 71,
      factors: ['Resistance rejection', 'Profit taking', 'Weak fundamentals']
    }
  ];

  const mockTrades: AITrade[] = [
    {
      id: 'AI001',
      symbol: 'BTC/USDT',
      side: 'BUY',
      quantity: 0.025,
      price: 43247.85,
      confidence: 94.2,
      reasoning: 'Strong momentum breakout with high volume confirmation. RSI oversold bounce expected.',
      timestamp: Date.now() - 300000,
      status: 'EXECUTED',
      profit: 125.80
    },
    {
      id: 'AI002',
      symbol: 'ETH/USDT',
      side: 'SELL',
      quantity: 1.2,
      price: 2634.92,
      confidence: 87.5,
      reasoning: 'Approaching major resistance level. Profit taking opportunity identified.',
      timestamp: Date.now() - 600000,
      status: 'EXECUTED',
      profit: 89.45
    },
    {
      id: 'AI003',
      symbol: 'SOL/USDT',
      side: 'BUY',
      quantity: 8.5,
      price: 98.43,
      confidence: 91.8,
      reasoning: 'Ecosystem growth indicators positive. Technical pattern suggests upward move.',
      timestamp: Date.now() - 180000,
      status: 'ANALYZING'
    }
  ];

  useEffect(() => {
    setMarketSignals(mockSignals);
    setAiTrades(mockTrades);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isActive) {
        // Update AI performance metrics
        setAiPerformance(prev => ({
          ...prev,
          totalProfit: prev.totalProfit + (Math.random() * 50 - 10),
          successRate: Math.max(75, Math.min(95, prev.successRate + (Math.random() * 2 - 1)))
        }));

        // Occasionally add new trades
        if (Math.random() > 0.7) {
          const symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'];
          const newTrade: AITrade = {
            id: `AI${Date.now()}`,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            side: Math.random() > 0.5 ? 'BUY' : 'SELL',
            quantity: Number((Math.random() * 2).toFixed(3)),
            price: 43000 + Math.random() * 1000,
            confidence: 80 + Math.random() * 15,
            reasoning: 'Market conditions favorable for entry. AI model confidence high.',
            timestamp: Date.now(),
            status: 'ANALYZING'
          };
          
          setAiTrades(prev => [newTrade, ...prev.slice(0, 4)]);
        }
      }
    }, 8000);

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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketSignals.map((signal) => (
              <div key={signal.symbol} className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{signal.symbol}</span>
                  <Badge className={getSignalColor(signal.signal)}>
                    {signal.signal.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Strength</span>
                    <span>{signal.strength}%</span>
                  </div>
                  <Progress value={signal.strength} className="h-1" />
                  <div className="text-xs text-muted-foreground">
                    {signal.factors.join(' • ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            {aiTrades.map((trade) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAutoTrading;