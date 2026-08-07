import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SECURITY_KEY = 'alphanxt_v6_security';

export interface LoginHistoryItem {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  browser: string;
  status: 'Success' | 'Failed';
  location: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecuritySettings {
  pinEnabled: boolean;
  pinHash: string | null;
  biometricEnabled: boolean;
  loginHistory: LoginHistoryItem[];
  activeSessions: ActiveSession[];
}

const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: 's1',
    device: typeof window !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Mobile Web / Chrome' : 'Desktop / Chrome Browser',
    ip: '103.217.158.12',
    location: 'Mumbai, India',
    lastActive: 'Active Now',
    isCurrent: true,
  },
  {
    id: 's2',
    device: 'AlphaNXT Mobile App (iOS)',
    ip: '103.217.158.12',
    location: 'Mumbai, India',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
];

const INITIAL_LOGIN_HISTORY: LoginHistoryItem[] = [
  {
    id: 'lh1',
    timestamp: new Date().toISOString(),
    ip: '103.217.158.12',
    device: 'Chrome Web',
    browser: 'Chrome 122',
    status: 'Success',
    location: 'Mumbai, India',
  },
  {
    id: 'lh2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    ip: '103.217.158.12',
    device: 'Mobile Web',
    browser: 'Safari Mobile',
    status: 'Success',
    location: 'Mumbai, India',
  },
];

export function useSecurity() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest';
  const storageKey = `${SECURITY_KEY}_${userId}`;

  const [pinEnabled, setPinEnabled] = useState<boolean>(false);
  const [pin, setPin] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>(INITIAL_LOGIN_HISTORY);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPinEnabled(!!parsed.pinEnabled);
        setPin(parsed.pin || null);
        setBiometricEnabled(!!parsed.biometricEnabled);
        if (parsed.pinEnabled && parsed.pin) {
          setIsLocked(true);
        }
        if (parsed.activeSessions) setActiveSessions(parsed.activeSessions);
        if (parsed.loginHistory) setLoginHistory(parsed.loginHistory);
      }
    } catch {
      // Default state
    }
  }, [storageKey]);

  const saveToStorage = useCallback(
    (data: Partial<SecuritySettings>) => {
      try {
        const current = {
          pinEnabled,
          pin,
          biometricEnabled,
          activeSessions,
          loginHistory,
          ...data,
        };
        localStorage.setItem(storageKey, JSON.stringify(current));
      } catch (e) {
        console.error('Failed to save security settings', e);
      }
    },
    [pinEnabled, pin, biometricEnabled, activeSessions, loginHistory, storageKey]
  );

  const setupPin = useCallback(
    (newPin: string) => {
      setPin(newPin);
      setPinEnabled(true);
      setIsLocked(false);
      saveToStorage({ pin: newPin, pinEnabled: true });
    },
    [saveToStorage]
  );

  const removePin = useCallback(() => {
    setPin(null);
    setPinEnabled(false);
    setIsLocked(false);
    saveToStorage({ pin: null, pinEnabled: false });
  }, [saveToStorage]);

  const verifyPin = useCallback(
    (inputPin: string) => {
      if (inputPin === pin) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [pin]
  );

  const toggleBiometric = useCallback(() => {
    setBiometricEnabled((prev) => {
      const next = !prev;
      saveToStorage({ biometricEnabled: next });
      return next;
    });
  }, [saveToStorage]);

  const revokeSession = useCallback(
    (sessionId: string) => {
      setActiveSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionId);
        saveToStorage({ activeSessions: updated });
        return updated;
      });
    },
    [saveToStorage]
  );

  const lockApp = useCallback(() => {
    if (pinEnabled) {
      setIsLocked(true);
    }
  }, [pinEnabled]);

  return {
    pinEnabled,
    biometricEnabled,
    isLocked,
    activeSessions,
    loginHistory,
    setupPin,
    removePin,
    verifyPin,
    toggleBiometric,
    revokeSession,
    lockApp,
  };
}
