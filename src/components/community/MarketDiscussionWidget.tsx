import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { CommunityPost } from '@/types/community';
import { subscribeCommunityPosts } from '@/lib/communityService';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';

interface MarketDiscussionWidgetProps {
  symbol: string;
}

export function MarketDiscussionWidget({ symbol }: MarketDiscussionWidgetProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    const unsub = subscribeCommunityPosts({ symbol }, (list) => {
      setPosts(list);
      setLoading(false);
    });
    return () => unsub();
  }, [symbol]);

  const cleanSymbol = symbol.toUpperCase().replace('$', '');

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-4 sm:p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">${cleanSymbol} Community Discussion</h3>
            <p className="text-[10px] font-mono text-muted-foreground">Real-time trader opinions & analysis</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Post ${cleanSymbol} Setup</span>
        </button>
      </div>

      {loading ? (
        <div className="h-28 bg-secondary/30 rounded-2xl animate-pulse" />
      ) : posts.length === 0 ? (
        <div className="bg-secondary/20 border border-border/60 rounded-2xl p-6 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
          <p className="font-semibold text-xs text-foreground">No posts yet for ${cleanSymbol}</p>
          <p className="text-[11px] text-muted-foreground">
            Be the first trader to share key levels, price targets, or news for ${cleanSymbol}!
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="text-xs font-mono text-primary font-bold hover:underline pt-1 inline-block cursor-pointer"
          >
            + Start ${cleanSymbol} Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultSymbol={cleanSymbol}
        defaultCategory="analysis"
      />
    </div>
  );
}
