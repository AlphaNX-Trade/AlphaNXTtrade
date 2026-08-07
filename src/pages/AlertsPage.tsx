import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  History,
  Clock,
  Sparkles,
} from 'lucide-react';
import { usePriceAlerts, PriceAlert } from '@/hooks/usePriceAlerts';
import { useAllAssets } from '@/hooks/useAllAssets';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function AlertsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const assets = useAllAssets();
  const { alerts, logs, addAlert, removeAlert, toggleAlert, clearLogs } = usePriceAlerts();

  const [activeTab, setActiveTab] = useState<'alerts' | 'history'>('alerts');
  const [isNewAlertOpen, setIsNewAlertOpen] = useState(false);

  // Form states for new alert
  const [selectedSymbol, setSelectedSymbol] = useState(assets?.[0]?.symbol || 'RELIANCE');
  const [alertType, setAlertType] = useState<PriceAlert['type']>('target_above');
  const [targetValueInput, setTargetValueInput] = useState('');
  const [alertNote, setAlertNote] = useState('');

  const selectedAsset = assets?.find((a) => a.symbol === selectedSymbol);

  const handleCreateAlert = () => {
    const val = parseFloat(targetValueInput);
    if (isNaN(val) || val <= 0) {
      toast({ title: 'Invalid Value', description: 'Please enter a valid positive target number.', variant: 'destructive' });
      return;
    }
    if (!selectedAsset) return;

    addAlert({
      symbol: selectedAsset.symbol,
      assetName: selectedAsset.name,
      type: alertType,
      targetValue: val,
      note: alertNote,
    });

    setIsNewAlertOpen(false);
    setTargetValueInput('');
    setAlertNote('');
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto relative pb-28">
      {/* Top Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/90 backdrop-blur-2xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted/80 cursor-pointer"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Bell className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight">Price & Market Alerts</span>
        </div>

        <button
          onClick={() => setIsNewAlertOpen(true)}
          className="p-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-18 pb-6 space-y-5">
        {/* Tab Switcher: Active Alerts vs History Log */}
        <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-2xl border border-border/60">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Active Alerts ({alerts.filter((a) => a.active).length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Triggered Log ({logs.length})
          </button>
        </div>

        {activeTab === 'alerts' ? (
          alerts.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No price alerts set"
              description="Create target price alerts or percentage gain/loss alerts to get notified instantly when assets reach key levels."
              actionLabel="Create Price Alert"
              onAction={() => setIsNewAlertOpen(true)}
              className="mt-6"
            />
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const currentAsset = assets?.find((a) => a.symbol === alert.symbol);
                return (
                  <div
                    key={alert.id}
                    className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-mono text-xs">
                          {alert.symbol.slice(0, 3)}
                        </div>

                        <div>
                          <p className="font-mono text-xs font-bold text-foreground">{alert.symbol}</p>
                          <p className="text-[11px] text-muted-foreground">{alert.assetName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch checked={alert.active} onCheckedChange={() => toggleAlert(alert.id)} />
                        <button
                          onClick={() => removeAlert(alert.id)}
                          className="p-1 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-background/60 border border-border/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="font-bold text-primary">
                        {alert.type === 'target_above' && `Price >= ₹${alert.targetValue.toLocaleString('en-IN')}`}
                        {alert.type === 'target_below' && `Price <= ₹${alert.targetValue.toLocaleString('en-IN')}`}
                        {alert.type === 'percent_change' && `Move >= ${alert.targetValue}%`}
                        {alert.type === 'daily_high' && `Hit Day High`}
                        {alert.type === 'daily_low' && `Hit Day Low`}
                        {alert.type === 'volume_spike' && `Volume > ${alert.targetValue}`}
                      </span>
                    </div>

                    {currentAsset && (
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>Current Price: ₹{currentAsset.price.toLocaleString('en-IN')}</span>
                        <span className={currentAsset.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {currentAsset.changePercent >= 0 ? '+' : ''}
                          {currentAsset.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No alert history yet"
            description="When target prices are hit, notifications will be logged here with historical timestamps."
            className="mt-6"
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-muted-foreground">Recent Triggers</span>
              <button
                onClick={clearLogs}
                className="text-xs text-rose-400 hover:underline font-mono cursor-pointer"
              >
                Clear Log
              </button>
            </div>

            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">{log.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Price Alert Dialog */}
      <Dialog open={isNewAlertOpen} onOpenChange={setIsNewAlertOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-2xl border-primary/20 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Create Price Alert
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Receive notifications when your target stock condition triggers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Select Asset */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Select Stock / Asset</label>
              <select
                value={selectedSymbol}
                onChange={(e) => {
                  setSelectedSymbol(e.target.value);
                  const a = assets?.find((item) => item.symbol === e.target.value);
                  if (a) setTargetValueInput(a.price.toString());
                }}
                className="w-full h-11 px-3 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none cursor-pointer"
              >
                {assets?.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} - {a.name} (₹{a.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Alert Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Alert Condition</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none cursor-pointer"
              >
                <option value="target_above">Price Rises Above (≥)</option>
                <option value="target_below">Price Drops Below (≤)</option>
                <option value="percent_change">Percentage Move (±%)</option>
                <option value="daily_high">Daily High Breached</option>
                <option value="daily_low">Daily Low Breached</option>
                <option value="volume_spike">Volume Spike</option>
              </select>
            </div>

            {/* Target Value Input */}
            {!alertType.startsWith('daily_') && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Target Value ({alertType === 'percent_change' ? '%' : alertType === 'volume_spike' ? 'Units' : '₹'})
                </label>
                <input
                  type="number"
                  placeholder={selectedAsset ? `Current: ₹${selectedAsset.price}` : 'e.g. 2500'}
                  value={targetValueInput}
                  onChange={(e) => setTargetValueInput(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none"
                />
              </div>
            )}

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Look to buy breakout"
                value={alertNote}
                onChange={(e) => setAlertNote(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewAlertOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAlert}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md"
              >
                Save Alert
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
