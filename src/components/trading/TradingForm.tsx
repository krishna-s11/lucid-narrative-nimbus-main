import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";

interface TradingFormProps {
  onExecuteTrade: (symbol: string, side: string, amount: number, stopLoss?: number) => Promise<void>;
  isLoading?: boolean;
}

export function TradingForm({ onExecuteTrade, isLoading = false }: TradingFormProps) {
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to trade",
        variant: "destructive",
      });
      return;
    }

    try {
      await onExecuteTrade(
        symbol,
        side,
        parseFloat(amount),
        stopLoss ? parseFloat(stopLoss) : undefined
      );
      
      // Reset form on success
      setAmount("");
      setStopLoss("");
      
      toast({
        title: "Trade executed",
        description: `${side.toUpperCase()} order for ${amount} ${symbol} has been placed`,
      });
    } catch (error) {
      toast({
        title: "Trade failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="crypto-card p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Execute Trade</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="side">Side</Label>
            <Select value={side} onValueChange={setSide}>
              <SelectTrigger>
                <SelectValue placeholder="Select side" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              placeholder="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10"
              step="0.001"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopLoss">Stop Loss (Optional)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="stopLoss"
              type="number"
              placeholder="Stop loss price"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="pl-10"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          variant={side === "buy" ? "success" : "danger"}
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {side === "buy" ? (
                <TrendingUp className="mr-2 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-2 h-4 w-4" />
              )}
              {side === "buy" ? "Buy" : "Sell"} {symbol}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}