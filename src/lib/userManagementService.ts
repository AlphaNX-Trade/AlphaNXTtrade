import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserLoginHistoryRecord {
  id?: string;
  uid: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  browser: string;
  location?: string;
}

const LOCAL_LOGIN_HISTORY_KEY = 'alphanxt_user_login_history';

export function getLocalLoginHistory(uid: string): UserLoginHistoryRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_LOGIN_HISTORY_KEY);
    const records: UserLoginHistoryRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = records.filter((r) => r.uid === uid);
    if (filtered.length > 0) return filtered;
  } catch {}

  // Fallback mock logs for demo
  return [
    {
      uid,
      timestamp: new Date().toISOString(),
      ipAddress: '103.211.54.12',
      device: 'Chrome on macOS (Macintosh)',
      browser: 'Chrome 127.0',
      location: 'Mumbai, MH, India',
    },
    {
      uid,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      ipAddress: '49.36.192.44',
      device: 'AlphaNXT Mobile (Android 14)',
      browser: 'Mobile WebKit',
      location: 'Bengaluru, KA, India',
    },
    {
      uid,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      ipAddress: '103.211.54.12',
      device: 'Chrome on macOS (Macintosh)',
      browser: 'Chrome 126.0',
      location: 'Mumbai, MH, India',
    },
  ];
}

export async function adminUpdateUserProfile(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  updates: {
    fullName?: string;
    phone?: string;
    title?: string;
    xp?: number;
    level?: string;
  },
  reason = 'Admin profile edit',
): Promise<void> {
  const ref = doc(db, 'users', targetUid);
  const snap = await getDoc(ref);
  const prevData = snap.exists() ? snap.data() : {};

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'USER',
    actionName: 'UPDATE_USER_PROFILE',
    targetUid,
    targetEmail,
    reason,
    previousState: JSON.stringify(prevData),
    newState: JSON.stringify(updates),
    details: `Updated user profile for ${targetEmail}`,
  });
}

export async function adminSetAccountStatus(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  status: AccountStatus,
  reason: string,
): Promise<void> {
  const ref = doc(db, 'users', targetUid);
  await updateDoc(ref, {
    accountStatus: status,
    accountStatusReason: reason,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'USER',
    actionName: `SET_STATUS_${status}`,
    targetUid,
    targetEmail,
    reason,
    newState: status,
    details: `Account status changed to ${status} for ${targetEmail}`,
  });
}

export async function adminForceLogoutUser(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  reason: string,
): Promise<void> {
  const ref = doc(db, 'users', targetUid);
  await updateDoc(ref, {
    forcedLogoutAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'USER',
    actionName: 'FORCE_LOGOUT_USER',
    targetUid,
    targetEmail,
    reason,
    details: `Forced user session termination for ${targetEmail}`,
  });
}

export async function adminVerifyContact(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  type: 'EMAIL' | 'PHONE',
  verified: boolean,
): Promise<void> {
  const ref = doc(db, 'users', targetUid);
  const field = type === 'EMAIL' ? 'isEmailVerified' : 'isPhoneVerified';
  await updateDoc(ref, {
    [field]: verified,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'USER',
    actionName: `VERIFY_${type}`,
    targetUid,
    targetEmail,
    newState: verified ? 'VERIFIED' : 'UNVERIFIED',
    details: `Manually set ${type} verification status to ${verified} for ${targetEmail}`,
  });
}

export async function adminSetKycStatus(
  adminEmail: string,
  adminUid: string,
  targetUid: string,
  targetEmail: string,
  kycStatus: KycStatus,
  reason: string,
): Promise<void> {
  const ref = doc(db, 'users', targetUid);
  await updateDoc(ref, {
    kycStatus,
    kycReason: reason,
    kycReviewedAt: new Date().toISOString(),
    kycReviewedBy: adminEmail,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'USER',
    actionName: `KYC_${kycStatus}`,
    targetUid,
    targetEmail,
    reason,
    newState: kycStatus,
    details: `KYC status set to ${kycStatus} for ${targetEmail}`,
  });
}
