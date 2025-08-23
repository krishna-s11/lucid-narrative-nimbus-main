import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { RecentTransactions } from "@/components/portfolio/RecentTransactions";
import { TradingForm } from "@/components/trading/TradingForm";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import FloatingChatAssistant from "@/components/chat/FloatingChatAssistant";
import MLPredictionsModal from "@/components/ml/MLPredictionsModal";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userEmail, setUserEmail] = useState("investor@irisai.com");
  const [username, setUsername] = useState("ProTrader");
  const [userStats, setUserStats] = useState({
    roi: 0,
    total_assets: 0,
    total_loss: 0
  });
  const [trendingCoins, setTrendingCoins] = useState<Array<{
    symbol: string;
    volume: number;
    last: number;
    change_24h: number;
    price_change: number;
    high_24h: number;
    low_24h: number;
    bid: number;
    ask: number;
    market_cap: number;
    volatility: number;
    timestamp: number;
  }>>([]);
  const [portfolioChart, setPortfolioChart] = useState<{ data: Array<{ date: string; value: number }> } | null>(null);
  const [portfolio, setPortfolio] = useState<Array<{ id: number; btc_amount: number; purchase_price: number; created_at: string }>>([]);
  const [preferences, setPreferences] = useState({
    auto_trade: false,
    threshold_limit: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = apiService.getToken();
        if (token) {
          // Validate token by fetching user info
          const info = await apiService.getUserInfo();
          if (info?.email) {
            setUserEmail(info.email);
          }
          if (info?.username) {
            setUsername(info.username);
          }
          setIsAuthenticated(true);
          await loadDashboardData();
        }
      } catch (err) {
        // Not authenticated; stay on login
        setIsAuthenticated(false);
      }
    };
    bootstrap();
  }, []);

  const loadDashboardData = async () => {
    setIsDashboardLoading(true);
    try {
      const [stats, coins, pf, prefs] = await Promise.all([
        apiService.getUserStats(),
        apiService.getEnhancedTrendingCoins(), // Use enhanced trending data
        apiService.getPortfolio(),
        apiService.getPreferences().catch(() => null),
      ]);

      if (stats) setUserStats(stats);
      if (Array.isArray(coins)) setTrendingCoins(coins);
      if (Array.isArray(pf)) setPortfolio(pf);
      if (prefs) setPreferences(prefs);

      // Build a simple chart from portfolio entries using purchase price over time
      if (Array.isArray(pf) && pf.length > 0) {
        const chartData = pf
          .slice()
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((entry) => ({ date: entry.created_at, value: entry.purchase_price }));
        setPortfolioChart({ data: chartData });
      } else {
        setPortfolioChart(null);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // Function to add dummy portfolio data for demonstration
  const addDummyPortfolioData = async () => {
    setIsLoading(true);
    try {
      const dummyEntries = [
        { btc_amount: 0.05, purchase_price: 42000 },
        { btc_amount: 0.025, purchase_price: 45000 },
        { btc_amount: 0.1, purchase_price: 38000 },
        { btc_amount: 0.03, purchase_price: 47000 },
      ];

      for (const entry of dummyEntries) {
        await apiService.addPortfolioEntry(entry.btc_amount, entry.purchase_price);
      }

      toast({
        title: "Success!",
        description: "Dummy portfolio data added successfully",
      });

      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add dummy data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginResponse = await apiService.login(email, password);
      // Update username from login response
      if (loginResponse?.user?.username) {
        setUsername(loginResponse.user.username);
      }
      setIsAuthenticated(true);
      await loadDashboardData();
      toast({ title: "Welcome back!", description: "Successfully logged in" });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await apiService.register(username, email, password);
      const loginResponse = await apiService.login(email, password);
      // Update username from login response
      if (loginResponse?.user?.username) {
        setUsername(loginResponse.user.username);
      }
      setIsAuthenticated(true);
      await loadDashboardData();
      toast({ title: "Account created!", description: "Welcome to IRIS AI" });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    // Demo mode - just reset to login screen
    setIsAuthenticated(false);
  };

  const handleExecuteTrade = async (symbol: string, side: string, usdAmount: number, stopLoss?: number) => {
    setIsLoading(true);
    try {
      const result = await apiService.executeDirectTrade(symbol, side, usdAmount, stopLoss);
      console.log('Trade executed:', result);
      
      // Show success message with trade details
      toast({
        title: "Trade Executed Successfully!",
        description: `${side.toUpperCase()} ${result.quantity.toFixed(6)} ${symbol} for $${usdAmount}`,
      });
      
      // Reload dashboard data to show updated portfolio
      await loadDashboardData();
    } catch (error: any) {
      console.error('Trade execution failed:', error);
      
      // Show specific error message from backend
      let errorMessage = 'Failed to execute trade. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Trade Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (autoTrade: boolean, thresholdLimit: number) => {
    try {
      await apiService.updatePreferences(autoTrade, thresholdLimit);
      setPreferences({ auto_trade: autoTrade, threshold_limit: thresholdLimit });
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateBinanceKeys = async (apiKey: string, apiSecret: string) => {
    try {
      await apiService.updateBinanceKeys(apiKey, apiSecret);
    } catch (error) {
      throw error;
    }
  };

  if (!isAuthenticated) {
    return isLogin ? (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => setIsLogin(false)}
        isLoading={isLoading}
      />
    ) : (
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={() => setIsLogin(true)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        username={username}
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
      />
      
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-lg bg-gradient-to-r from-primary/10 to-success/10 border border-border gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">Welcome back, {username}!</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Your intelligent trading assistant is ready to help.</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <MLPredictionsModal />
            </div>
          </div>

          {/* Wallet Balance - Full Width */}
          <WalletBalance
            totalAssets={userStats.total_assets}
            roi={userStats.roi}
            totalLoss={userStats.total_loss}
            portfolio={portfolio}
            onRefresh={loadDashboardData}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatsCard
              title="Total Assets"
              value={`$${userStats.total_assets.toLocaleString()}`}
              changeType="up"
              icon="wallet"
            />
            <StatsCard
              title="ROI"
              value={`${userStats.roi}%`}
              changeType={userStats.roi > 0 ? "up" : "down"}
              icon="trending-up"
            />
            <StatsCard
              title="Total Loss"
              value={`$${userStats.total_loss.toLocaleString()}`}
              changeType="down"
              icon="trending-down"
            />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              <PortfolioChart
                chartData={portfolioChart}
                isLoading={isDashboardLoading}
                onRefresh={loadDashboardData}
              />
              <RecentTransactions onRefresh={loadDashboardData} />
            </div>
            
            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              <TradingForm
                onExecuteTrade={handleExecuteTrade}
                isLoading={isLoading}
              />
              <TrendingCoins coins={trendingCoins} isLoading={isDashboardLoading} />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Assistant */}
      <FloatingChatAssistant />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdatePreferences={handleUpdatePreferences}
        onUpdateBinanceKeys={handleUpdateBinanceKeys}
        preferences={preferences}
      />
    </div>
  );
};

export default Index;
