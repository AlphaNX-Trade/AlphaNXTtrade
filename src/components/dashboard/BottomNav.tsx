import { Home, BarChart2, Compass, LineChart, PieChart, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'home',        icon: Home,       label: 'Home',        path: '/dashboard' },
  { id: 'markets',     icon: BarChart2,   label: 'Markets',     path: '/markets'   },
  { id: 'explore',     icon: Compass,     label: 'Explore',     path: '/explore'   },
  { id: 'investments', icon: LineChart,   label: 'Investments', path: '/investments' },
  { id: 'portfolio',   icon: PieChart,    label: 'Portfolio',   path: '/portfolio' },
  { id: 'profile',     icon: User,        label: 'Profile',     path: '/profile'   },
];

function getActiveTab(location: string): string {
  if (location.startsWith('/markets')) return 'markets';
  if (location.startsWith('/explore') || location.startsWith('/trade')) return 'explore';
  if (location.startsWith('/investments')) return 'investments';
  if (location.startsWith('/portfolio')) return 'portfolio';
  if (location.startsWith('/profile')) return 'profile';
  return 'home';
}

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const activeTab = getActiveTab(location);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[500px] bg-card/85 backdrop-blur-xl border border-primary/20 rounded-2xl h-16 flex items-center justify-around px-2 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setLocation(tab.path)}
            className="relative flex flex-col items-center justify-center flex-1 py-1 group cursor-pointer"
            data-testid={`tab-${tab.id}`}
            title={tab.label}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-x-1 -top-1 bottom-1 bg-primary/15 rounded-xl border border-primary/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon
              className={`w-5 h-5 z-10 transition-transform duration-200 ${
                isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'
              }`}
            />
            <span
              className={`text-[10px] font-mono z-10 mt-0.5 leading-none transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground/80'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

