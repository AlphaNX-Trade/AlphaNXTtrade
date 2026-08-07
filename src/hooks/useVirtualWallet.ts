import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useHoldings } from '@/hooks/useHoldings';
import {
  VIRTUAL_FUND_PACKAGES,
  VirtualFundPackage,
  WalletCreditTransaction,
  purchaseVirtualFundPackage,
  fetchUserCreditTransactions,
} from '@/lib/virtualWalletService';
import { useToast } from '@/hooks/use-toast';

export function useVirtualWallet() {
  const { user } = useAuth();
  const { profile, profileLoading } = useUserProfile();
  const { totalInvested, totalCurrentValue } = useHoldings();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<WalletCreditTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const virtualBalance = profile?.virtualBalance ?? 100000;
  const portfolioValue = virtualBalance + totalCurrentValue;
  const usedMargin = totalInvested;
  const availableMargin = virtualBalance;
  const investedAmount = totalInvested;

  const refreshHistory = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setHistoryLoading(false);
      return;
    }
    try {
      setHistoryLoading(true);
      const list = await fetchUserCreditTransactions(user.uid);
      setTransactions(list);
    } catch (err) {
      console.warn('Failed to fetch wallet history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const buyPackage = async (
    pkg: VirtualFundPackage,
    paymentMethod: string = 'UPI / Card Simulator',
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to purchase virtual balance packages.',
        variant: 'destructive',
      });
      return false;
    }

    setIsProcessing(true);
    try {
      const res = await purchaseVirtualFundPackage(user.uid, user.email || '', pkg, paymentMethod);
      await refreshHistory();
      return res;
    } catch (err: any) {
      toast({
        title: 'Purchase Failed',
        description: err.message || 'Could not complete virtual fund transaction.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    virtualBalance,
    portfolioValue,
    usedMargin,
    availableMargin,
    investedAmount,
    packages: VIRTUAL_FUND_PACKAGES,
    transactions,
    historyLoading,
    isProcessing,
    buyPackage,
    refreshHistory,
    profileLoading,
  };
}
