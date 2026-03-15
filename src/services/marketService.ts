const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52w?: number;
  low52w?: number;
  pe?: number;
}

export interface MarketIndex {
  name: string;
  ticker: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface PricePoint {
  date: string;
  close: number;
}

// Mock data for when API is unavailable or for demo mode
const MOCK_QUOTES: Record<string, StockQuote> = {
  AAPL: { ticker: 'AAPL', name: 'Apple Inc.', price: 187.45, change: 2.30, changePercent: 1.24, volume: 52_000_000, pe: 28.5 },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corp.', price: 404.87, change: -3.12, changePercent: -0.77, volume: 23_000_000, pe: 32.1 },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 163.54, change: 1.87, changePercent: 1.16, volume: 21_000_000, pe: 20.8 },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 196.73, change: -1.23, changePercent: -0.62, volume: 35_000_000, pe: 40.2 },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', price: 248.90, change: -8.45, changePercent: -3.28, volume: 98_000_000, pe: 52.4 },
  META: { ticker: 'META', name: 'Meta Platforms', price: 572.31, change: 5.67, changePercent: 1.00, volume: 17_000_000, pe: 26.7 },
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 875.20, change: 22.40, changePercent: 2.63, volume: 44_000_000, pe: 38.1 },
  JPM: { ticker: 'JPM', name: 'JPMorgan Chase', price: 239.14, change: 1.05, changePercent: 0.44, volume: 11_000_000, pe: 12.3 },
  SPY: { ticker: 'SPY', name: 'S&P 500 ETF', price: 549.32, change: 3.21, changePercent: 0.59, volume: 78_000_000 },
  TTE: { ticker: 'TTE', name: 'TotalEnergies SE', price: 58.74, change: -0.32, changePercent: -0.54, volume: 4_500_000, pe: 8.9 },
  'MC.PA': { ticker: 'MC.PA', name: 'LVMH Moët Hennessy', price: 618.20, change: 8.40, changePercent: 1.38, volume: 860_000, pe: 22.1 },
  BNP: { ticker: 'BNP', name: 'BNP Paribas', price: 68.54, change: 0.87, changePercent: 1.29, volume: 3_200_000, pe: 7.4 },
};

const MOCK_INDICES: MarketIndex[] = [
  { name: 'S&P 500', ticker: 'SPX', value: 5483.0, change: 32.1, changePercent: 0.59 },
  { name: 'NASDAQ', ticker: 'NDX', value: 17842.5, change: -28.4, changePercent: -0.16 },
  { name: 'CAC 40', ticker: 'CAC', value: 8124.7, change: 41.2, changePercent: 0.51 },
  { name: 'DAX', ticker: 'DAX', value: 22345.8, change: -87.3, changePercent: -0.39 },
];

function generateMockHistory(basePrice: number, days = 30): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * 0.9;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    points.push({
      date: date.toISOString().split('T')[0],
      close: Math.round(price * 100) / 100,
    });
  }
  // Make last price match current
  if (points.length > 0) {
    points[points.length - 1].close = basePrice;
  }
  return points;
}

export async function getStockQuote(ticker: string, apiKey: string): Promise<StockQuote> {
  // Try to use demo key for common stocks
  const effectiveKey = apiKey || 'demo';

  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${effectiveKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || !quote['05. price']) {
      throw new Error('Invalid response');
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    const volume = parseInt(quote['06. volume']);

    return {
      ticker,
      name: MOCK_QUOTES[ticker]?.name || ticker,
      price,
      change,
      changePercent,
      volume,
    };
  } catch {
    // Fall back to mock data
    if (MOCK_QUOTES[ticker]) {
      // Add slight randomness to simulate live prices
      const mock = { ...MOCK_QUOTES[ticker] };
      const drift = (Math.random() - 0.5) * 0.004;
      mock.price = Math.round(mock.price * (1 + drift) * 100) / 100;
      mock.change = Math.round(mock.change * (1 + drift) * 100) / 100;
      return mock;
    }
    throw new Error(`Données indisponibles pour ${ticker}`);
  }
}

export async function getMultipleQuotes(tickers: string[], apiKey: string): Promise<StockQuote[]> {
  const results = await Promise.allSettled(
    tickers.map(ticker => getStockQuote(ticker, apiKey))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
    .map(r => r.value);
}

export async function getPriceHistory(ticker: string, apiKey: string): Promise<PricePoint[]> {
  const effectiveKey = apiKey || 'demo';

  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${effectiveKey}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    const series = data['Time Series (Daily)'];

    if (!series) throw new Error('No data');

    return Object.entries(series)
      .slice(0, 30)
      .reverse()
      .map(([date, values]: [string, unknown]) => ({
        date,
        close: parseFloat((values as Record<string, string>)['4. close']),
      }));
  } catch {
    const basePrice = MOCK_QUOTES[ticker]?.price || 100;
    return generateMockHistory(basePrice);
  }
}

export async function getMarketIndices(): Promise<MarketIndex[]> {
  // Alpha Vantage doesn't provide index data on free tier
  // Return mock with slight variation
  return MOCK_INDICES.map(index => ({
    ...index,
    value: Math.round(index.value * (1 + (Math.random() - 0.5) * 0.002) * 100) / 100,
    change: Math.round(index.change * (1 + (Math.random() - 0.5) * 0.1) * 100) / 100,
  }));
}

export async function searchStocks(query: string): Promise<StockQuote[]> {
  const searchQuery = query.toUpperCase();
  return Object.values(MOCK_QUOTES).filter(
    s => s.ticker.includes(searchQuery) || s.name.toUpperCase().includes(searchQuery)
  );
}

export function formatPrice(price: number, currency = '€'): string {
  if (price >= 1000) {
    return `${(price / 1000).toFixed(2)}k${currency}`;
  }
  return `${price.toFixed(2)}${currency}`;
}

export function formatChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
}

export const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'META', 'TSLA', 'SPY', 'MC.PA', 'TTE'];

export const SECTORS = {
  tech: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'AMZN'],
  finance: ['JPM', 'BNP'],
  energy: ['TTE'],
  luxury: ['MC.PA'],
  etf: ['SPY'],
};
