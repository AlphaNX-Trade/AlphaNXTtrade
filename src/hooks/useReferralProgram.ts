import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferredFriend {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: 'Registered' | 'Active Trader' | 'Reward Claimed';
  rewardAmount: number;
}

export interface ReferralLeaderboardUser {
  rank: number;
  name: string;
  referralsCount: number;
  totalEarned: number;
  isCurrentUser?: boolean;
}

const STORAGE_KEY = 'alphanxt_referral_data_v8';

export function useReferralProgram() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest';
  const userKey = `${STORAGE_KEY}_${userId}`;

  // Unique referral code derived from user or deterministic fallback
  const referralCode = user?.uid
    ? `ALPHA-${user.uid.slice(0, 6).toUpperCase()}`
    : 'ALPHA-TRADER99';

  const [referredFriends, setReferredFriends] = useState<ReferredFriend[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setReferredFriends(JSON.parse(saved));
      } else {
        // Initial sample referral history
        const initialFriends: ReferredFriend[] = [
          {
            id: 'ref_1',
            name: 'Vikram Sharma',
            email: 'vikram.s***@gmail.com',
            joinedAt: '2026-07-28',
            status: 'Reward Claimed',
            rewardAmount: 1000,
          },
          {
            id: 'ref_2',
            name: 'Ananya Roy',
            email: 'ananya.r***@yahoo.com',
            joinedAt: '2026-08-02',
            status: 'Active Trader',
            rewardAmount: 500,
          },
        ];
        setReferredFriends(initialFriends);
      }
    } catch {
      setReferredFriends([]);
    }
  }, [userKey]);

  const totalRewardsEarned = referredFriends.reduce((acc, f) => acc + f.rewardAmount, 0);

  const leaderboard: ReferralLeaderboardUser[] = [
    { rank: 1, name: 'Aarav Mehta', referralsCount: 42, totalEarned: 42000 },
    { rank: 2, name: 'Priya Patel', referralsCount: 38, totalEarned: 38000 },
    { rank: 3, name: user?.displayName || 'You', referralsCount: referredFriends.length, totalEarned: totalRewardsEarned, isCurrentUser: true },
    { rank: 4, name: 'Rohan Gupta', referralsCount: 15, totalEarned: 15000 },
    { rank: 5, name: 'Sneha Verma', referralsCount: 11, totalEarned: 11000 },
  ].sort((a, b) => b.referralsCount - a.referralsCount).map((item, idx) => ({ ...item, rank: idx + 1 }));

  const simulateInvite = useCallback(
    (friendName: string, friendEmail: string) => {
      const newFriend: ReferredFriend = {
        id: `ref_${Date.now()}`,
        name: friendName,
        email: friendEmail.replace(/(.{2})(.*)(?=@)/, (_, b, c) => b + '*'.repeat(c.length)),
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'Active Trader',
        rewardAmount: 500,
      };

      const updated = [newFriend, ...referredFriends];
      setReferredFriends(updated);
      try {
        localStorage.setItem(userKey, JSON.stringify(updated));
      } catch {}
    },
    [referredFriends, userKey]
  );

  return {
    referralCode,
    referralLink: `${window.location.origin}/register?ref=${referralCode}`,
    referredFriends,
    totalRewardsEarned,
    leaderboard,
    simulateInvite,
  };
}
