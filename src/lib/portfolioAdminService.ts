import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';

export interface AdminHoldingRow {
  symbol: string;
  companyName: string;
  quantity: number;
  avgBuyPrice: number;
  totalInvested: number;
  type?: 'EQUITY' | 'FUTURES' | 'OPTIONS' | 'COMMODITY';
}

export async function adminGetUserHoldings(targetUid: string): Promise<AdminHoldingRow[]> {
  try {
    const snap = await getDocs(collection(db, 'holdings', targetUid, 'stocks'));
    const holdings: AdminHoldingRow[] = [];
    snap.forEach((d) => {
      const data = d.data();
      holdings.push({
        symbol: d.id,
        companyName: data.companyName || d.id,
        quantity: data.quantity || 0,
        avgBuyPrice: data.avgBuyPrice || 0,
        totalInvested: data.totalInvested || 0,
        type: data.type || 'EQUITY',
      });
    });
    return holdings;
  } catch (err) {
    console.warn('Failed to fetch user holdings from Firestore:', err);
    return [];
  }
}

export async function adminAddOrEditHolding(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  symbol: string,
  companyName: string,
  quantity: number,
  avgBuyPrice: number,
  type: 'EQUITY' | 'FUTURES' | 'OPTIONS' | 'COMMODITY' = 'EQUITY',
  reason = 'Admin holding adjustment',
): Promise<void> {
  if (quantity <= 0 || avgBuyPrice < 0) {
    throw new Error('Quantity must be greater than 0 and average price cannot be negative.');
  }

  const holdingRef = doc(db, 'holdings', targetUid, 'stocks', symbol.toUpperCase());
  const snap = await getDoc(holdingRef);
  const prevState = snap.exists() ? JSON.stringify(snap.data()) : 'NONE';

  const totalInvested = quantity * avgBuyPrice;

  await setDoc(holdingRef, {
    symbol: symbol.toUpperCase(),
    companyName,
    quantity,
    avgBuyPrice,
    totalInvested,
    type,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'PORTFOLIO',
    actionName: snap.exists() ? 'EDIT_HOLDING' : 'ADD_HOLDING',
    targetUid,
    targetEmail,
    reason,
    previousState: prevState,
    newState: JSON.stringify({ symbol, quantity, avgBuyPrice, totalInvested }),
    details: `Holding ${symbol} updated (Qty: ${quantity}, Avg: ₹${avgBuyPrice}) for ${targetEmail}`,
  });
}

export async function adminRemoveHolding(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  symbol: string,
  reason = 'Admin holding removal',
): Promise<void> {
  const holdingRef = doc(db, 'holdings', targetUid, 'stocks', symbol.toUpperCase());
  const snap = await getDoc(holdingRef);
  const prevState = snap.exists() ? JSON.stringify(snap.data()) : 'NONE';

  await deleteDoc(holdingRef);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'PORTFOLIO',
    actionName: 'REMOVE_HOLDING',
    targetUid,
    targetEmail,
    reason,
    previousState: prevState,
    newState: 'REMOVED',
    details: `Removed holding ${symbol} from user ${targetEmail}`,
  });
}

export async function adminForceBuy(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  symbol: string,
  companyName: string,
  quantity: number,
  price: number,
  reason = 'Admin force buy execution',
): Promise<void> {
  await adminAddOrEditHolding(
    adminEmail,
    adminUid,
    targetUid,
    targetEmail,
    symbol,
    companyName,
    quantity,
    price,
    'EQUITY',
    reason,
  );

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'PORTFOLIO',
    actionName: 'FORCE_BUY',
    targetUid,
    targetEmail,
    amount: quantity * price,
    reason,
    details: `Force bought ${quantity} shares of ${symbol} at ₹${price} for ${targetEmail}`,
  });
}

export async function adminForceSell(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  symbol: string,
  reason = 'Admin force sell execution',
): Promise<void> {
  await adminRemoveHolding(adminEmail, adminUid, targetUid, targetEmail, symbol, reason);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'PORTFOLIO',
    actionName: 'FORCE_SELL',
    targetUid,
    targetEmail,
    reason,
    details: `Force sold all holdings of ${symbol} for ${targetEmail}`,
  });
}
