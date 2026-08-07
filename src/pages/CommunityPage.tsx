import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  BarChart2,
  HelpCircle,
  Bookmark,
  UserCheck,
  Trophy,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react';
import { CommunityPost, PostCategory } from '@/types/community';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeCommunityPosts, getFollowingUids } from '@/lib/communityService';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';

export default function CommunityPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'idea' | 'analysis' | 'question' | 'following' | 'saved' | 'myposts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [followingUids, setFollowingUids] = useState<string[]>([]);

  // Load following UIDs for 'following' tab
  useEffect(() => {
    if (user && activeTab === 'following') {
      getFollowingUids(user.uid).then((uids) => setFollowingUids(uids));
    }
  }, [user, activeTab]);

  // Subscribe to community posts
  useEffect(() => {
    setLoading(true);

    const filter: Parameters<typeof subscribeCommunityPosts>[0] = {};

    if (activeTab === 'idea' || activeTab === 'analysis' || activeTab === 'question') {
      filter.category = activeTab;
    } else if (activeTab === 'myposts' && user) {
      filter.authorUid = user.uid;
    } else if (activeTab === 'saved' && user) {
      filter.savedByUid = user.uid;
    } else if (activeTab === 'following' && user) {
      filter.followingUids = followingUids;
    }

    const unsub = subscribeCommunityPosts(
      filter,
      (list) => {
        setPosts(list);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsub();
  }, [activeTab, user, followingUids]);

  // Filter posts by search query
  const filteredPosts = posts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      (p.symbol && p.symbol.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-4xl mx-auto pb-24 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/80 px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLocation('/dashboard')}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-base text-foreground leading-none">Trading Community</h1>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Social Ideas, Analysis & Discussions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation('/leaderboard')}
            className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 font-mono text-xs cursor-pointer"
            title="View Trader Leaderboard"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Leaderboard</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Post Idea</span>
          </button>
        </div>
      </header>

      {/* Search & Tabs Section */}
      <div className="p-4 space-y-3 border-b border-border/50 bg-card/40">
        {/* Search Input */}
        <div className="relative font-mono text-xs">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ideas, traders, or symbols ($RELIANCE, $NIFTY50)..."
            className="w-full bg-secondary/40 border border-border/80 rounded-2xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {[
            { id: 'all', label: 'All Ideas', icon: Sparkles },
            { id: 'idea', label: 'Ideas', icon: TrendingUp },
            { id: 'analysis', label: 'Analysis', icon: BarChart2 },
            { id: 'question', label: 'Questions', icon: HelpCircle },
            { id: 'following', label: 'Following', icon: UserCheck },
            { id: 'saved', label: 'Saved', icon: Bookmark },
            { id: 'myposts', label: 'My Posts', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold border-primary shadow-sm'
                    : 'bg-card/80 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feed Content */}
      <main className="flex-1 p-4 space-y-3.5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-card border border-border/80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-card/50 border border-border/80 rounded-3xl p-10 text-center space-y-3 max-w-md mx-auto my-8">
            <Users className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">No posts found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchQuery
                  ? 'No posts matching your search query.'
                  : activeTab === 'following'
                  ? 'You are not following any traders yet or they haven\'t posted.'
                  : activeTab === 'saved'
                  ? 'You haven\'t saved any trading posts yet.'
                  : 'Be the first to share a trading setup or analysis!'}
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Share First Idea</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>

      {/* Create Post Modal */}
      <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
