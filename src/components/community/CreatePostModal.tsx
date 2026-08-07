import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  TrendingUp,
  BarChart2,
  HelpCircle,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Loader2,
  Trash2,
} from 'lucide-react';
import { PostCategory } from '@/types/community';
import { createCommunityPost } from '@/lib/communityService';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  defaultCategory?: PostCategory;
  onPostCreated?: () => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  defaultSymbol = '',
  defaultCategory = 'idea',
  onPostCreated,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [category, setCategory] = useState<PostCategory>(defaultCategory);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Log in to share trading posts.' });
      return;
    }

    if (!content.trim()) {
      toast({ title: 'Post Content Required', description: 'Please enter your idea or analysis.' });
      return;
    }

    setBusy(true);
    try {
      await createCommunityPost({
        authorUid: user.uid,
        authorName: profile?.fullName || 'Trader',
        authorUsername: profile?.username,
        authorAvatar: profile?.avatarUrl,
        authorTitle: profile?.title,
        authorLevel: profile?.level,
        content,
        category,
        symbol: symbol.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      toast({ title: 'Post Published!', description: 'Your trading post is live in the community.' });
      setContent('');
      setImageUrl('');
      setSymbol('');
      onClose();
      if (onPostCreated) onPostCreated();
    } catch (err) {
      toast({
        title: 'Failed to Post',
        description: err instanceof Error ? err.message : 'Error publishing post.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-primary/30 rounded-3xl p-5 sm:p-6 w-full max-w-lg space-y-4 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-foreground">Share Trading Insight</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Post Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                {[
                  { id: 'idea', label: 'Idea', icon: TrendingUp, color: 'emerald' },
                  { id: 'analysis', label: 'Analysis', icon: BarChart2, color: 'cyan' },
                  { id: 'question', label: 'Question', icon: HelpCircle, color: 'amber' },
                  { id: 'general', label: 'General', icon: Sparkles, color: 'purple' },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as PostCategory)}
                      className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm'
                          : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Stock Tag */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Tag Asset Symbol (Optional)</span>
                <span className="text-primary font-semibold">e.g. RELIANCE, TATAMOTORS</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="RELIANCE"
                  className="w-full bg-secondary/40 border border-border/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* Content Textarea */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Your Idea / Analysis
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="What is your trade setup, key levels, or market thesis?"
                required
                className="w-full bg-secondary/40 border border-border/80 rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            {/* Optional Chart/Image URL Attachment */}
            {showImageInput ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Chart Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/chart.png"
                    className="flex-1 bg-secondary/40 border border-border/80 rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setShowImageInput(false);
                    }}
                    className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowImageInput(true)}
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Attach Chart / Screenshot Link</span>
              </button>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              {content.trim() || imageUrl || symbol ? (
                <button
                  type="button"
                  onClick={() => {
                    setContent('');
                    setImageUrl('');
                    setSymbol('');
                    setShowImageInput(false);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                  title="Discard / Delete draft text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Draft</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !content.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Publish Post</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
