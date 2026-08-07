import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  CommunityPost,
  PostComment,
  NotificationItem,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardTimeframe,
  PostCategory,
} from '@/types/community';

// ─── POSTS ──────────────────────────────────────────────────────────────────

export async function createCommunityPost(data: {
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
}): Promise<string> {
  // Check if author is suspended or banned
  const userSnap = await getDoc(doc(db, 'users', data.authorUid));
  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.isPostingSuspended) {
      throw new Error('Your posting privileges have been suspended by an administrator.');
    }
    if (userData.isBanned) {
      throw new Error('Your account has been restricted from community participation.');
    }
  }

  const postsRef = collection(db, 'posts');
  const cleanSymbol = data.symbol?.trim().toUpperCase().replace('$', '') || null;

  const docRef = await addDoc(postsRef, {
    authorUid: data.authorUid,
    authorName: data.authorName,
    authorUsername: data.authorUsername || null,
    authorAvatar: data.authorAvatar || null,
    authorTitle: data.authorTitle || null,
    authorLevel: data.authorLevel || 'Beginner',
    content: data.content.trim(),
    category: data.category,
    symbol: cleanSymbol,
    imageUrl: data.imageUrl?.trim() || null,
    likesCount: 0,
    commentsCount: 0,
    savesCount: 0,
    likedBy: [],
    savedBy: [],
    isFlagged: false,
    isRemoved: false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribeCommunityPosts(
  filter: {
    category?: string;
    symbol?: string;
    authorUid?: string;
    savedByUid?: string;
    followingUids?: string[];
  },
  callback: (posts: CommunityPost[]) => void,
  errorCallback?: (err: Error) => void,
): Unsubscribe {
  const postsRef = collection(db, 'posts');

  // Basic real-time query
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snap) => {
      let posts: CommunityPost[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          authorUid: data.authorUid || '',
          authorName: data.authorName || 'Anonymous',
          authorUsername: data.authorUsername || undefined,
          authorAvatar: data.authorAvatar || undefined,
          authorTitle: data.authorTitle || undefined,
          authorLevel: data.authorLevel || undefined,
          content: data.content || '',
          category: data.category || 'general',
          symbol: data.symbol || undefined,
          imageUrl: data.imageUrl || undefined,
          likesCount: data.likesCount || 0,
          commentsCount: data.commentsCount || 0,
          savesCount: data.savesCount || 0,
          likedBy: data.likedBy || [],
          savedBy: data.savedBy || [],
          createdAt: data.createdAt,
          isFlagged: data.isFlagged || false,
          isRemoved: data.isRemoved || false,
        };
      });

      // Filter non-removed posts
      posts = posts.filter((p) => !p.isRemoved);

      // Client-side filtering for sub-views if needed
      if (filter.category && filter.category !== 'all') {
        posts = posts.filter((p) => p.category === filter.category);
      }

      if (filter.symbol) {
        const targetSym = filter.symbol.toUpperCase().replace('$', '');
        posts = posts.filter((p) => p.symbol === targetSym);
      }

      if (filter.authorUid) {
        posts = posts.filter((p) => p.authorUid === filter.authorUid);
      }

      if (filter.savedByUid) {
        posts = posts.filter((p) => p.savedBy?.includes(filter.savedByUid!));
      }

      if (filter.followingUids && filter.followingUids.length > 0) {
        posts = posts.filter((p) => filter.followingUids!.includes(p.authorUid));
      }

      callback(posts);
    },
    (err) => {
      console.error('Error subscribing to community posts:', err);
      if (errorCallback) errorCallback(err);
    },
  );
}

export async function toggleLikePost(
  postId: string,
  userUid: string,
  userName: string,
  userAvatar?: string,
): Promise<boolean> {
  const postRef = doc(db, 'posts', postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return false;

  const data = snap.data();
  const likedBy: string[] = data.likedBy || [];
  const isLiked = likedBy.includes(userUid);

  if (isLiked) {
    await updateDoc(postRef, {
      likedBy: arrayRemove(userUid),
      likesCount: increment(-1),
    });
    return false;
  } else {
    await updateDoc(postRef, {
      likedBy: arrayUnion(userUid),
      likesCount: increment(1),
    });

    // Notify author if different user
    if (data.authorUid && data.authorUid !== userUid) {
      await createNotification({
        recipientUid: data.authorUid,
        senderUid: userUid,
        senderName: userName,
        senderAvatar: userAvatar,
        type: 'like',
        postId,
        message: `${userName} liked your trading post.`,
      });
    }

    return true;
  }
}

export async function toggleSavePost(postId: string, userUid: string): Promise<boolean> {
  const postRef = doc(db, 'posts', postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return false;

  const data = snap.data();
  const savedBy: string[] = data.savedBy || [];
  const isSaved = savedBy.includes(userUid);

  if (isSaved) {
    await updateDoc(postRef, {
      savedBy: arrayRemove(userUid),
      savesCount: increment(-1),
    });
    return false;
  } else {
    await updateDoc(postRef, {
      savedBy: arrayUnion(userUid),
      savesCount: increment(1),
    });
    return true;
  }
}

// ─── COMMENTS ───────────────────────────────────────────────────────────────

export async function addPostComment(data: {
  postId: string;
  authorUid: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  content: string;
}): Promise<string> {
  const commentsRef = collection(db, 'posts', data.postId, 'comments');
  const commentDoc = await addDoc(commentsRef, {
    postId: data.postId,
    authorUid: data.authorUid,
    authorName: data.authorName,
    authorUsername: data.authorUsername || null,
    authorAvatar: data.authorAvatar || null,
    content: data.content.trim(),
    createdAt: serverTimestamp(),
    likesCount: 0,
    likedBy: [],
    isRemoved: false,
  });

  // Increment comments count on post doc
  const postRef = doc(db, 'posts', data.postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    const postData = postSnap.data();
    if (postData.authorUid && postData.authorUid !== data.authorUid) {
      await createNotification({
        recipientUid: postData.authorUid,
        senderUid: data.authorUid,
        senderName: data.authorName,
        senderAvatar: data.authorAvatar,
        type: 'comment',
        postId: data.postId,
        message: `${data.authorName} commented on your post: "${data.content.slice(0, 40)}..."`,
      });
    }
  }

  return commentDoc.id;
}

export function subscribePostComments(
  postId: string,
  callback: (comments: PostComment[]) => void,
): Unsubscribe {
  const commentsRef = collection(db, 'posts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snap) => {
    const comments: PostComment[] = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          postId,
          authorUid: data.authorUid || '',
          authorName: data.authorName || 'User',
          authorUsername: data.authorUsername || undefined,
          authorAvatar: data.authorAvatar || undefined,
          content: data.content || '',
          createdAt: data.createdAt,
          likesCount: data.likesCount || 0,
          likedBy: data.likedBy || [],
          isRemoved: data.isRemoved || false,
        };
      })
      .filter((c) => !c.isRemoved);

    callback(comments);
  });
}

// ─── FOLLOW SYSTEM ──────────────────────────────────────────────────────────

export async function followUser(
  followerUid: string,
  followingUid: string,
  followerName: string,
  followerAvatar?: string,
): Promise<void> {
  if (followerUid === followingUid) return;

  const followDocId = `${followerUid}_${followingUid}`;
  await setDoc(doc(db, 'follows', followDocId), {
    followerUid,
    followingUid,
    createdAt: serverTimestamp(),
  });

  // Create notification for target user
  await createNotification({
    recipientUid: followingUid,
    senderUid: followerUid,
    senderName: followerName,
    senderAvatar: followerAvatar,
    type: 'follow',
    message: `${followerName} started following your trading profile.`,
  });
}

export async function unfollowUser(followerUid: string, followingUid: string): Promise<void> {
  const followDocId = `${followerUid}_${followingUid}`;
  await deleteDoc(doc(db, 'follows', followDocId));
}

export function subscribeIsFollowing(
  followerUid: string,
  targetUid: string,
  callback: (isFollowing: boolean) => void,
): Unsubscribe {
  const followDocId = `${followerUid}_${targetUid}`;
  return onSnapshot(doc(db, 'follows', followDocId), (snap) => {
    callback(snap.exists());
  });
}

export function subscribeFollowCounts(
  uid: string,
  callback: (data: { followersCount: number; followingCount: number }) => void,
): Unsubscribe {
  const followsRef = collection(db, 'follows');

  const qFollowers = query(followsRef, where('followingUid', '==', uid));
  const qFollowing = query(followsRef, where('followerUid', '==', uid));

  let followersCount = 0;
  let followingCount = 0;

  const unsub1 = onSnapshot(qFollowers, (snap) => {
    followersCount = snap.size;
    callback({ followersCount, followingCount });
  });

  const unsub2 = onSnapshot(qFollowing, (snap) => {
    followingCount = snap.size;
    callback({ followersCount, followingCount });
  });

  return () => {
    unsub1();
    unsub2();
  };
}

export async function getFollowingUids(followerUid: string): Promise<string[]> {
  const q = query(collection(db, 'follows'), where('followerUid', '==', followerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().followingUid as string);
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

export async function createNotification(data: {
  recipientUid: string;
  senderUid: string;
  senderName: string;
  senderAvatar?: string;
  type: NotificationItem['type'];
  postId?: string;
  message: string;
}): Promise<void> {
  if (data.recipientUid === data.senderUid) return;

  await addDoc(collection(db, 'notifications'), {
    recipientUid: data.recipientUid,
    senderUid: data.senderUid,
    senderName: data.senderName,
    senderAvatar: data.senderAvatar || null,
    type: data.type,
    postId: data.postId || null,
    message: data.message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeUserNotifications(
  recipientUid: string,
  callback: (notifications: NotificationItem[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'notifications'),
    where('recipientUid', '==', recipientUid),
    orderBy('createdAt', 'desc'),
    limit(40),
  );

  return onSnapshot(q, (snap) => {
    const list: NotificationItem[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        recipientUid: data.recipientUid,
        senderUid: data.senderUid,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar || undefined,
        type: data.type,
        postId: data.postId || undefined,
        message: data.message,
        read: data.read || false,
        createdAt: data.createdAt,
      };
    });
    callback(list);
  });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  });
}

export async function markAllNotificationsRead(recipientUid: string): Promise<void> {
  const q = query(
    collection(db, 'notifications'),
    where('recipientUid', '==', recipientUid),
    where('read', '==', false),
  );
  const snap = await getDocs(q);
  const promises = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(promises);
}

// ─── LEADERBOARD ────────────────────────────────────────────────────────────

export async function fetchLeaderboards(
  type: LeaderboardType,
  timeframe: LeaderboardTimeframe,
): Promise<LeaderboardEntry[]> {
  // Fetch users & portfolios to derive leaderboard standings
  const usersSnap = await getDocs(collection(db, 'users'));
  const portfolioSnap = await getDocs(collection(db, 'portfolio'));

  const portfolioMap = new Map<string, any>();
  portfolioSnap.docs.forEach((d) => portfolioMap.set(d.id, d.data()));

  const entries: LeaderboardEntry[] = [];

  usersSnap.docs.forEach((uDoc) => {
    const uData = uDoc.data();
    const pData = portfolioMap.get(uDoc.id) || {};

    const portfolioVal = pData.portfolioValue || 100000;
    const totalPL = pData.totalProfitLoss || 0;
    const returnPct = (totalPL / 100000) * 100;
    const totalTrades = pData.todayTradeCount || 0;
    const xp = uData.xp || 0;
    const referrals = uData.referralCount || 0;

    let score = 0;
    let displayMetric = '';

    if (type === 'return') {
      score = returnPct;
      displayMetric = `${score >= 0 ? '+' : ''}${score.toFixed(2)}%`;
    } else if (type === 'activity') {
      score = totalTrades + Math.floor(xp / 100);
      displayMetric = `${score} Actions`;
    } else if (type === 'level') {
      score = xp;
      displayMetric = `${uData.level || 'Beginner'} (${xp} XP)`;
    } else if (type === 'referrals') {
      score = referrals;
      displayMetric = `${score} Referrals`;
    }

    entries.push({
      uid: uDoc.id,
      fullName: uData.fullName || 'Trader',
      username: uData.username || undefined,
      avatarUrl: uData.avatarUrl || undefined,
      title: uData.title || undefined,
      level: uData.level || 'Beginner',
      rank: 0,
      score,
      displayMetric,
      isPortfolioPublic: uData.isPortfolioPublic ?? true,
      portfolioValue: portfolioVal,
      returnPercent: returnPct,
      totalTrades,
      referralsCount: referrals,
    });
  });

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score);

  // Assign ranks
  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

// ─── ADMIN & USER MODERATION ─────────────────────────────────────────────────

export async function deleteCommunityPost(postId: string, userUid?: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  try {
    await deleteDoc(postRef);
  } catch (err) {
    console.warn('deleteDoc failed, falling back to soft delete isRemoved', err);
    await updateDoc(postRef, { isRemoved: true }).catch(() => {});
  }
}

export async function deleteCommunityComment(postId: string, commentId: string, userUid?: string): Promise<void> {
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  try {
    await deleteDoc(commentRef);
  } catch (err) {
    await updateDoc(commentRef, { isRemoved: true }).catch(() => {});
  }

  // Decrement commentsCount on parent post
  const postRef = doc(db, 'posts', postId);
  try {
    await updateDoc(postRef, {
      commentsCount: increment(-1),
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

export async function adminDeletePost(postId: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  try {
    await deleteDoc(postRef);
  } catch (err) {
    await updateDoc(postRef, { isRemoved: true }).catch(() => {});
  }
}

export async function adminDeleteComment(postId: string, commentId: string): Promise<void> {
  await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
    isRemoved: true,
  });
}

export async function adminTogglePostingSuspension(
  targetUid: string,
  isSuspended: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'users', targetUid), {
    isPostingSuspended: isSuspended,
  });
}

export async function adminToggleUserBan(targetUid: string, isBanned: boolean): Promise<void> {
  await updateDoc(doc(db, 'users', targetUid), {
    isBanned: isBanned,
  });
}
