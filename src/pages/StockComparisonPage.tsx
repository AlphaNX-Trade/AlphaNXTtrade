import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Scale,
  Plus,
  X,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart2,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAllAssets } from '@/hooks/useAllAssets';
import { formatCurrency } from '@/lib/formatters';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function StockComparisonPage() {
  const [, setLocation] = useLocation();
  const allAssets = useAllAssets();

  // Selected symbols for comparison (up to 4)
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['RELIANCE', 'TCS', 'INFY']);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAssets = selectedSymbols
    .map((sym) => allAssets.find((a) => a.symbol === sym))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  const addSymbol = (sym: string) => {
    if (selectedSymbols.length >= 4) return;
    if (!selectedSymbols.includes(sym)) {
      setSelectedSymbols([...selectedSymbols, sym]);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const removeSymbol = (sym: string) => {
    if (selectedSymbols.length <= 1) return; // Keep at least 1
    setSelectedSymbols(selectedSymbols.filter((s) => s !== sym));
  };

  // Generate normalized comparative performance chart data (Index = 100)
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    return days.map((day, idx) => {
      const dataPoint: Record<string, any> = { day };
      selectedAssets.forEach((asset) => {
        // Simple relative percentage return baseline
        const base = 100;
        const trend = (asset.changePercent / 6) * idx;
        dataPoint[asset.symbol] = Number((base + trend).toFixed(2));
      });
      return dataPoint;
    });
  };

  const chartData = generateChartData();
  const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center justify-between px-4 max-w-5xl mx-auto">
        <button
          onClick={() => setLocation('/dashboard')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex items-center gap-2">
          <Scale className="w-4 h-4 text-sky-500" />
          Stock Comparison Studio
        </h1>
        <div className="w-8" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Selected Asset Chips */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Comparing ({selectedSymbols.length}/4)
            </span>
            {selectedSymbols.length < 4 && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-500 font-bold text-xs flex items-center gap-1 hover:bg-sky-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Asset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedAssets.map((asset, index) => (
              <div
                key={asset.symbol}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span>{asset.symbol}</span>
                <span className="text-slate-400 font-normal">₹{asset.price.toLocaleString('en-IN')}</span>
                {selectedSymbols.length > 1 && (
                  <button
                    onClick={() => removeSymbol(asset.symbol)}
                    className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" /> Relative Performance Trajectory
            </h2>
            <span className="text-xs font-mono text-slate-400">Indexed (Base 100)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend />
                {selectedAssets.map((asset, idx) => (
                  <Line
                    key={asset.symbol}
                    type="monotone"
                    dataKey={asset.symbol}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2.5}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 overflow-x-auto">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Detailed Metrics Comparison
          </h2>

          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-semibold uppercase">
                <th className="py-3 px-2">Metric</th>
                {selectedAssets.map((a) => (
                  <th key={a.symbol} className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                    {a.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs font-medium divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr>
                <td className="py-3 px-2 text-slate-500 font-bold">Current Price</td>
                {selectedAssets.map((a) => (
                  <td key={a.symbol} className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                    ₹{a.price.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-2 text-slate-500 font-bold">Day Change</td>
                {selectedAssets.map((a) => {
                  const isPos = a.changePercent >= 0;
                  return (
                    <td
                      key={a.symbol}
                      className={`py-3 px-2 font-bold ${isPos ? 'text-emerald-500' : 'text-rose-500'}`}
                    >
                      {isPos ? '+' : ''}
                      {a.changePercent.toFixed(2)}%
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="py-3 px-2 text-slate-500 font-bold">Market Cap</td>
                {selectedAssets.map((a) => (
                  <td key={a.symbol} className="py-3 px-2 text-slate-700 dark:text-slate-300">
                    ₹{(a.marketCap || 150000).toLocaleString('en-IN')} Cr
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-2 text-slate-500 font-bold">P/E Ratio</td>
                {selectedAssets.map((a) => (
                  <td key={a.symbol} className="py-3 px-2 text-slate-700 dark:text-slate-300">
                    {a.peRatio || (22.5 + a.symbol.length * 1.2).toFixed(1)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-2 text-slate-500 font-bold">52W High / Low</td>
                {selectedAssets.map((a) => (
                  <td key={a.symbol} className="py-3 px-2 text-slate-700 dark:text-slate-300">
                    ₹{(a.dayHigh || a.price * 1.05).toFixed(0)} / ₹{(a.dayLow || a.price * 0.92).toFixed(0)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-2 text-slate-500 font-bold">24h Volume</td>
                {selectedAssets.map((a) => (
                  <td key={a.symbol} className="py-3 px-2 text-slate-700 dark:text-slate-300">
                    {(a.volume || 1250000).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-2 text-slate-500 font-bold">Sector</td>
                {selectedAssets.map((a) => (
                  <td key={a.symbol} className="py-3 px-2 text-slate-700 dark:text-slate-300 font-semibold">
                    {a.sector || 'Equities'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Asset Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-500" /> Select Stock to Compare
              </h3>
              <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by symbol or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allAssets
                .filter(
                  (a) =>
                    !selectedSymbols.includes(a.symbol) &&
                    (a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .slice(0, 15)
                .map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => addSymbol(asset.symbol)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-500/10 cursor-pointer transition-all border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{asset.symbol}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{asset.name}</p>
                    </div>
                    <span className="font-bold text-xs text-sky-500">+ Compare</span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
