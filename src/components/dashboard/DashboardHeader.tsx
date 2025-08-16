import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, TrendingUp } from "lucide-react";

interface DashboardHeaderProps {
  username: string;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export function DashboardHeader({ username, onLogout, onOpenSettings }: DashboardHeaderProps) {
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold gradient-text">IRIS-AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Intelligent Trading Assistant</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden lg:flex items-center space-x-3 px-3 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{username}</p>
                <p className="text-xs text-muted-foreground">Trader</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="flex items-center space-x-1 sm:space-x-2 glow-button"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-2 hover:bg-danger/10 hover:text-danger hover:border-danger/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}