import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Trash2,
  ShieldAlert,
  Send,
  MoreVertical,
  TrendingUp,
  HelpCircle,
  BarChart2,
  Sparkles,
  User,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { CommunityPost, PostComment } from '@/types/community';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserAvatar } from '@/components/common/UserAvatar';
import { isAdminEmail } from '@/lib/adminConfig';
import {
  toggleLikePost,
  toggleSavePost,
  addPostComment,
  subscribePostComments,
  deleteCommunityPost,
  deleteCommunityComment,
  adminDeletePost,
} from '@/lib/communityService';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: CommunityPost;
  onPostUpdated?: () => void;
  key?: string | number;
}

export function PostCard({ post, onPostUpdated }: PostCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(post.savesCount);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const isAdmin = user && isAdminEmail(user.email);
  const isAuthor = Boolean(user && (user.uid === post.authorUid || user.email === post.authorUid));
  const canDeletePost = Boolean(isAdmin || isAuthor || !post.authorUid || (user && user.uid));

  useEffect(() => {
    if (user) {
      setLiked(post.likedBy?.includes(user.uid) || false);
      setSaved(post.savedBy?.includes(user.uid) || false);
    }
  }, [user, post.likedBy, post.savedBy]);

  useEffect(() => {
    if (showComments && post.id) {
      const unsub = subscribePostComments(post.id, (list) => setComments(list));
      return () => unsub();
    }
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in to like posts.' });
      return;
    }
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await toggleLikePost(
        post.id,
        user.uid,
        profile?.fullName || 'Trader',
        profile?.avatarUrl,
      );
    } catch (err) {
      // Revert on error
      setLiked(!newLikedState);
      setLikesCount((prev) => (newLikedState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in to save posts.' });
      return;
    }
    const newSavedState = !saved;
    setSaved(newSavedState);
    setSavesCount((prev) => (newSavedState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await toggleSavePost(post.id, user.uid);
      toast({
        title: newSavedState ? 'Post Saved' : 'Post Removed',
        description: newSavedState ? 'Added to your saved trading posts.' : 'Removed from saved posts.',
      });
    } catch (err) {
      setSaved(!newSavedState);
      setSavesCount((prev) => (newSavedState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addPostComment({
        postId: post.id,
        authorUid: user.uid,
        authorName: profile?.fullName || 'Trader',
        authorUsername: profile?.username,
        authorAvatar: profile?.avatarUrl,
        content: commentText.trim(),
      });
      setCommentText('');
      toast({ title: 'Comment Posted', description: 'Your reply has been added.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add comment.' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/community?post=${post.id}`;
    if (navigator.share) {
      navigator.share({ title: `Trading Idea by ${post.authorName}`, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Link Copied', description: 'Post link copied to clipboard.' });
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    setIsDeleting(true);
    try {
      if (user) {
        await deleteCommunityPost(post.id, user.uid);
      } else {
        await adminDeletePost(post.id);
      }
      toast({ title: 'Post Deleted', description: 'Your post has been removed from the feed.' });
      setShowDeleteConfirm(false);
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete post.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      if (user) {
        await deleteCommunityComment(post.id, commentToDelete, user.uid);
        toast({ title: 'Comment Deleted', description: 'Your comment has been removed.' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete comment.' });
    } finally {
      setCommentToDelete(null);
    }
  };

  const categoryBadge = () => {
    switch (post.category) {
      case 'idea':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Idea
          </span>
        );
      case 'analysis':
        return (
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            <BarChart2 className="w-3 h-3" /> Analysis
          </span>
        );
      case 'question':
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Question
          </span>
        );
      default:
        return (
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Discussion
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/90 backdrop-blur-xl border border-border/80 hover:border-primary/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div
          onClick={() => setLocation(`/profile/${post.authorUid}`)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <UserAvatar
            src={post.authorAvatar}
            name={post.authorName}
            size="md"
            showBadge
            level={post.authorLevel ? post.authorLevel.replace('Level ', 'L') : undefined}
          />

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {post.authorName}
              </span>
              {post.authorUsername && (
                <span className="text-xs font-mono text-muted-foreground">@{post.authorUsername}</span>
              )}
              {post.authorTitle && (
                <span className="bg-cyan-500/15 text-cyan-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/30">
                  {post.authorTitle}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground/80">
              Trading Idea • {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {categoryBadge()}
          {post.symbol && (
            <button
              onClick={() => setLocation(`/markets/${post.symbol}`)}
              className="bg-primary/10 text-primary border border-primary/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
            >
              ${post.symbol}
            </button>
          )}
          {canDeletePost && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              title="Delete Post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Optional Attachment Image */}
      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-border/80 max-h-80 bg-black/40">
          <img src={post.imageUrl} alt="Attached Chart" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Actions Row */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground font-mono">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-primary/10 ${
            liked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-primary/10 hover:text-primary"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{post.commentsCount || comments.length} Replies</span>
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-primary/10 ${
            saved ? 'text-amber-400 font-bold' : 'hover:text-amber-400'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-400 stroke-amber-400' : ''}`} />
          <span>{savesCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-primary/10 hover:text-primary"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>Share</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-border/50 space-y-3 overflow-hidden"
          >
            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your analysis or reply..."
                  className="flex-1 bg-secondary/50 border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            ) : (
              <p className="text-xs font-mono text-muted-foreground italic text-center">
                Log in to join the discussion.
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground text-center py-2">
                  No replies yet. Be the first to start the conversation!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-secondary/30 border border-border/40 rounded-xl p-2.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => setLocation(`/profile/${comment.authorUid}`)}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <UserAvatar src={comment.authorAvatar} name={comment.authorName} size="xs" />
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {comment.authorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {comment.createdAt?.toDate
                            ? comment.createdAt.toDate().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                        {(user?.uid === comment.authorUid || isAdmin || isAuthor || !comment.authorUid) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground/80 leading-snug">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-destructive/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Delete Post?</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-foreground/80 bg-secondary/30 p-3 rounded-xl border border-border/50">
                Are you sure you want to permanently delete this post from the community feed?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePost}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Yes, Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comment Delete Confirmation Modal */}
      <AnimatePresence>
        {commentToDelete && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Delete Comment?</h3>
                  <p className="text-xs text-muted-foreground">Are you sure you want to remove this comment?</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCommentToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteComment}
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
