export interface InvestmentHolding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  todayGainLoss: number;
  todayGainLossPercent: number;
  logoBg: string;
  logoText: string;
}

export interface InvestmentTimelineItem {
  id: string;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL';
  title: string;
  subtitle: string;
  amount: number;
  quantity?: number;
  symbol?: string;
  date: string;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export const MOCK_INVESTMENTS: InvestmentHolding[] = [
  {
    id: 'inv-1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    sector: 'Energy',
    quantity: 10,
    avgBuyPrice: 2562.50,
    currentPrice: 2847.50,
    investedAmount: 25625,
    currentValue: 28475,
    profitLoss: 2850,
    profitLossPercent: 11.12,
    todayGainLoss: 342,
    todayGainLossPercent: 1.22,
    logoBg: 'from-blue-600 to-indigo-700',
    logoText: 'RIL',
  },
  {
    id: 'inv-2',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    sector: 'Automobile',
    quantity: 25,
    avgBuyPrice: 940.00,
    currentPrice: 875.00,
    investedAmount: 23500,
    currentValue: 21875,
    profitLoss: -1625,
    profitLossPercent: -6.91,
    todayGainLoss: -212.50,
    todayGainLossPercent: -0.96,
    logoBg: 'from-sky-500 to-blue-600',
    logoText: 'TM',
  },
  {
    id: 'inv-3',
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'IT & Software',
    quantity: 15,
    avgBuyPrice: 1480.00,
    currentPrice: 1682.00,
    investedAmount: 22200,
    currentValue: 25230,
    profitLoss: 3030,
    profitLossPercent: 13.65,
    todayGainLoss: 288.00,
    todayGainLossPercent: 1.15,
    logoBg: 'from-teal-500 to-cyan-600',
    logoText: 'INF',
  },
  {
    id: 'inv-4',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking',
    quantity: 12,
    avgBuyPrice: 1510.00,
    currentPrice: 1640.00,
    investedAmount: 18120,
    currentValue: 19680,
    profitLoss: 1560,
    profitLossPercent: 8.61,
    todayGainLoss: 144.00,
    todayGainLossPercent: 0.74,
    logoBg: 'from-blue-700 to-slate-900',
    logoText: 'HDFC',
  },
  {
    id: 'inv-5',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'IT & Software',
    quantity: 5,
    avgBuyPrice: 3850.00,
    currentPrice: 4210.00,
    investedAmount: 19250,
    currentValue: 21050,
    profitLoss: 1800,
    profitLossPercent: 9.35,
    todayGainLoss: 195.00,
    todayGainLossPercent: 0.94,
    logoBg: 'from-purple-600 to-pink-600',
    logoText: 'TCS',
  },
];

export const MOCK_INVESTMENT_TIMELINE: InvestmentTimelineItem[] = [
  {
    id: 'tx-101',
    type: 'BUY',
    title: 'Purchased Reliance Industries',
    subtitle: '10 shares @ ₹2,562.50',
    amount: 25625,
    quantity: 10,
    symbol: 'RELIANCE',
    date: 'Aug 04, 2026 • 10:15 AM',
    timestamp: Date.now() - 86400000 * 2,
    status: 'COMPLETED',
  },
  {
    id: 'tx-102',
    type: 'DEPOSIT',
    title: 'Wallet Top Up',
    subtitle: 'UPI / HDFC Bank **** 4892',
    amount: 50000,
    date: 'Aug 03, 2026 • 02:30 PM',
    timestamp: Date.now() - 86400000 * 3,
    status: 'COMPLETED',
  },
  {
    id: 'tx-103',
    type: 'BUY',
    title: 'Purchased Infosys Ltd',
    subtitle: '15 shares @ ₹1,480.00',
    amount: 22200,
    quantity: 15,
    symbol: 'INFY',
    date: 'Jul 28, 2026 • 11:40 AM',
    timestamp: Date.now() - 86400000 * 9,
    status: 'COMPLETED',
  },
  {
    id: 'tx-104',
    type: 'SELL',
    title: 'Sold Zomato Ltd',
    subtitle: '50 shares @ ₹218.40',
    amount: 10920,
    quantity: 50,
    symbol: 'ZOMATO',
    date: 'Jul 21, 2026 • 03:10 PM',
    timestamp: Date.now() - 86400000 * 16,
    status: 'COMPLETED',
  },
  {
    id: 'tx-105',
    type: 'WITHDRAWAL',
    title: 'Fund Withdrawal',
    subtitle: 'Transferred to HDFC Bank **** 4892',
    amount: 15000,
    date: 'Jul 15, 2026 • 09:05 AM',
    timestamp: Date.now() - 86400000 * 22,
    status: 'COMPLETED',
  },
];

export const MOCK_PORTFOLIO_GROWTH_HISTORY = [
  { label: 'Jan', invested: 40000, value: 41200 },
  { label: 'Feb', invested: 55000, value: 54100 },
  { label: 'Mar', invested: 70000, value: 72800 },
  { label: 'Apr', invested: 85000, value: 91400 },
  { label: 'May', invested: 95000, value: 102500 },
  { label: 'Jun', invested: 102000, value: 111300 },
  { label: 'Jul', invested: 108695, value: 116310 },
  { label: 'Aug', invested: 108695, value: 116310 },
];
