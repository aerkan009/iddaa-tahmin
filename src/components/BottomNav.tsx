import { Home, Crown, BarChart3, User } from 'lucide-react';

type Tab = 'home' | 'predictions' | 'results' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'predictions', label: 'Predictions', icon: Crown },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container-lowest/90 dark:bg-surface-container-lowest/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] md:hidden">
      <div className="flex justify-around items-center h-20 pb-safe px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center active:scale-90 transition-all duration-200 ${
                isActive
                  ? 'text-primary font-bold bg-primary/10 rounded-xl px-3 py-1'
                  : 'text-on-surface-variant hover:text-primary transition-colors'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" fill={isActive ? 'currentColor' : 'none'} />
              <span className="font-body-sm text-body-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
