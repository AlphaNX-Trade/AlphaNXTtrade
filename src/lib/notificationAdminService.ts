import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';

export type NotificationType =
  | 'PUSH'
  | 'IN_APP'
  | 'MARKET_ALERT'
  | 'BREAKING_NEWS'
  | 'PROMOTIONAL'
  | 'MAINTENANCE';

export interface AdminNotificationRecord {
  id?: string;
  adminEmail: string;
  targetType: 'ALL' | 'SINGLE';
  targetUid?: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
}

const LOCAL_NOTIF_KEY = 'alphanxt_admin_notifications';

function saveLocalNotif(record: AdminNotificationRecord) {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
    const existing: AdminNotificationRecord[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify([record, ...existing]));
  } catch (err) {
    console.error('Failed to save local notification record:', err);
  }
}

export function getLocalNotifications(): AdminNotificationRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export async function adminSendNotification(
  adminEmail: string,
  adminUid: string,
  targetType: 'ALL' | 'SINGLE',
  targetUid: string | undefined,
  targetEmail: string | undefined,
  type: NotificationType,
  title: string,
  message: string,
): Promise<void> {
  if (!title.trim() || !message.trim()) {
    throw new Error('Notification title and message content cannot be empty.');
  }

  const record: AdminNotificationRecord = {
    adminEmail,
    targetType,
    targetUid: targetType === 'SINGLE' ? targetUid : undefined,
    type,
    title: title.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  saveLocalNotif(record);

  // Firestore dispatch
  try {
    await addDoc(collection(db, 'notifications'), {
      ...record,
      serverTime: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to write notification to Firestore:', err);
  }

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'NOTIFICATION',
    actionName: `SEND_${type}`,
    targetUid: targetType === 'SINGLE' ? targetUid : 'BROADCAST',
    targetEmail: targetType === 'SINGLE' ? targetEmail : 'ALL_USERS',
    reason: `Broadcast/Direct notification: ${title}`,
    details: `Sent [${type}] "${title}" to ${targetType === 'ALL' ? 'all users' : targetEmail}`,
  });
}

export async function fetchSentNotifications(): Promise<AdminNotificationRecord[]> {
  const localList = getLocalNotifications();
  try {
    const q = query(collection(db, 'notifications'), orderBy('serverTime', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: AdminNotificationRecord[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AdminNotificationRecord));
      return list;
    }
  } catch (err) {
    console.warn('Could not fetch notifications from Firestore:', err);
  }
  return localList;
}
