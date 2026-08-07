import { Timestamp } from 'firebase/firestore';

export type PostCategory = 'idea' | 'analysis' | 'question' | 'general';

export interface CommunityPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  authorTitle?: string;
  authorLevel?: string;
  content: string;
  category: PostCategory;
  symbol?: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  likedBy: string[]; // UIDs of users who liked
  savedBy: string[]; // UIDs of users who saved
  createdAt: any; // Timestamp or ISO
  updatedAt?: any;
  isFlagged?: boolean;
  isRemoved?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  content: string;
  createdAt: any;
  likesCount?: number;
  likedBy?: string[];
  isRemoved?: boolean;
}

export interface UserFollowState {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  senderUid: string;
  senderName: string;
  senderAvatar?: string;
  type: 'follow' | 'like' | 'comment' | 'rank_change' | 'mention' | 'system';
  postId?: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export type LeaderboardType = 'return' | 'activity' | 'level' | 'referrals';
export type LeaderboardTimeframe = 'daily' | 'weekly' | 'monthly' | 'alltime';

export interface LeaderboardEntry {
  uid: string;
  fullName: string;
  username?: string;
  avatarUrl?: string;
  title?: string;
  level?: string;
  rank: number;
  score: number;
  displayMetric: string;
  isPortfolioPublic?: boolean;
  portfolioValue?: number;
  returnPercent?: number;
  totalTrades?: number;
  referralsCount?: number;
}
