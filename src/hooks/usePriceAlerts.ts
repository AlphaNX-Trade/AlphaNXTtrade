import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllAssets } from '@/hooks/useAllAssets';
import { useToast } from '@/hooks/use-toast';

export interface PriceAlert {
  id: string;
  symbol: string;
  assetName: string;
  type: 'target_above' | 'target_below' | 'percent_change' | 'daily_high' | 'daily_low' | 'volume_spike';
  targetValue: number; // price or percentage
  active: boolean;
  createdAt: string;
  note?: string;
  triggeredCount?: number;
  lastTriggeredAt?: string;
}

export interface AlertHistoryLog {
  id: string;
  alertId: string;
  symbol: string;
  title: string;
  message: string;
  triggeredAt: string;
  currentPrice: number;
}

const STORAGE_KEY_ALERTS = 'alphanxt_price_alerts_v5';
const STORAGE_KEY_LOGS = 'alphanxt_alert_history_v5';

export function usePriceAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const assets = useAllAssets();

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [logs, setLogs] = useState<AlertHistoryLog[]>([]);

  // Load from localStorage whenever user.uid changes
  useEffect(() => {
    try {
      const savedAlerts = localStorage.getItem(`${STORAGE_KEY_ALERTS}_${user?.uid || 'guest'}`);
      setAlerts(savedAlerts ? JSON.parse(savedAlerts) : []);

      const savedLogs = localStorage.getItem(`${STORAGE_KEY_LOGS}_${user?.uid || 'guest'}`);
      setLogs(savedLogs ? JSON.parse(savedLogs) : []);
    } catch (err) {
      console.error('Failed to load alerts from storage', err);
    }
  }, [user?.uid]);

  // Save to localStorage whenever alerts change
  useEffect(() => {
    if (!alerts) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_ALERTS}_${user?.uid || 'guest'}`, JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts', e);
    }
  }, [alerts, user?.uid]);

  useEffect(() => {
    if (!logs) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_LOGS}_${user?.uid || 'guest'}`, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save alert logs', e);
    }
  }, [logs, user?.uid]);

  // Live monitor assets for alert triggers
  useEffect(() => {
    if (!assets || assets.length === 0 || alerts.length === 0) return;

    alerts.forEach((alert) => {
      if (!alert.active) return;

      const asset = assets.find((a) => a.symbol === alert.symbol);
      if (!asset) return;

      let triggered = false;
      let title = '';
      let message = '';

      switch (alert.type) {
        case 'target_above':
          if (asset.price >= alert.targetValue) {
            triggered = true;
            title = `🚀 Target Reached: ${alert.symbol}`;
            message = `${alert.symbol} reached ₹${asset.price.toLocaleString('en-IN')} (Target: ₹${alert.targetValue.toLocaleString('en-IN')})`;
          }
          break;
        case 'target_below':
          if (asset.price <= alert.targetValue) {
            triggered = true;
            title = `📉 Price Dip: ${alert.symbol}`;
            message = `${alert.symbol} fell to ₹${asset.price.toLocaleString('en-IN')} (Target: ₹${alert.targetValue.toLocaleString('en-IN')})`;
          }
          break;
        case 'percent_change':
          if (Math.abs(asset.changePercent) >= Math.abs(alert.targetValue)) {
            triggered = true;
            title = `⚡ Volatility Alert: ${alert.symbol}`;
            message = `${alert.symbol} moved ${asset.changePercent >= 0 ? '+' : ''}${asset.changePercent.toFixed(2)}% today (Threshold: ${alert.targetValue}%)`;
          }
          break;
        case 'daily_high':
          if (asset.price >= (asset.dayHigh ?? asset.price * 1.02)) {
            triggered = true;
            title = `🔝 Daily High: ${alert.symbol}`;
            message = `${alert.symbol} hit a new day high of ₹${asset.price.toLocaleString('en-IN')}`;
          }
          break;
        case 'daily_low':
          if (asset.price <= (asset.dayLow ?? asset.price * 0.98)) {
            triggered = true;
            title = `🔻 Daily Low: ${alert.symbol}`;
            message = `${alert.symbol} touched a day low of ₹${asset.price.toLocaleString('en-IN')}`;
          }
          break;
        case 'volume_spike':
          if ((asset.volume ?? 0) > alert.targetValue) {
            triggered = true;
            title = `📊 Volume Spike: ${alert.symbol}`;
            message = `${alert.symbol} trading volume surged past ${alert.targetValue.toLocaleString('en-IN')} units!`;
          }
          break;
      }

      if (triggered) {
        // Prevent duplicate spam within 5 minutes
        const nowMs = Date.now();
        const lastMs = alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt).getTime() : 0;
        if (nowMs - lastMs < 5 * 60 * 1000) return;

        // Trigger toast notification
        toast({
          title,
          description: message,
        });

        // Log to alert history
        const newLog: AlertHistoryLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          alertId: alert.id,
          symbol: alert.symbol,
          title,
          message,
          triggeredAt: new Date().toISOString(),
          currentPrice: asset.price,
        };

        setLogs((prev) => [newLog, ...prev]);

        // Update alert trigger count & timestamp
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id
              ? {
                  ...a,
                  lastTriggeredAt: new Date().toISOString(),
                  triggeredCount: (a.triggeredCount || 0) + 1,
                  // Option to turn off target alerts after trigger
                  active: a.type.startsWith('target_') ? false : a.active,
                }
              : a,
          ),
        );
      }
    });
  }, [assets, alerts, toast]);

  const addAlert = (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'active' | 'triggeredCount'>) => {
    const alertItem: PriceAlert = {
      ...newAlert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      active: true,
      triggeredCount: 0,
    };
    setAlerts((prev) => [alertItem, ...prev]);
    toast({
      title: 'Alert Set',
      description: `Price alert configured for ${newAlert.symbol}`,
    });
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast({
      title: 'Alert Removed',
      description: 'The price alert was deleted.',
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    alerts,
    logs,
    addAlert,
    removeAlert,
    toggleAlert,
    clearLogs,
  };
}
