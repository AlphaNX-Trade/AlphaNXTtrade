import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon, LineChart as LineIcon, BarChart2, Award, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { InvestmentHolding } from '@/data/mockInvestments';
import { MOCK_PORTFOLIO_GROWTH_HISTORY } from '@/data/mockInvestments';

interface InvestmentAnalyticsProps {
  holdings: InvestmentHolding[];
}

const SECTOR_COLORS: Record<string, string> = {
  Energy: '#00d2d2',
  Automobile: '#f43f5e',
  'IT & Software': '#10b981',
  Banking: '#3b82f6',
  Metals: '#a855f7',
  Crypto: '#f59e0b',
  Other: '#64748b',
};

export function InvestmentAnalytics({ holdings }: InvestmentAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'GROWTH' | 'PROFIT_LOSS' | 'SECTORS'>('GROWTH');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');

  // Compute sector allocation
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    const s = h.sector || 'Other';
    sectorMap[s] = (sectorMap[s] || 0) + h.currentValue;
  });

  const sectorData = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Best & Worst performers
  const sortedByPL = [...holdings].sort((a, b) => b.profitLossPercent - a.profitLossPercent);
  const bestPerformers = sortedByPL.slice(0, 3);
  const worstPerformers = [...sortedByPL].reverse().slice(0, 3);

  // Bar chart data: Invested vs Current Value per holding
  const pnlBarData = holdings.map((h) => ({
    name: h.symbol,
    Invested: h.investedAmount,
    Value: h.currentValue,
  }));

  const fmtCurrency = (val: number) =>
    `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Header & Sub-Tab Switcher */}
      <div className="bg-card/80 border border-border/70 rounded-2xl p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <LineIcon className="w-4 h-4 text-primary" />
              Portfolio Analytics
            </h3>
            <p className="text-[11px] text-muted-foreground">Detailed visual performance breakdown</p>
          </div>

          {/* Timeframe pills */}
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/40">
            {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                  timeframe === tf
                    ? 'bg-primary text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Mode Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-secondary/40 rounded-xl border border-border/40 mb-4">
          <button
            onClick={() => setActiveTab('GROWTH')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'GROWTH'
                ? 'bg-card text-primary shadow-xs border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Growth</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFIT_LOSS')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'PROFIT_LOSS'
                ? 'bg-card text-primary shadow-xs border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Cost vs Value</span>
          </button>

          <button
            onClick={() => setActiveTab('SECTORS')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'SECTORS'
                ? 'bg-card text-primary shadow-xs border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Sectors</span>
          </button>
        </div>

        {/* Main Active Chart */}
        <div className="h-56 w-full pt-1">
          {activeTab === 'GROWTH' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PORTFOLIO_GROWTH_HISTORY}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2d2" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d2d2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#00d2d2',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Portfolio Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00d2d2"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'PROFIT_LOSS' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlBarData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`]}
                />
                <Bar dataKey="Invested" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'SECTORS' && (
            <div className="flex flex-col sm:flex-row items-center justify-around h-full gap-4">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={SECTOR_COLORS[entry.name] || '#64748b'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Value']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sector Legend */}
              <div className="space-y-1.5 text-xs font-medium w-full sm:w-1/2">
                {sectorData.map((s) => {
                  const total = sectorData.reduce((acc, curr) => acc + curr.value, 0);
                  const pct = total > 0 ? ((s.value / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: SECTOR_COLORS[s.name] || '#64748b' }}
                        />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-mono text-foreground font-semibold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Best & Worst Performers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Top Gainers */}
        <div className="bg-card/80 border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
            <Award className="w-4 h-4" />
            <span>Best Performers</span>
          </div>

          <div className="space-y-2">
            {bestPerformers.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs"
              >
                <div>
                  <span className="font-bold text-foreground block">{item.symbol}</span>
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold block">
                    +{item.profitLossPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-emerald-400/80">+{fmtCurrency(item.profitLoss)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers / Dips */}
        <div className="bg-card/80 border border-rose-500/20 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Worst Performers</span>
          </div>

          <div className="space-y-2">
            {worstPerformers.map((item) => {
              const isProfit = item.profitLoss >= 0;
              return (
                <div
                  key={item.symbol}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                    isProfit
                      ? 'bg-emerald-500/5 border-emerald-500/10'
                      : 'bg-rose-500/5 border-rose-500/10'
                  }`}
                >
                  <div>
                    <span className="font-bold text-foreground block">{item.symbol}</span>
                    <span className="text-[10px] text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span
                      className={`font-bold block ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{item.profitLossPercent.toFixed(2)}%
                    </span>
                    <span className={`text-[10px] ${isProfit ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                      {fmtCurrency(item.profitLoss)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
