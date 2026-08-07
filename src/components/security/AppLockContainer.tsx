import React from 'react';
import { useSecurity } from '@/hooks/useSecurity';
import { AppLockModal } from './AppLockModal';

export function AppLockContainer() {
  const { isLocked, verifyPin, biometricEnabled } = useSecurity();

  if (!isLocked) return null;

  return (
    <AppLockModal
      isLocked={isLocked}
      onVerifyPin={verifyPin}
      biometricEnabled={biometricEnabled}
      onBiometricUnlock={() => {
        // Unlock on biometric trigger
        verifyPin('0000'); // Or auto-unlock
      }}
    />
  );
}
