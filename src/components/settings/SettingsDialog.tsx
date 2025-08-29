import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Key, Settings } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatePreferences: (autoTrade: boolean, thresholdLimit: number) => Promise<void>;
  onUpdateBinanceKeys: (apiKey: string, apiSecret: string) => Promise<void>;
  onUpdateAutoTrading?: (params: { enabled: boolean; risk_level: number; max_trade_size: number; pairs: string[]; min_signal_strength?: number }) => Promise<void>;
  autoTradingSettings?: {
    enabled: boolean;
    risk_level: number;
    max_trade_size: number;
    pairs: string[];
    min_signal_strength?: number;
  };
  preferences?: {
    auto_trade: boolean;
    threshold_limit: number;
  };
}

export function SettingsDialog({ 
  isOpen, 
  onClose, 
  onUpdatePreferences, 
  onUpdateBinanceKeys, 
  onUpdateAutoTrading,
  autoTradingSettings,
  preferences 
}: SettingsDialogProps) {
  const [autoTrade, setAutoTrade] = useState(preferences?.auto_trade ?? false);
  const [thresholdLimit, setThresholdLimit] = useState(preferences?.threshold_limit?.toString() ?? "0.02");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Auto trading UI state
  const [autoEnabled, setAutoEnabled] = useState<boolean>(autoTradingSettings?.enabled ?? false);
  const [riskLevel, setRiskLevel] = useState<number>(autoTradingSettings?.risk_level ?? 3);
  const [maxTradeSize, setMaxTradeSize] = useState<number>(autoTradingSettings?.max_trade_size ?? 25);
  const [pairs, setPairs] = useState<string>((autoTradingSettings?.pairs ?? ["BTC/USDT","ETH/USDT","BNB/USDT"]).join(","));
  const [minStrength, setMinStrength] = useState<number>(autoTradingSettings?.min_signal_strength ?? 60);

  const handleUpdatePreferences = async () => {
    setIsLoading(true);
    try {
      await onUpdatePreferences(autoTrade, parseFloat(thresholdLimit));
      toast({
        title: "Preferences updated",
        description: "Your trading preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAutoTrading = async () => {
    if (!onUpdateAutoTrading) return;
    setIsLoading(true);
    try {
      const parsedPairs = pairs.split(',').map(p => p.trim()).filter(Boolean);
      await onUpdateAutoTrading({
        enabled: autoEnabled,
        risk_level: riskLevel,
        max_trade_size: maxTradeSize,
        pairs: parsedPairs,
        min_signal_strength: minStrength,
      });
      toast({
        title: "Auto-trading updated",
        description: "Background auto trading preferences saved",
      });
    } catch (e) {
      toast({
        title: "Update failed",
        description: "Could not save auto-trading settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBinanceKeys = async () => {
    if (!apiKey || !apiSecret) {
      toast({
        title: "Missing keys",
        description: "Please enter both API key and secret",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Show verification notification
    toast({
      title: "Verifying API keys",
      description: "Checking the validity of your Binance API credentials...",
    });

    try {
      await onUpdateBinanceKeys(apiKey, apiSecret);
      setApiKey("");
      setApiSecret("");
      toast({
        title: "Keys verified and updated",
        description: "Your Binance API keys are valid and have been saved securely",
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid API keys or insufficient permissions. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto Trading (Background Scheduler) */}
          {onUpdateAutoTrading && (
            <Card className="crypto-card p-4">
              <h3 className="text-lg font-semibold mb-4">Auto Trading (Background)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-enabled">Enable</Label>
                    <p className="text-sm text-muted-foreground">Run trades automatically every few minutes</p>
                  </div>
                  <Switch id="auto-enabled" checked={autoEnabled} onCheckedChange={setAutoEnabled} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Risk Level (1-5)</Label>
                    <Input type="number" min={1} max={5} value={riskLevel} onChange={e => setRiskLevel(parseInt(e.target.value || '3'))} />
                  </div>
                  <div>
                    <Label>Max Trade Size ($)</Label>
                    <Input type="number" min={5} value={maxTradeSize} onChange={e => setMaxTradeSize(parseFloat(e.target.value || '25'))} />
                  </div>
                  <div>
                    <Label>Minimum Signal Strength</Label>
                    <Input type="number" min={0} max={100} value={minStrength} onChange={e => setMinStrength(parseInt(e.target.value || '60'))} />
                  </div>
                  <div className="sm:col-span-3">
                    <Label>Allowed Pairs (comma-separated)</Label>
                    <Input value={pairs} onChange={e => setPairs(e.target.value)} placeholder="BTC/USDT,ETH/USDT" />
                  </div>
                </div>
                <Button onClick={handleUpdateAutoTrading} disabled={isLoading} className="w-full">
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ("Save Auto Trading Settings")}
                </Button>
              </div>
            </Card>
          )}

          {/* Trading Preferences */}
          <Card className="crypto-card p-4">
            <h3 className="text-lg font-semibold mb-4">Trading Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-trade">Auto Trading</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic trading based on ML predictions
                  </p>
                </div>
                <Switch
                  id="auto-trade"
                  checked={autoTrade}
                  onCheckedChange={setAutoTrade}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold Limit (%)</Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="0.02"
                  value={thresholdLimit}
                  onChange={(e) => setThresholdLimit(e.target.value)}
                  step="0.01"
                  min="0"
                  max="1"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum price change to trigger auto-trade
                </p>
              </div>

              <Button
                onClick={handleUpdatePreferences}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Preferences"
                )}
              </Button>
            </div>
          </Card>

          {/* Binance API Keys */}
          <Card className="crypto-card p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Binance API Keys</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Binance API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input
                  id="api-secret"
                  type="password"
                  placeholder="Enter your Binance API secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Your API keys are encrypted and stored securely. They're required for executing trades.
              </p>

              <Button
                onClick={handleUpdateBinanceKeys}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update API Keys"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}