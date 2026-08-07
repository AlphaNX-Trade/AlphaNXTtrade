import { doc, runTransaction, collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getLocalWalletTransactions, WalletTransactionRecord } from '@/lib/walletAdminService';

export interface VirtualFundPackage {
  id: string;
  name: string;
  priceINR: number;
  virtualAmountINR: number;
  badge?: string;
  description: string;
  popular?: boolean;
}

export const VIRTUAL_FUND_PACKAGES: VirtualFundPackage[] = [
  {
    id: 'starter',
    name: 'Starter Booster',
    priceINR: 100,
    virtualAmountINR: 100000, // ₹1,00,000
    description: 'Perfect for beginners starting paper trading.',
  },
  {
    id: 'value',
    name: 'Trader Value Pack',
    priceINR: 250,
    virtualAmountINR: 300000, // ₹3,00,000
    badge: '3X VALUE',
    description: 'Generous capital for swing trades and diversification.',
  },
  {
    id: 'pro',
    name: 'Pro Trader Pack',
    priceINR: 500,
    virtualAmountINR: 750000, // ₹7,50,000
    badge: 'MOST POPULAR',
    popular: true,
    description: 'Professional margin size for advanced strategies.',
  },
  {
    id: 'whale',
    name: 'Whale High Roller',
    priceINR: 1000,
    virtualAmountINR: 2000000, // ₹20,00,000
    badge: 'MAX CAPITAL',
    description: 'Ultimate virtual capital to trade large blocks and options.',
  },
];

export interface WalletCreditTransaction {
  id?: string;
  uid: string;
  packageId: string;
  packageName: string;
  amountPaidINR: number;
  virtualAmountCreditedINR: number;
  paymentMethod: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
  transactionRef: string;
}

const LOCAL_VIRTUAL_CREDIT_KEY = 'alphanxt_virtual_credit_txs';

export function saveLocalCreditTransaction(record: WalletCreditTransaction) {
  try {
    const raw = localStorage.getItem(LOCAL_VIRTUAL_CREDIT_KEY);
    const existing: WalletCreditTransaction[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_VIRTUAL_CREDIT_KEY, JSON.stringify([record, ...existing]));
  } catch (err) {
    console.error('Failed to save local credit transaction:', err);
  }
}

export function getLocalCreditTransactions(uid?: string): WalletCreditTransaction[] {
  try {
    const raw = localStorage.getItem(LOCAL_VIRTUAL_CREDIT_KEY);
    const records: WalletCreditTransaction[] = raw ? JSON.parse(raw) : [];
    if (uid) {
      return records.filter((r) => r.uid === uid);
    }
    return records;
  } catch {
    return [];
  }
}

/**
 * Simulates purchasing a virtual fund package and crediting the user's
 * Firestore portfolio virtual balance automatically with full transaction audit logs.
 */
export async function purchaseVirtualFundPackage(
  uid: string,
  userEmail: string,
  pkg: VirtualFundPackage,
  paymentMethod: string = 'UPI / Instant Simulator',
): Promise<{ success: boolean; newVirtualBalance: number; transactionRef: string }> {
  const transactionRef = 'ANXT-VT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const portfolioRef = doc(db, 'portfolio', uid);
  const userRef = doc(db, 'users', uid);

  let newVirtualBalance = 0;

  try {
    await runTransaction(db, async (tx) => {
      const portSnap = await tx.get(portfolioRef);

      if (!portSnap.exists()) {
        throw new Error('Portfolio document not found. Please log in again.');
      }

      const portData = portSnap.data();
      const currentVirtual = (portData.virtualBalance as number) ?? 100000;
      const currentPortVal = (portData.portfolioValue as number) ?? currentVirtual;

      newVirtualBalance = currentVirtual + pkg.virtualAmountINR;
      const newPortfolioValue = currentPortVal + pkg.virtualAmountINR;

      tx.update(portfolioRef, {
        virtualBalance: newVirtualBalance,
        portfolioValue: newPortfolioValue,
        updatedAt: serverTimestamp(),
      });

      // Synchronize in user doc if present
      tx.update(userRef, {
        virtualBalance: newVirtualBalance,
      });
    });

    const txRecord: WalletCreditTransaction = {
      uid,
      packageId: pkg.id,
      packageName: pkg.name,
      amountPaidINR: pkg.priceINR,
      virtualAmountCreditedINR: pkg.virtualAmountINR,
      paymentMethod,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      transactionRef,
    };

    saveLocalCreditTransaction(txRecord);

    // Write to Firestore wallet transactions for record-keeping
    try {
      await addDoc(collection(db, 'wallet_transactions'), {
        uid,
        type: 'DEPOSIT',
        packageName: pkg.name,
        amount: pkg.virtualAmountINR,
        amountPaid: pkg.priceINR,
        reason: `Virtual Fund Purchase: ${pkg.name} (₹${pkg.priceINR} -> ₹${pkg.virtualAmountINR.toLocaleString('en-IN')} Virtual Trading Balance)`,
        adminEmail: 'SYSTEM_PAYMENT_SIMULATOR',
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        transactionRef,
        serverTime: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Could not write to wallet_transactions in Firestore:', e);
    }

    return {
      success: true,
      newVirtualBalance,
      transactionRef,
    };
  } catch (err: any) {
    console.error('Purchase Virtual Fund Package Error:', err);
    throw new Error(err.message || 'Failed to credit virtual funds.');
  }
}

/**
 * Fetches user credit transaction history combining Firestore and LocalStorage.
 */
export async function fetchUserCreditTransactions(uid: string): Promise<WalletCreditTransaction[]> {
  const localList = getLocalCreditTransactions(uid);
  try {
    const q = query(
      collection(db, 'wallet_transactions'),
      where('uid', '==', uid),
      orderBy('serverTime', 'desc'),
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const remoteList: WalletCreditTransaction[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.packageName || data.amountPaid !== undefined) {
          remoteList.push({
            id: d.id,
            uid: data.uid,
            packageId: data.packageId || 'custom',
            packageName: data.packageName || 'Virtual Fund Top-up',
            amountPaidINR: data.amountPaid || 0,
            virtualAmountCreditedINR: data.amount || 0,
            paymentMethod: data.paymentMethod || 'Simulator',
            status: data.status || 'COMPLETED',
            timestamp: data.timestamp || new Date().toISOString(),
            transactionRef: data.transactionRef || d.id,
          });
        }
      });
      if (remoteList.length > 0) {
        return remoteList;
      }
    }
  } catch (err) {
    console.warn('Could not fetch credit transactions from Firestore:', err);
  }

  // Also include general wallet transactions converted if any
  const adminTxLocal = getLocalWalletTransactions(uid);
  const convertedAdminTx: WalletCreditTransaction[] = adminTxLocal
    .filter((t) => t.type === 'DEPOSIT' || t.type === 'CREDIT')
    .map((t, idx) => ({
      id: t.id || `local-${idx}`,
      uid: t.uid,
      packageId: 'credit',
      packageName: t.reason || 'Virtual Balance Deposit',
      amountPaidINR: 0,
      virtualAmountCreditedINR: t.amount,
      paymentMethod: 'Wallet Credit',
      status: 'COMPLETED',
      timestamp: t.timestamp,
      transactionRef: `ANXT-CR-${idx}`,
    }));

  const combined = [...localList, ...convertedAdminTx];
  // Sort by timestamp desc
  combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return combined;
}
