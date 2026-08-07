import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Delete, KeyRound, Smartphone } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface AppLockModalProps {
  isLocked: boolean;
  onVerifyPin: (pin: string) => boolean;
  onBiometricUnlock?: () => void;
  biometricEnabled?: boolean;
}

export function AppLockModal({
  isLocked,
  onVerifyPin,
  onBiometricUnlock,
  biometricEnabled,
}: AppLockModalProps) {
  const [pinInput, setPinInput] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    triggerHaptic('light');
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      setError(false);

      if (next.length === 4) {
        const valid = onVerifyPin(next);
        if (valid) {
          triggerHaptic('success');
          setPinInput('');
        } else {
          triggerHaptic('error');
          setError(true);
          setTimeout(() => {
            setPinInput('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('light');
    setPinInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm flex flex-col items-center text-center space-y-6"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Lock className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-950">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">AlphaNXT V6 Secure</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your 4-digit Security PIN to unlock</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const filled = pinInput.length > index;
            return (
              <motion.div
                key={index}
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  error
                    ? 'border-rose-500 bg-rose-500/30'
                    : filled
                    ? 'border-emerald-400 bg-emerald-400 shadow-md shadow-emerald-400/50 scale-110'
                    : 'border-slate-600 bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {error && <p className="text-xs font-semibold text-rose-400 animate-bounce">Incorrect Security PIN. Try again.</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] pt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all text-xl font-bold flex items-center justify-center border border-slate-700/50 mx-auto"
            >
              {num}
            </button>
          ))}

          {/* Biometric / Extra option */}
          <button
            onClick={() => {
              if (biometricEnabled && onBiometricUnlock) {
                triggerHaptic('medium');
                onBiometricUnlock();
              }
            }}
            disabled={!biometricEnabled}
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${
              biometricEnabled ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30' : 'opacity-0 cursor-default'
            }`}
          >
            <Smartphone className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all text-xl font-bold flex items-center justify-center border border-slate-700/50 mx-auto"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 transition-all flex items-center justify-center text-slate-300 mx-auto border border-slate-700/30"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5 justify-center">
          <KeyRound className="w-3.5 h-3.5" />
          256-bit Encrypted Session Security
        </div>
      </motion.div>
    </div>
  );
}
