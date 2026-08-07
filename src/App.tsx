import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ensureMarketEngineRunning } from '@/lib/marketEngine/seedMarketEngine';
import { isAdminEmail } from '@/lib/adminConfig';
import { CandlestickPatternBg } from '@/components/ui/CandlestickPatternBg';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

// Starts the continuous market simulation the moment the app loads — runs
// for the whole session regardless of which page is open.
ensureMarketEngineRunning();

// Lazy load pages for performance optimization & code splitting
const SplashPage = lazy(() => import('@/pages/SplashPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const MarketsPage = lazy(() => import('@/pages/MarketsPage'));
const AssetDetailPage = lazy(() => import('@/pages/AssetDetailPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const TradePage = lazy(() => import('@/pages/TradePage'));
const InvestmentsPage = lazy(() => import('@/pages/InvestmentsPage'));
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage'));
const TransactionHistoryPage = lazy(() => import('@/pages/TransactionHistoryPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const ChallengesPage = lazy(() => import('@/pages/ChallengesPage'));
const EditProfilePage = lazy(() => import('@/pages/EditProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const LearnPage = lazy(() => import('@/pages/LearnPage'));
const TopicLessonPage = lazy(() => import('@/pages/TopicLessonPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const MarketHubPage = lazy(() => import('@/pages/MarketHubPage'));
const WatchlistPage = lazy(() => import('@/pages/WatchlistPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const StatisticsPage = lazy(() => import('@/pages/StatisticsPage'));

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

function AuthGuard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && minTimeElapsed) {
      if (user) {
        setLocation('/dashboard');
      } else {
        setLocation('/login');
      }
    }
  }, [user, loading, minTimeElapsed, setLocation]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center z-10 px-10"
      >
        <img src="/logo-full.png" alt="AlphaNXT" className="w-full max-w-[280px] object-contain" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-10 w-40 h-1 bg-slate-200 rounded-full overflow-hidden relative"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-y-0 left-0 w-1/2 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
      >
        <CandlestickPatternBg className="w-full h-full" />
      </motion.div>
    </div>
  );
}

function ProtectedDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <DashboardPage />;
}

function ProtectedMarketsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <MarketsPage />;
}

function ProtectedAssetDetailPage({ params }: { params: { symbol: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <AssetDetailPage symbol={params.symbol} />;
}

function ProtectedTradePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <TradePage />;
}

function ProtectedTradeSymbolPage({ params }: { params: { symbol: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <TradePage symbol={params.symbol} />;
}

function ProtectedInvestmentsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <InvestmentsPage />;
}

function ProtectedExplorePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <ExplorePage />;
}

function ProtectedPortfolioPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <PortfolioPage />;
}

function ProtectedTransactionHistoryPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <TransactionHistoryPage />;
}

function ProtectedProfilePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <ProfilePage />;
}

function ProtectedLearnPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <LearnPage />;
}

function ProtectedAchievementsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <AchievementsPage />;
}

function ProtectedChallengesPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <ChallengesPage />;
}

function ProtectedEditProfilePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <EditProfilePage />;
}

function ProtectedSettingsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <SettingsPage />;
}

function ProtectedNotificationsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <NotificationsPage />;
}

function ProtectedHelpPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <HelpPage />;
}

function AdminGuard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation('/login');
    } else if (!isAdminEmail(user.email)) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation]);

  if (loading || !user || !isAdminEmail(user.email)) return <LoadingScreen />;
  return <AdminPage />;
}

function ProtectedTopicLessonPage({ params }: { params: { topicId: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <TopicLessonPage topicId={params.topicId} />;
}

function ProtectedQuizPage({ params }: { params: { topicId: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <QuizPage topicId={params.topicId} />;
}

function ProtectedMarketHubPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) setLocation('/login');
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <MarketHubPage />;
}

function ProtectedWatchlistPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) setLocation('/login');
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <WatchlistPage />;
}

function ProtectedAlertsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) setLocation('/login');
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <AlertsPage />;
}

function ProtectedCalendarPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) setLocation('/login');
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <CalendarPage />;
}

function ProtectedStatisticsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) setLocation('/login');
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <StatisticsPage />;
}

function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/" component={AuthGuard} />
        <Route path="/splash" component={SplashPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/dashboard" component={ProtectedDashboard} />
        <Route path="/markets" component={ProtectedMarketsPage} />
        <Route path="/markets/:symbol" component={ProtectedAssetDetailPage} />
        <Route path="/trade" component={ProtectedTradePage} />
        <Route path="/trade/:symbol" component={ProtectedTradeSymbolPage} />
        <Route path="/explore" component={ProtectedExplorePage} />
        <Route path="/investments" component={ProtectedInvestmentsPage} />
        <Route path="/portfolio" component={ProtectedPortfolioPage} />
        <Route path="/history" component={ProtectedTransactionHistoryPage} />
        <Route path="/profile" component={ProtectedProfilePage} />
        <Route path="/learn" component={ProtectedLearnPage} />
        <Route path="/achievements" component={ProtectedAchievementsPage} />
        <Route path="/challenges" component={ProtectedChallengesPage} />
        <Route path="/edit-profile" component={ProtectedEditProfilePage} />
        <Route path="/settings" component={ProtectedSettingsPage} />
        <Route path="/notifications" component={ProtectedNotificationsPage} />
        <Route path="/help" component={ProtectedHelpPage} />
        <Route path="/admin" component={AdminGuard} />
        <Route path="/market-hub" component={ProtectedMarketHubPage} />
        <Route path="/watchlist" component={ProtectedWatchlistPage} />
        <Route path="/alerts" component={ProtectedAlertsPage} />
        <Route path="/calendar" component={ProtectedCalendarPage} />
        <Route path="/statistics" component={ProtectedStatisticsPage} />
        <Route path="/learn/:topicId/quiz" component={ProtectedQuizPage} />
        <Route path="/learn/:topicId" component={ProtectedTopicLessonPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <WouterRouter base={((import.meta as any).env?.BASE_URL || '/').replace(/\/$/, '')}>
              <OfflineIndicator />
              <Router />
              <PwaInstallPrompt />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
