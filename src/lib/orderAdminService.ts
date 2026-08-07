import { collection, doc, getDocs, updateDoc, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';

export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED' | 'PAUSED';

export interface AdminOrderRecord {
  id: string;
  uid: string;
  userEmail?: string;
  symbol: string;
  companyName: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  quantity: number;
  price: number;
  status: OrderStatus;
  timestamp: string;
  segment?: 'EQUITY' | 'FUTURES' | 'OPTIONS' | 'COMMODITY';
}

const LOCAL_ORDERS_KEY = 'alphanxt_admin_orders';

export function getLocalOrders(): AdminOrderRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Initial mock pending and recent orders
  return [
    {
      id: 'ord_1001',
      uid: 'user_demo_1',
      userEmail: 'trader1@alphanxt.com',
      symbol: 'RELIANCE',
      companyName: 'Reliance Industries Ltd.',
      side: 'BUY',
      orderType: 'LIMIT',
      quantity: 50,
      price: 2950.0,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      segment: 'EQUITY',
    },
    {
      id: 'ord_1002',
      uid: 'user_demo_2',
      userEmail: 'trader2@alphanxt.com',
      symbol: 'BANKNIFTY 51500 CE',
      companyName: 'BANKNIFTY Weekly Call',
      side: 'BUY',
      orderType: 'MARKET',
      quantity: 30,
      price: 340.5,
      status: 'PENDING',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      segment: 'OPTIONS',
    },
    {
      id: 'ord_1003',
      uid: 'user_demo_3',
      userEmail: 'trader3@alphanxt.com',
      symbol: 'GOLD 1KG MCX',
      companyName: 'Gold Futures MCX',
      side: 'SELL',
      orderType: 'LIMIT',
      quantity: 1,
      price: 72450.0,
      status: 'PENDING',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      segment: 'COMMODITY',
    },
  ];
}

function saveLocalOrders(orders: AdminOrderRecord[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save local orders:', err);
  }
}

export async function fetchAllOrders(): Promise<AdminOrderRecord[]> {
  const localList = getLocalOrders();
  try {
    const q = query(collection(db, 'orders'), orderBy('serverTime', 'desc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: AdminOrderRecord[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AdminOrderRecord));
      return list;
    }
  } catch (err) {
    console.warn('Could not fetch orders from Firestore:', err);
  }
  return localList;
}

export async function adminUpdateOrderStatus(
  adminEmail: string,
  adminUid: string,
  orderId: string,
  newStatus: OrderStatus,
  reason: string,
): Promise<void> {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  const prevOrder = idx !== -1 ? orders[idx] : null;

  if (idx !== -1) {
    orders[idx].status = newStatus;
    saveLocalOrders(orders);
  }

  try {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail,
      updateReason: reason,
    });
  } catch (err) {
    console.warn('Failed to update order status in Firestore:', err);
  }

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'ORDER',
    actionName: `ORDER_${newStatus}`,
    targetUid: prevOrder?.uid,
    targetEmail: prevOrder?.userEmail,
    reason,
    previousState: prevOrder?.status || 'UNKNOWN',
    newState: newStatus,
    details: `Order #${orderId} (${prevOrder?.symbol || 'Asset'}) set to ${newStatus}`,
  });
}
