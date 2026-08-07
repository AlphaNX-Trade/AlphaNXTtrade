import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ActionCategory =
  | 'WALLET'
  | 'USER'
  | 'PORTFOLIO'
  | 'ORDER'
  | 'TRANSACTION'
  | 'MARKET'
  | 'NOTIFICATION'
  | 'SECURITY'
  | 'SETTINGS';

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  adminEmail: string;
  adminUid: string;
  actionCategory: ActionCategory;
  actionName: string;
  targetUid?: string;
  targetEmail?: string;
  amount?: number;
  reason?: string;
  previousState?: string;
  newState?: string;
  details?: string;
}

const LOCAL_AUDIT_LOG_KEY = 'alphanxt_admin_audit_logs';

function getLocalAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAuditLog(entry: AuditLogEntry) {
  try {
    const existing = getLocalAuditLogs();
    const updated = [entry, ...existing].slice(0, 500); // keep last 500
    localStorage.setItem(LOCAL_AUDIT_LOG_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save local audit log:', err);
  }
}

export async function createAuditLog(log: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  const timestamp = new Date().toISOString();
  const fullLog: AuditLogEntry = {
    ...log,
    timestamp,
  };

  // Always save locally so history is instantly available
  saveLocalAuditLog(fullLog);

  // Best-effort Firestore persist
  try {
    await addDoc(collection(db, 'audit_logs'), {
      ...fullLog,
      serverTime: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore audit_log write failed (fallback to local):', err);
  }
}

export async function getAuditLogs(limitCount = 100): Promise<AuditLogEntry[]> {
  const localLogs = getLocalAuditLogs();
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('serverTime', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const fsLogs: AuditLogEntry[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        fsLogs.push({
          id: doc.id,
          timestamp: d.timestamp || new Date().toISOString(),
          adminEmail: d.adminEmail || 'Admin',
          adminUid: d.adminUid || 'admin',
          actionCategory: d.actionCategory || 'SECURITY',
          actionName: d.actionName || 'System Action',
          targetUid: d.targetUid,
          targetEmail: d.targetEmail,
          amount: d.amount,
          reason: d.reason,
          previousState: d.previousState,
          newState: d.newState,
          details: d.details,
        });
      });
      return fsLogs;
    }
  } catch (err) {
    console.warn('Could not fetch Firestore audit logs, returning local logs:', err);
  }
  return localLogs;
}
