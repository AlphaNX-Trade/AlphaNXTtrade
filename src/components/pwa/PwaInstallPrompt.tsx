import { useState } from 'react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaInstallPrompt() {
  const { isInstallable, isIos, installApp, dismissPrompt } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 text-slate-100 p-4 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle gradient glow accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={dismissPrompt}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800/80 transition-colors"
            aria-label="Dismiss installation prompt"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 p-1 shadow-inner">
              <img src="/logo-mark.png" alt="AlphaNXT" className="w-full h-full object-contain" />
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-base">Install AlphaNXT</span>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> App
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Add to your home screen for fast offline access, live market updates, and full screen experience.
              </p>

              <div className="mt-3 flex items-center gap-2">
                {isIos ? (
                  <button
                    onClick={() => setShowIosGuide(!showIosGuide)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    How to Install
                  </button>
                ) : (
                  <button
                    onClick={installApp}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                  </button>
                )}
                <button
                  onClick={dismissPrompt}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-2 transition-colors whitespace-nowrap"
                >
                  Not now
                </button>
              </div>

              {/* iOS Instructions Dropdown */}
              {showIosGuide && (
                <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Safari Installation Guide:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] pl-1">
                    <li className="flex items-center gap-1">
                      Tap the <Share className="w-3.5 h-3.5 text-primary inline mx-0.5" /> Share button below
                    </li>
                    <li className="flex items-center gap-1">
                      Scroll down & select <PlusSquare className="w-3.5 h-3.5 text-primary inline mx-0.5" /> Add to Home Screen
                    </li>
                    <li>Tap Add in the top right corner</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
