import { useLocation } from 'wouter';
import { ChevronLeft, Volume2, Moon, Sun, Bell, HelpCircle, ChevronRight, ShieldCheck, Heart, Layout, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/contexts/ThemeContext';
import { SecurityManagementSection } from '@/components/profile/SecurityManagementSection';
import { usePersonalization } from '@/hooks/usePersonalization';
import { triggerHaptic } from '@/lib/haptics';

const SECTOR_OPTIONS = ['Technology', 'Banking', 'Energy', 'Automobile', 'Pharmaceuticals', 'Metals', 'FMCG'];

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { settings, settingsLoading, updateSetting } = useSettings();
  const { theme, setTheme } = useTheme();
  const { settings: persSettings, toggleSector, toggleWidget } = usePersonalization();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col max-w-4xl mx-auto pb-12">
      <header className="sticky top-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-base">App Settings & Security</span>
        <div className="w-6" />
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Appearance & Theme Section */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" /> Theme & Appearance
          </h3>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="font-bold text-sm">Theme Preset</div>
              <div className="text-xs text-slate-500">Switch between dark and light workspace themes</div>
            </div>

            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setTheme('dark');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  theme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setTheme('light');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Personalization Section */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" /> Personalization & Favorite Sectors
          </h3>

          <div>
            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Favorite Sectors</div>
            <div className="flex flex-wrap gap-2">
              {SECTOR_OPTIONS.map((sec) => {
                const isFav = persSettings.favoriteSectors.includes(sec);
                return (
                  <button
                    key={sec}
                    onClick={() => {
                      triggerHaptic('light');
                      toggleSector(sec);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isFav
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isFav ? '❤️ ' : ''}
                    {sec}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 uppercase mb-3">Dashboard Widget Visibility</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              {[
                { key: 'healthScore', label: 'Portfolio Health Score' },
                { key: 'dailySummary', label: 'Daily Market Summary' },
                { key: 'goalProgress', label: 'Financial Goal Tracker' },
                { key: 'investmentIdeas', label: 'AI Investment Suggestions' },
              ].map((w) => (
                <div key={w.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span>{w.label}</span>
                  <Switch
                    checked={persSettings.dashboardWidgets[w.key as keyof typeof persSettings.dashboardWidgets]}
                    onCheckedChange={() => {
                      triggerHaptic('light');
                      toggleWidget(w.key as any);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* V6 Security Center */}
        <SecurityManagementSection />
      </main>
    </div>
  );
}
