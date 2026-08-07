import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Power,
  ShieldAlert,
  TrendingUp,
  Layers,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  fetchMarketControls,
  updateMarketControls,
  MarketControls,
} from '@/lib/marketControlAdminService';
import { useAuth } from '@/contexts/AuthContext';

export function AdminMarketControls() {
  const { user: currentAdmin } = useAuth();

  const [controls, setControls] = useState<MarketControls>({
    marketEnabled: true,
    tradingEnabled: true,
    futuresEnabled: true,
    optionsEnabled: true,
    commodityEnabled: true,
    disabledStocks: [],
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketControls();
      setControls(data);
    } catch (err) {
      console.error('Failed to load market controls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (key: keyof MarketControls) => {
    if (typeof controls[key] !== 'boolean') return;

    const nextValue = !controls[key];
    const newControls = { ...controls, [key]: nextValue };

    setBusy(true);
    setFeedback(null);

    try {
      await updateMarketControls(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        newControls,
        `Admin toggled ${key} to ${nextValue}`,
      );
      setControls(newControls);
      setFeedback({
        type: 'success',
        msg: `Market control [${key}] updated to ${nextValue ? 'ENABLED' : 'DISABLED'}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to update controls.',
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-primary font-mono">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const items = [
    {
      key: 'marketEnabled' as keyof MarketControls,
      title: 'Global Market Engine',
      desc: 'Master kill switch for all market feed updates and live ticks.',
      icon: Activity,
    },
    {
      key: 'tradingEnabled' as keyof MarketControls,
      title: 'Global Order Execution',
      desc: 'Allow users to place BUY and SELL orders across all segments.',
      icon: Power,
    },
    {
      key: 'futuresEnabled' as keyof MarketControls,
      title: 'Futures Segment',
      desc: 'Enable or suspend Index & Stock Futures contracts trading.',
      icon: TrendingUp,
    },
    {
      key: 'optionsEnabled' as keyof MarketControls,
      title: 'Options Chain Segment',
      desc: 'Enable or suspend NIFTY, BANKNIFTY, FINNIFTY Options chains.',
      icon: Layers,
    },
    {
      key: 'commodityEnabled' as keyof MarketControls,
      title: 'Commodities Segment (MCX)',
      desc: 'Enable or suspend Gold, Silver, Crude Oil commodities trading.',
      icon: Coins,
    },
  ];

  return (
    <div className="space-y-5 text-slate-100 font-sans">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Live Market & Segment Controls</span>
        </h3>
        <p className="text-xs text-slate-400">
          Control active trading segments or issue instant market circuit halts across the system.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isEnabled = controls[item.key] as boolean;

          return (
            <div
              key={item.key}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                isEnabled
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-red-950/20 border-red-900/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Icon
                    className={`w-4 h-4 ${
                      isEnabled ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>

              <button
                onClick={() => handleToggle(item.key)}
                disabled={busy}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all shrink-0 cursor-pointer ${
                  isEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                {isEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
