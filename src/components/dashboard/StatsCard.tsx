import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon?: "trending-up" | "trending-down" | "dollar" | "wallet";
  className?: string;
}

const icons = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "dollar": DollarSign,
  "wallet": Wallet,
};

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon = "dollar",
  className 
}: StatsCardProps) {
  const IconComponent = icons[icon];
  
  return (
    <Card className={cn("crypto-card p-4 sm:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1 gradient-text group-hover:scale-105 transition-transform truncate">{value}</p>
            {change && (
              <p className={cn(
                "text-sm mt-2 sm:mt-3 flex items-center space-x-1 font-medium",
                changeType === "up" && "text-success",
                changeType === "down" && "text-danger",
                changeType === "neutral" && "text-muted-foreground"
              )}>
                {changeType === "up" && <TrendingUp className="h-4 w-4" />}
                {changeType === "down" && <TrendingDown className="h-4 w-4" />}
                <span>{change}</span>
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 sm:p-4 rounded-xl transition-all duration-300 group-hover:scale-110 flex-shrink-0",
            changeType === "up" && "bg-success/20 text-success group-hover:bg-success/30",
            changeType === "down" && "bg-danger/20 text-danger group-hover:bg-danger/30",
            changeType === "neutral" && "bg-primary/20 text-primary group-hover:bg-primary/30"
          )}>
            <IconComponent className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
        </div>
      </div>
    </Card>
  );
}