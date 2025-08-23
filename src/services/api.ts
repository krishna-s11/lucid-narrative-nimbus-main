// API service for IRIS AI backend
// Use env vars if provided, otherwise use relative paths that go through proxy
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
const ML_API_BASE_URL = (import.meta as any).env?.VITE_ML_API_BASE_URL || '/ml';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to get the detailed error message from the response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }

    return response.json();
  }

  // ML API request method (no auth required for ML endpoints)
  private async mlRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${ML_API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`ML API error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{
      access_token: string;
      token_type: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.access_token;
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  async register(username: string, email: string, password: string) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  async getUserStats() {
    return this.request<{
      roi: number;
      total_assets: number;
      total_loss: number;
    }>('/auth/userstats');
  }

  async getUserInfo() {
    return this.request<{
      username: string;
      email: string;
    }>('/auth/userinfo');
  }

  async updateBinanceKeys(apiKey: string, apiSecret: string) {
    return this.request<{ message: string }>('/preferences/binance_keys', {
      method: 'PUT',
      body: JSON.stringify({
        binance_api_key: apiKey,
        binance_api_secret: apiSecret,
      }),
    });
  }

  // Portfolio endpoints
  async getPortfolio() {
    return this.request<Array<{
      id: number;
      user_id: number;
      btc_amount: number;
      purchase_price: number;
      created_at: string;
    }>>('/portfolio/');
  }

  async addPortfolioEntry(btcAmount: number, purchasePrice: number) {
    return this.request<any>('/portfolio/add', {
      method: 'POST',
      body: JSON.stringify({
        btc_amount: btcAmount,
        purchase_price: purchasePrice,
      }),
    });
  }

  async getPortfolioGraph() {
    return this.request<any>('/portfolio/graph');
  }

  // Trading endpoints
  async executeTrade(
    symbol: string,
    side: string,
    amount: number,
    stopLoss?: number
  ) {
    return this.request<{ message: string }>('/trading/execute', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        side,
        amount,
        stop_loss: stopLoss,
      }),
    });
  }

  async executeDirectTrade(
    symbol: string,
    side: string,
    usdAmount: number,
    stopLoss?: number
  ) {
    return this.request<{
      message: string;
      order_id: string;
      symbol: string;
      side: string;
      quantity: number;
      price: number;
      usd_amount: number;
      status: string;
      timestamp: string;
      details: any;
    }>('/trading/execute-direct', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        side,
        usd_amount: usdAmount,
        stop_loss: stopLoss,
      }),
    });
  }

  // Market Signals endpoints
  async getMarketSignals(symbol: string = 'BTC/USDT') {
    return this.request<{
      symbol: string;
      signal: string;
      strength: number;
      factors: string[];
      indicators: any;
      timestamp: string;
    }>('/trading/market-signals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getMarketSignalsForSymbols(symbols: string[]) {
    return Promise.all(
      symbols.map(symbol => this.getMarketSignals(symbol))
    );
  }

  async getAllMarketSignals() {
    return this.request<Array<{
      symbol: string;
      signal: string;
      strength: number;
      factors: string[];
      indicators: any;
      timestamp: string;
    }>>('/trading/market-signals-all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // AI Performance endpoints
  async getAIPerformance() {
    return this.request<{
      total_trades: number;
      success_rate: number;
      total_profit: number;
      avg_confidence: number;
      active_time: string;
    }>('/trading/ai-performance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // AI Auto Trading endpoints
  async executeAIAutoTrade(
    symbol: string = 'BTC/USDT',
    riskLevel: number = 3,
    maxTradeSize: number = 25.0
  ) {
    return this.request<{
      message: string;
      trade_details?: any;
      signal: string;
      strength: number;
      trade_size: number;
      risk_level: number;
    }>('/trading/ai-auto-trade', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        risk_level: riskLevel,
        max_trade_size: maxTradeSize,
      }),
    });
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request<{
      total_usd_value: number;
      crypto_balances: Array<{
        currency: string;
        balance: number;
        usd_value: number;
        price_usd: number;
      }>;
      account_status: string;
      last_updated: string;
    }>('/trading/wallet-balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getWalletStatus() {
    return this.request<{
      connected: boolean;
      status: string;
      message: string;
      account_type?: string;
      last_updated?: string;
    }>('/trading/wallet-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Live feeds endpoints
  async getTrendingCoins() {
    return this.request<Array<{
      symbol: string;
      volume: number;
      last: number;
      change_24h: number;
      high_24h: number;
      low_24h: number;
      bid: number;
      ask: number;
      timestamp: number;
    }>>('/live/trending');
  }

  async getEnhancedTrendingCoins() {
    return this.request<Array<{
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
    }>>('/live/trending-enhanced');
  }

  // Transaction endpoints
  async getUserTransactions(limit: number = 20) {
    return this.request<Array<{
      id: string | number;
      type: 'buy' | 'sell';
      symbol: string;
      amount: number;
      price: number;
      usd_value: number;
      timestamp: number;
      status: string;
      fee: { cost: number; currency: string };
      order_id: string;
    }>>(`/trading/transactions?limit=${limit}`);
  }

  async getTransactionSummary() {
    return this.request<{
      total_trades: number;
      total_volume: number;
      successful_trades: number;
      failed_trades: number;
      favorite_pairs: Array<{ symbol: string; count: number }>;
      last_trade_date: string | null;
    }>('/trading/transaction-summary');
  }

  async getBlockOrders(symbol: string = 'BTC/USDT') {
    return this.request<any[]>(`/live/block-orders?symbol=${symbol}`);
  }

  async getLiveChart(symbol: string = 'BTC/USDT') {
    return this.request<any>(`/live/charts?symbol=${symbol}`);
  }

  // Preferences endpoints
  async getPreferences() {
    return this.request<{
      auto_trade: boolean;
      threshold_limit: number;
      id: number;
      user_id: number;
    }>('/preferences/');
  }

  async createPreferences(autoTrade: boolean, thresholdLimit: number) {
    return this.request<any>('/preferences/', {
      method: 'POST',
      body: JSON.stringify({
        auto_trade: autoTrade,
        threshold_limit: thresholdLimit,
      }),
    });
  }

  async updatePreferences(autoTrade: boolean, thresholdLimit: number) {
    return this.request<any>('/preferences/', {
      method: 'PUT',
      body: JSON.stringify({
        auto_trade: autoTrade,
        threshold_limit: thresholdLimit,
      }),
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Set token manually
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // ML Prediction endpoints
  async getPrediction(symbol: string = 'ALL', timeframe: string = 'hourly') {
    return this.mlRequest<{
      predictions?: Array<{
        symbol: string;
        current_price: number;
        predicted_price_range: {
          low: number;
          high: number;
        };
        market_pattern: string;
        timeframe: string;
        potential_gain_percent: number;
        potential_loss_percent: number;
      }>;
      symbol?: string;
      current_price?: number;
      predicted_price?: {
        low: number;
        high: number;
      };
      market_pattern?: string;
      horizon?: string;
      potential_gain_percent?: number;
      potential_loss_percent?: number;
    }>('/api/predict', {
      method: 'POST',
      body: JSON.stringify({ symbol, timeframe }),
    });
  }

  async getStoredPredictions() {
    return this.mlRequest<{
      predictions: Array<any>;
      count: number;
      status: string;
    }>('/api/predictions');
  }

  async executeBinanceTrade(
    symbol: string,
    quantity: number,
    side: 'BUY' | 'SELL',
    apiKey: string,
    secretKey: string
  ) {
    return this.mlRequest<{
      order_id: string;
      status: string;
      symbol: string;
      side: string;
      quantity: string;
      price: string;
      message: string;
      timestamp: number;
    }>('/api/trade', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        quantity,
        side,
        api_key: apiKey,
        secret_key: secretKey,
      }),
    });
  }

  async chatWithAI(message: string) {
    return this.mlRequest<{
      reply: string;
      type: string;
      data?: any;
    }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getMLHealth() {
    return this.mlRequest<{
      status: string;
      service: string;
      database: string;
      timestamp: string | null;
    }>('/api/health');
  }

  async getMLStatus() {
    return this.mlRequest<{
      api_name: string;
      version: string;
      supported_coins: string[];
      features: {
        price_prediction: boolean;
        live_trading: boolean;
        ai_chatbot: boolean;
        market_news: boolean;
        technical_analysis: boolean;
      };
      endpoints: {
        predict: string;
        trade: string;
        chat: string;
        predictions: string;
        health: string;
      };
    }>('/api/status');
  }
}

export const apiService = new ApiService();
export default apiService;