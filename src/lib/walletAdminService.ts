import { doc, getDoc, updateDoc, increment, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';

export interface WalletTransactionRecord {
  id?: string;
  uid: string;
  type: 'CREDIT' | 'DEBIT' | 'BONUS' | 'PENALTY' | 'MANUAL_EDIT' | 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  previousBalance: number;
  newBalance: number;
  reason: string;
  adminEmail: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED' | 'REVERSED';
}

const LOCAL_WALLET_TX_KEY = 'alphanxt_wallet_transactions';

function saveLocalWalletTx(record: WalletTransactionRecord) {
  try {
    const raw = localStorage.getItem(LOCAL_WALLET_TX_KEY);
    const existing: WalletTransactionRecord[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_WALLET_TX_KEY, JSON.stringify([record, ...existing]));
  } catch (err) {
    console.error('Failed to save local wallet tx:', err);
  }
}

export function getLocalWalletTransactions(uid?: string): WalletTransactionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_WALLET_TX_KEY);
    const records: WalletTransactionRecord[] = raw ? JSON.parse(raw) : [];
    if (uid) {
      return records.filter((r) => r.uid === uid);
    }
    return records;
  } catch {
    return [];
  }
}

/**
 * Adjusts user wallet balance (Add, Deduct, Bonus, Penalty, Manual Edit)
 * with full audit logging and local/remote transaction logging.
 */
export async function adminAdjustWallet(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  amount: number, // positive to credit, negative to debit
  type: WalletTransactionRecord['type'],
  reason: string,
): Promise<{ previousBalance: number; newBalance: number }> {
  if (!reason.trim()) {
    throw new Error('A reason or note is required for every wallet balance adjustment.');
  }

  const portfolioRef = doc(db, 'portfolio', targetUid);
  const snap = await getDoc(portfolioRef);

  if (!snap.exists()) {
    throw new Error('User portfolio record not found.');
  }

  const data = snap.data();
  if (data.isFrozen) {
    throw new Error('Cannot adjust wallet: User wallet is currently FROZEN.');
  }

  const previousBalance = (data.virtualBalance as number) ?? 0;
  let newBalance = previousBalance + amount;
  if (newBalance < 0) {
    newBalance = 0; // prevent negative
  }
  const actualDelta = newBalance - previousBalance;

  // Update Portfolio
  await updateDoc(portfolioRef, {
    virtualBalance: newBalance,
    portfolioValue: (data.portfolioValue ?? previousBalance) + actualDelta,
    updatedAt: serverTimestamp(),
  });

  const txRecord: WalletTransactionRecord = {
    uid: targetUid,
    type,
    amount: Math.abs(actualDelta),
    previousBalance,
    newBalance,
    reason: reason.trim(),
    adminEmail,
    timestamp: new Date().toISOString(),
    status: 'COMPLETED',
  };

  saveLocalWalletTx(txRecord);

  // Write transaction to Firestore
  try {
    await addDoc(collection(db, 'wallet_transactions'), {
      ...txRecord,
      serverTime: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to write wallet transaction to Firestore:', err);
  }

  // Create Audit Log
  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'WALLET',
    actionName: `WALLET_${type}`,
    targetUid,
    targetEmail,
    amount: Math.abs(actualDelta),
    reason: reason.trim(),
    previousState: `₹${previousBalance.toLocaleString('en-IN')}`,
    newState: `₹${newBalance.toLocaleString('en-IN')}`,
    details: `${type} of ₹${Math.abs(actualDelta).toLocaleString('en-IN')} applied to ${targetEmail}`,
  });

  return { previousBalance, newBalance };
}

export async function adminFreezeWallet(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  freeze: boolean,
  reason: string,
): Promise<void> {
  const portfolioRef = doc(db, 'portfolio', targetUid);
  await updateDoc(portfolioRef, {
    isFrozen: freeze,
    freezeReason: freeze ? reason : null,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'WALLET',
    actionName: freeze ? 'FREEZE_WALLET' : 'UNFREEZE_WALLET',
    targetUid,
    targetEmail,
    reason,
    previousState: freeze ? 'UNFROZEN' : 'FROZEN',
    newState: freeze ? 'FROZEN' : 'UNFROZEN',
    details: `Wallet ${freeze ? 'frozen' : 'unfrozen'} for ${targetEmail}`,
  });
}

export async function adminLockWalletTransactions(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  lock: boolean,
  reason: string,
): Promise<void> {
  const portfolioRef = doc(db, 'portfolio', targetUid);
  await updateDoc(portfolioRef, {
    isLocked: lock,
    lockReason: lock ? reason : null,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'WALLET',
    actionName: lock ? 'LOCK_WALLET_TRANSACTIONS' : 'UNLOCK_WALLET_TRANSACTIONS',
    targetUid,
    targetEmail,
    reason,
    previousState: lock ? 'UNLOCKED' : 'LOCKED',
    newState: lock ? 'LOCKED' : 'UNLOCKED',
    details: `Wallet transactions ${lock ? 'locked' : 'unlocked'} for ${targetEmail}`,
  });
}

export async function fetchUserWalletHistory(uid: string): Promise<WalletTransactionRecord[]> {
  const localList = getLocalWalletTransactions(uid);
  try {
    const q = query(
      collection(db, 'wallet_transactions'),
      where('uid', '==', uid),
      orderBy('serverTime', 'desc'),
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: WalletTransactionRecord[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as WalletTransactionRecord));
      return list;
    }
  } catch (err) {
    console.warn('Could not fetch wallet history from Firestore:', err);
  }
  return localList;
}
