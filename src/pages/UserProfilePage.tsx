import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  User,
  Shield,
  Trophy,
  Lock,
  UserCheck,
  UserPlus,
  BarChart2,
  TrendingUp,
  Award,
  Wallet,
  Globe,
  Settings,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  MapPin,
  Briefcase,
  PieChart,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserAvatar } from '@/components/common/UserAvatar';
import { TraderLevelCard } from '@/components/profile/TraderLevelCard';
import {
  followUser,
  unfollowUser,
  subscribeIsFollowing,
  subscribeFollowCounts,
  subscribeCommunityPosts,
} from '@/lib/communityService';
import { CommunityPost } from '@/types/community';
import { PostCard } from '@/components/community/PostCard';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { useToast } from '@/hooks/use-toast';

export default function UserProfilePage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ userId?: string }>('/profile/:userId');
  const targetUid = params?.userId;

  const { user } = useAuth();
  const { profile: currentProfile } = useUserProfile();
  const { toast } = useToast();

  const isOwnProfile = !targetUid || targetUid === user?.uid;
  const effectiveUid = isOwnProfile ? user?.uid : targetUid;

  const [targetUserData, setTargetUserData] = useState<any>(null);
  const [targetPortfolio, setTargetPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);

  // Load target user profile doc
  useEffect(() => {
    if (!effectiveUid) return;

    setLoading(true);
    const loadUserData = async () => {
      try {
        const uSnap = await getDoc(doc(db, 'users', effectiveUid));
        if (uSnap.exists()) {
          setTargetUserData(uSnap.data());
        }

        const pSnap = await getDoc(doc(db, 'portfolio', effectiveUid));
        if (pSnap.exists()) {
          setTargetPortfolio(pSnap.data());
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [effectiveUid]);

  // Subscribe follow status and counts
  useEffect(() => {
    if (!effectiveUid) return;

    const unsubCounts = subscribeFollowCounts(effectiveUid, (data) => {
      setFollowersCount(data.followersCount);
      setFollowingCount(data.followingCount);
    });

    let unsubFollow = () => {};
    if (user && !isOwnProfile) {
      unsubFollow = subscribeIsFollowing(user.uid, effectiveUid, (following) => {
        setIsFollowing(following);
      });
    }

    return () => {
      unsubCounts();
      unsubFollow();
    };
  }, [user, effectiveUid, isOwnProfile]);

  // Subscribe to user posts
  useEffect(() => {
    if (!effectiveUid) return;
    const unsub = subscribeCommunityPosts({ authorUid: effectiveUid }, (list) => {
      setUserPosts(list);
    });
    return () => unsub();
  }, [effectiveUid]);

  const handleFollowToggle = async () => {
    if (!user || !effectiveUid) {
      toast({ title: 'Authentication Required', description: 'Log in to follow traders.' });
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(user.uid, effectiveUid);
        toast({ title: 'Unfollowed', description: `You unfollowed this trader.` });
      } else {
        await followUser(
          user.uid,
          effectiveUid,
          currentProfile?.fullName || 'Trader',
          currentProfile?.avatarUrl,
        );
        toast({ title: 'Following!', description: `You are now following this trader.` });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update follow status.' });
    }
  };

  const displayData = isOwnProfile ? currentProfile : targetUserData;
  const portfolioData = isOwnProfile ? currentProfile : targetPortfolio;

  const isPublic = isOwnProfile || (displayData?.isPortfolioPublic ?? true);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-4xl mx-auto pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/80 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLocation('/community')}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-base text-foreground">
            {isOwnProfile ? 'My Profile' : displayData?.fullName || 'Trader Profile'}
          </span>
        </div>

        {isOwnProfile && (
          <button
            onClick={() => setLocation('/edit-profile')}
            className="p-2 rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
            title="Edit Profile & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* Main Profile Card */}
      <main className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="h-64 bg-card border border-border/80 rounded-3xl animate-pulse" />
        ) : (
          <>
            {/* Top Identity Banner */}
            <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={displayData?.avatarUrl}
                    name={displayData?.fullName}
                    frame={displayData?.avatarFrame}
                    size="2xl"
                    showBadge
                    level={displayData?.level}
                    onClick={() => isOwnProfile && setLocation('/edit-profile')}
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-lg sm:text-xl text-foreground">
                        {displayData?.fullName || 'Anonymous Trader'}
                      </h2>
                      {displayData?.title && (
                        <span className="bg-cyan-500/15 text-cyan-400 font-mono text-xs px-2 py-0.5 rounded-md border border-cyan-500/30 font-semibold">
                          {displayData.title}
                        </span>
                      )}
                    </div>

                    {displayData?.username && (
                      <p className="text-xs font-mono text-muted-foreground">@{displayData.username}</p>
                    )}

                    {/* Location & Experience Tags */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-muted-foreground pt-0.5">
                      {displayData?.country && (
                        <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md border border-border/60">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>
                            {displayData.city ? `${displayData.city}, ` : ''}
                            {displayData.country}
                          </span>
                        </span>
                      )}
                      {displayData?.tradingExperience && (
                        <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md border border-border/60">
                          <Briefcase className="w-3 h-3 text-emerald-400" />
                          <span>{displayData.tradingExperience}</span>
                        </span>
                      )}
                      {displayData?.favouriteMarket && (
                        <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md border border-border/60">
                          <TrendingUp className="w-3 h-3 text-cyan-400" />
                          <span>{displayData.favouriteMarket}</span>
                        </span>
                      )}
                    </div>

                    {displayData?.bio && (
                      <p className="text-xs text-foreground/80 max-w-md pt-1">{displayData.bio}</p>
                    )}
                  </div>
                </div>

                {/* Follow Button for non-self profile */}
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-5 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      isFollowing
                        ? 'bg-secondary/80 text-foreground border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow Trader</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 font-mono text-center">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase text-muted-foreground">Posts</p>
                  <p className="font-bold text-sm text-foreground">{userPosts.length}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase text-muted-foreground">Followers</p>
                  <p className="font-bold text-sm text-foreground">{followersCount}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase text-muted-foreground">Following</p>
                  <p className="font-bold text-sm text-foreground">{followingCount}</p>
                </div>
              </div>

              {/* Trader Level Progression Card */}
              <TraderLevelCard
                totalProfitLoss={portfolioData?.totalProfitLoss || 0}
                virtualBalance={portfolioData?.virtualBalance || 1000000}
                portfolioValue={portfolioData?.portfolioValue || 0}
              />

              {/* Portfolio Performance (User Privacy Controlled) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                    Portfolio Performance
                  </span>
                  {!isPublic && (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Private Portfolio
                    </span>
                  )}
                </div>

                {isPublic ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/40 border border-border/80 rounded-2xl p-3 space-y-1">
                      <p className="text-[10px] font-mono uppercase text-muted-foreground">Portfolio Value</p>
                      <p className="font-mono font-bold text-base text-foreground">
                        ₹{(portfolioData?.portfolioValue || 100000).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="bg-secondary/40 border border-border/80 rounded-2xl p-3 space-y-1">
                      <p className="text-[10px] font-mono uppercase text-muted-foreground">Total Return</p>
                      <p
                        className={`font-mono font-bold text-base ${
                          (portfolioData?.totalProfitLoss || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(portfolioData?.totalProfitLoss || 0) >= 0 ? '+' : ''}
                        ₹{(portfolioData?.totalProfitLoss || 0).toLocaleString('en-IN')} (
                        {(((portfolioData?.totalProfitLoss || 0) / 100000) * 100).toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary/20 border border-border/60 rounded-2xl p-6 text-center space-y-2">
                    <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
                    <p className="text-xs font-mono text-muted-foreground">
                      This trader keeps their portfolio metrics private.
                    </p>
                  </div>
                )}
              </div>

              {/* Achievement Badges */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Achievement Badges
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'verified', label: 'Verified Trader', icon: CheckCircle2, color: 'emerald' },
                    { id: 'alpha', label: 'Alpha NXT Founder', icon: Sparkles, color: 'cyan' },
                    { id: 'pro', label: 'Risk Manager', icon: Shield, color: 'purple' },
                    { id: 'top', label: 'Top 10 Return', icon: Trophy, color: 'amber' },
                  ].map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <span
                        key={badge.id}
                        className="bg-card border border-border/80 rounded-xl px-2.5 py-1 text-[11px] font-mono text-foreground/90 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        <span>{badge.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User Posts Section */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-base text-foreground font-sans flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Trading Ideas & Posts ({userPosts.length})</span>
              </h3>

              {userPosts.length === 0 ? (
                <div className="bg-card/50 border border-border/80 rounded-2xl p-6 text-center text-xs font-mono text-muted-foreground">
                  No public posts published yet.
                </div>
              ) : (
                userPosts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
