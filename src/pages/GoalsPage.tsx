import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Target,
  Plus,
  Car,
  Home,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Sparkles,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react';
import { usePersonalization, FinancialGoal } from '@/hooks/usePersonalization';
import { useHoldings } from '@/hooks/useHoldings';
import { formatCurrency } from '@/lib/formatters';
import { triggerHaptic } from '@/lib/haptics';

const DEFAULT_PRESETS = [
  { title: 'Buy a Car', category: 'car', icon: Car, defaultTarget: 800000 },
  { title: 'Buy a House', category: 'house', icon: Home, defaultTarget: 5000000 },
  { title: 'Children Education', category: 'education', icon: GraduationCap, defaultTarget: 1500000 },
  { title: 'Retirement Fund', category: 'retirement', icon: TrendingUp, defaultTarget: 10000000 },
  { title: 'Emergency Fund', category: 'emergency', icon: ShieldCheck, defaultTarget: 300000 },
];

export default function GoalsPage() {
  const [, setLocation] = useLocation();
  const { settings, addGoal, updateGoalProgress, removeGoal } = usePersonalization();
  const { totalCurrentValue } = useHoldings();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof DEFAULT_PRESETS[0] | null>(DEFAULT_PRESETS[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000000');
  const [targetDate, setTargetDate] = useState('2028-12-31');

  // Deposit Modal State
  const [activeDepositGoal, setActiveDepositGoal] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('50000');

  const goalsList = settings.goals || [];

  const handleCreateGoal = () => {
    if (!targetAmount || Number(targetAmount) <= 0) return;
    const title = customTitle.trim() || selectedPreset?.title || 'Financial Goal';

    addGoal({
      id: 'goal_' + Date.now(),
      title,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      targetDate,
      category: selectedPreset?.category || 'custom',
    });

    triggerHaptic('success');
    setIsAddModalOpen(false);
    setCustomTitle('');
  };

  const handleDeposit = () => {
    if (!activeDepositGoal || !depositAmount || Number(depositAmount) <= 0) return;
    const newProgress = (activeDepositGoal.currentAmount || 0) + Number(depositAmount);
    updateGoalProgress(activeDepositGoal.id, newProgress);

    triggerHaptic('success');
    setActiveDepositGoal(null);
    setDepositAmount('50000');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center justify-between px-4 max-w-5xl mx-auto">
        <button
          onClick={() => setLocation('/dashboard')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          Financial Goals Tracker
        </h1>
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsAddModalOpen(true);
          }}
          className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Goals Hero Summary */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white border border-emerald-800/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Goal Achievement Progress
              </span>
              <h2 className="text-2xl font-black mt-1">
                {goalsList.length} Active Financial Milestones
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Allocate savings and portfolio growth toward explicit life goals like buying a house, retirement, or emergency reserves.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 text-center">
              <span className="text-xs text-slate-300 block font-medium">Portfolio Capital</span>
              <span className="text-xl font-black text-emerald-400">{formatCurrency(totalCurrentValue)}</span>
            </div>
          </div>
        </div>

        {/* Goals List */}
        {goalsList.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Target className="w-12 h-12 text-emerald-500/50 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">No Goals Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Set clear financial targets for buying a car, purchasing a home, or building an emergency fund.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Create First Financial Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalsList.map((goal) => {
              const progressPercent = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
              const isCompleted = progressPercent >= 100;

              return (
                <div
                  key={goal.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs relative overflow-hidden ${
                    isCompleted
                      ? 'border-emerald-500/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          {goal.title}
                          {isCompleted && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                              Achieved 🎉
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                          <Calendar className="w-3.5 h-3.5" /> Target Date: {goal.targetDate || '2028-12-31'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        removeGoal(goal.id);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar with Motion */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">
                        Saved: {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        Target: {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                      <span>{progressPercent.toFixed(1)}% Completed</span>
                      <span>
                        Remaining: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                      </span>
                    </div>
                  </div>

                  {/* Goal Deposit / Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveDepositGoal(goal);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all text-center shadow-xs"
                    >
                      + Add Funds
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" /> Create Financial Goal
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Presets Grid */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Choose Goal Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_PRESETS.map((preset) => (
                    <button
                      key={preset.category}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setCustomTitle(preset.title);
                        setTargetAmount(preset.defaultTarget.toString());
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-bold ${
                        selectedPreset?.category === preset.category
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <preset.icon className="w-4 h-4 shrink-0" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Title Input */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Dream House, Tesla Car..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="1000000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Estimated Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleCreateGoal}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-md"
              >
                Save Financial Goal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {activeDepositGoal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base">Allocate Funds to Goal</h3>
                <button onClick={() => setActiveDepositGoal(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Goal: <strong className="text-slate-800 dark:text-slate-200">{activeDepositGoal.title}</strong>
              </p>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleDeposit}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-md"
              >
                Confirm Deposit
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
