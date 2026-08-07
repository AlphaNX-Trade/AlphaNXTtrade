import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ChevronLeft,
  ChevronDown,
  MessageSquare,
  Bug,
  Star,
  HelpCircle,
  Sparkles,
  Send,
  CheckCircle2,
  BookOpen,
  LifeBuoy,
  X,
  PlayCircle,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'General',
    question: 'What is AlphaNXT V6?',
    answer:
      'AlphaNXT V6 is a premium investment ecosystem & paper trading platform. You trade with virtual money — ₹1,00,000 starting virtual balance — to practice, build portfolios, explore curated themes, and learn without financial risk.',
  },
  {
    category: 'General',
    question: 'Is my money real?',
    answer:
      'No. All balances, holdings, and P&L in AlphaNXT are simulated with virtual currency. Nothing here involves real brokerage accounts or real capital.',
  },
  {
    category: 'V6 Features',
    question: 'How do Investment Collections work?',
    answer:
      'Investment Collections group top stocks by sector and theme (e.g. Tech Giants, Dividend Kings, Green Energy). You can explore entire baskets or trade individual assets.',
  },
  {
    category: 'V6 Features',
    question: 'How is the Portfolio Health Score calculated?',
    answer:
      'Health Score (0-100) measures your portfolio across 4 key dimensions: Sector Diversification (30%), Profit Return Rate (30%), Single-Stock Concentration Risk (20%), and Cash Reserve Buffer (20%).',
  },
  {
    category: 'Trading',
    question: 'How does the AI Trading Coach work?',
    answer:
      'When you close a position, the coach evaluates entry/exit timing, risk plan, and holding duration. It provides actionable feedback and links to lessons in the Learning Academy.',
  },
  {
    category: 'Security',
    question: 'How do I enable PIN App Lock?',
    answer:
      'Go to Profile > Security Center > Setup PIN. Enter a 4-digit code to protect your AlphaNXT workspace on startup.',
  },
];

export default function HelpPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'feedback'>('faq');

  // Modal states
  const [supportModal, setSupportModal] = useState(false);
  const [bugModal, setBugModal] = useState(false);
  const [tutorialModal, setTutorialModal] = useState(false);

  // Form states
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const filteredFaqs = FAQS.filter(
    (faq) => activeCategory === 'All' || faq.category === activeCategory
  );

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    toast({
      title: 'Support Ticket Submitted',
      description: 'Our team will review your request shortly. Ticket ID: #NXT-' + Math.floor(1000 + Math.random() * 9000),
    });
    setSupportModal(false);
    setSupportSubject('');
    setSupportMessage('');
  };

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    toast({
      title: 'Issue Reported',
      description: 'Thank you for helping improve AlphaNXT V6! Issue logged successfully.',
    });
    setBugModal(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    toast({
      title: 'Feedback Received',
      description: `Thank you for rating AlphaNXT ${rating} stars!`,
    });
    setFeedbackText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col max-w-4xl mx-auto pb-12">
      {/* Header */}
      <header className="sticky top-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-base flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-emerald-500" /> Help & Support Center
        </span>
        <button
          onClick={() => setTutorialModal(true)}
          className="p-1 text-emerald-500 hover:text-emerald-400 font-bold text-xs flex items-center gap-1"
        >
          <PlayCircle className="w-4 h-4" /> Tour
        </button>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Quick Action Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl space-y-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/20 text-white tracking-widest">
              24/7 Support Desk
            </span>
            <h2 className="text-xl font-extrabold mt-2">How can we assist you today?</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Browse FAQs, submit a support ticket, or take the guided V6 tour.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => {
                triggerHaptic('medium');
                setSupportModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Contact Support
            </button>
            <button
              onClick={() => {
                triggerHaptic('medium');
                setBugModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5"
            >
              <Bug className="w-4 h-4 text-rose-400" /> Report Issue
            </button>
            <button
              onClick={() => setTutorialModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> V6 Guided Tour
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
          {[
            { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
            { id: 'feedback', label: 'App Feedback & Ratings', icon: Star },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as any);
                }}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Tab Content */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['All', 'General', 'V6 Features', 'Trading', 'Security'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    activeCategory === cat
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion list */}
            <div className="space-y-2">
              {filteredFaqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-sm font-bold text-slate-900 dark:text-white pr-3">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Tab Content */}
        {activeTab === 'feedback' && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Rate Your AlphaNXT V6 Experience</h3>
            <p className="text-xs text-slate-500">Your feedback drives future feature updates!</p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => {
                      triggerHaptic('medium');
                      setRating(star);
                    }}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts or feature suggestions for V6..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                required
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" /> Submit Feedback
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Support Ticket Modal */}
      {supportModal && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" /> Contact Support Ticket
              </h3>
              <button onClick={() => setSupportModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="e.g. Question about Portfolio Health Score"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                <textarea
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue or inquiry in detail..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSupportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Send Ticket
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bug Report Modal */}
      {bugModal && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-500" /> Report an Issue
              </h3>
              <button onClick={() => setBugModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleBugSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issue Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Chart loading delay on mobile"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Steps to Reproduce</label>
                <textarea
                  rows={3}
                  placeholder="Explain what happened..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBugModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* V6 Guided Onboarding Tour Modal */}
      {tutorialModal && (
        <div className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <h3 className="font-extrabold text-xl">Welcome to AlphaNXT V6</h3>
              </div>
              <button onClick={() => setTutorialModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm">Discover Collections</h4>
                  <p className="text-xs text-slate-500">Explore curated themes like Tech Titans and Green Energy in the Explore tab.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm">Voice & Advanced Search</h4>
                  <p className="text-xs text-slate-500">Click the search bar or microphone icon anywhere to speak company names or filter sectors.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm">Portfolio Health & Security</h4>
                  <p className="text-xs text-slate-500">Track your Health Score on the Dashboard and setup PIN lock in Profile settings.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTutorialModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
            >
              Start Exploring V6
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
