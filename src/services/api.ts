// API service for IRIS AI backend
const API_BASE_URL = 'http://16.176.182.151'; // Change this to your backend URL
const ML_API_BASE_URL = 'http://52.65.184.114/'; // ML Flask backend URL

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
      throw new Error(`HTTP error! status: ${response.status}`);
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

  // Live feeds endpoints
  async getTrendingCoins() {
    return this.request<Array<{
      symbol: string;
      volume: number;
      last: number;
    }>>('/live/trending');
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