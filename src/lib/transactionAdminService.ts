import { collection, doc, getDocs, updateDoc, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';
import { adminAdjustWallet } from '@/lib/walletAdminService';

export type TxType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_CREDIT' | 'TRADE_DEBIT';
export type TxStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVERSED';

export interface TransactionRecord {
  id: string;
  uid: string;
  userEmail: string;
  userName?: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  paymentMethod?: string;
  referenceId?: string;
  timestamp: string;
  reason?: string;
}

const LOCAL_TX_KEY = 'alphanxt_admin_transactions';

export function getLocalTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_TX_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [
    {
      id: 'tx_dep_101',
      uid: 'user_demo_1',
      userEmail: 'trader1@alphanxt.com',
      userName: 'Rahul Sharma',
      type: 'DEPOSIT',
      amount: 50000,
      status: 'PENDING',
      paymentMethod: 'UPI (GPay)',
      referenceId: 'UPI/4219082341/REF',
      timestamp: new Date().toISOString(),
      reason: 'UPI Add Funds Request',
    },
    {
      id: 'tx_wd_102',
      uid: 'user_demo_2',
      userEmail: 'trader2@alphanxt.com',
      userName: 'Priya Patel',
      type: 'WITHDRAWAL',
      amount: 15000,
      status: 'PENDING',
      paymentMethod: 'IMPS Bank Transfer',
      referenceId: 'IMPS/998124891/HDFC',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      reason: 'User withdrawal to bank account',
    },
    {
      id: 'tx_dep_100',
      uid: 'user_demo_3',
      userEmail: 'trader3@alphanxt.com',
      userName: 'Amit Verma',
      type: 'DEPOSIT',
      amount: 100000,
      status: 'APPROVED',
      paymentMethod: 'Net Banking (ICICI)',
      referenceId: 'NETB/88127391/ICIC',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      reason: 'Approved initial capital deposit',
    },
  ];
}

function saveLocalTransactions(txs: TransactionRecord[]) {
  try {
    localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save local transactions:', err);
  }
}

export async function fetchAllTransactions(): Promise<TransactionRecord[]> {
  const localList = getLocalTransactions();
  try {
    const q = query(collection(db, 'admin_transactions'), orderBy('serverTime', 'desc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: TransactionRecord[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as TransactionRecord));
      return list;
    }
  } catch (err) {
    console.warn('Could not fetch transactions from Firestore:', err);
  }
  return localList;
}

export async function adminApproveDeposit(
  adminEmail: string,
  adminUid: string,
  txId: string,
  reason = 'Admin deposit approval',
): Promise<void> {
  const txs = getLocalTransactions();
  const idx = txs.findIndex((t) => t.id === txId);
  if (idx === -1) throw new Error('Transaction record not found.');

  const tx = txs[idx];
  if (tx.status !== 'PENDING') throw new Error(`Transaction is already ${tx.status}.`);

  // Credit user wallet
  await adminAdjustWallet(
    adminEmail,
    adminUid,
    tx.uid,
    tx.userEmail,
    tx.amount,
    'CREDIT',
    `Approved deposit: ${reason}`,
  );

  txs[idx].status = 'APPROVED';
  saveLocalTransactions(txs);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'TRANSACTION',
    actionName: 'APPROVE_DEPOSIT',
    targetUid: tx.uid,
    targetEmail: tx.userEmail,
    amount: tx.amount,
    reason,
    previousState: 'PENDING',
    newState: 'APPROVED',
    details: `Deposit of ₹${tx.amount.toLocaleString('en-IN')} approved for ${tx.userEmail}`,
  });
}

export async function adminRejectDeposit(
  adminEmail: string,
  adminUid: string,
  txId: string,
  reason: string,
): Promise<void> {
  const txs = getLocalTransactions();
  const idx = txs.findIndex((t) => t.id === txId);
  if (idx === -1) throw new Error('Transaction record not found.');

  const tx = txs[idx];
  txs[idx].status = 'REJECTED';
  txs[idx].reason = reason;
  saveLocalTransactions(txs);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'TRANSACTION',
    actionName: 'REJECT_DEPOSIT',
    targetUid: tx.uid,
    targetEmail: tx.userEmail,
    amount: tx.amount,
    reason,
    previousState: 'PENDING',
    newState: 'REJECTED',
    details: `Deposit of ₹${tx.amount.toLocaleString('en-IN')} rejected for ${tx.userEmail}`,
  });
}

export async function adminApproveWithdrawal(
  adminEmail: string,
  adminUid: string,
  txId: string,
  reason = 'Admin withdrawal approval',
): Promise<void> {
  const txs = getLocalTransactions();
  const idx = txs.findIndex((t) => t.id === txId);
  if (idx === -1) throw new Error('Transaction record not found.');

  const tx = txs[idx];
  if (tx.status !== 'PENDING') throw new Error(`Transaction is already ${tx.status}.`);

  // Deduct user wallet
  await adminAdjustWallet(
    adminEmail,
    adminUid,
    tx.uid,
    tx.userEmail,
    -tx.amount,
    'DEBIT',
    `Approved withdrawal: ${reason}`,
  );

  txs[idx].status = 'APPROVED';
  saveLocalTransactions(txs);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'TRANSACTION',
    actionName: 'APPROVE_WITHDRAWAL',
    targetUid: tx.uid,
    targetEmail: tx.userEmail,
    amount: tx.amount,
    reason,
    previousState: 'PENDING',
    newState: 'APPROVED',
    details: `Withdrawal of ₹${tx.amount.toLocaleString('en-IN')} approved for ${tx.userEmail}`,
  });
}

export async function adminRejectWithdrawal(
  adminEmail: string,
  adminUid: string,
  txId: string,
  reason: string,
): Promise<void> {
  const txs = getLocalTransactions();
  const idx = txs.findIndex((t) => t.id === txId);
  if (idx === -1) throw new Error('Transaction record not found.');

  const tx = txs[idx];
  txs[idx].status = 'REJECTED';
  txs[idx].reason = reason;
  saveLocalTransactions(txs);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'TRANSACTION',
    actionName: 'REJECT_WITHDRAWAL',
    targetUid: tx.uid,
    targetEmail: tx.userEmail,
    amount: tx.amount,
    reason,
    previousState: 'PENDING',
    newState: 'REJECTED',
    details: `Withdrawal of ₹${tx.amount.toLocaleString('en-IN')} rejected for ${tx.userEmail}`,
  });
}

export async function adminReverseTransaction(
  adminEmail: string,
  adminUid: string,
  txId: string,
  reason: string,
): Promise<void> {
  const txs = getLocalTransactions();
  const idx = txs.findIndex((t) => t.id === txId);
  if (idx === -1) throw new Error('Transaction record not found.');

  const tx = txs[idx];
  if (tx.status !== 'APPROVED') throw new Error('Only approved transactions can be reversed.');

  // Reverse funds
  if (tx.type === 'DEPOSIT') {
    await adminAdjustWallet(
      adminEmail,
      adminUid,
      tx.uid,
      tx.userEmail,
      -tx.amount,
      'PENALTY',
      `Reversal of deposit #${txId}: ${reason}`,
    );
  } else if (tx.type === 'WITHDRAWAL') {
    await adminAdjustWallet(
      adminEmail,
      adminUid,
      tx.uid,
      tx.userEmail,
      tx.amount,
      'CREDIT',
      `Reversal of withdrawal #${txId}: ${reason}`,
    );
  }

  txs[idx].status = 'REVERSED';
  txs[idx].reason = reason;
  saveLocalTransactions(txs);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'TRANSACTION',
    actionName: 'REVERSE_TRANSACTION',
    targetUid: tx.uid,
    targetEmail: tx.userEmail,
    amount: tx.amount,
    reason,
    previousState: 'APPROVED',
    newState: 'REVERSED',
    details: `Transaction #${txId} reversed for ${tx.userEmail}`,
  });
}
