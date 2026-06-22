import { Home, Crown, BarChart3, User } from 'lucide-react';

type Tab = 'home' | 'predictions' | 'results' | 'profile';

interface DesktopSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'predictions', label: 'Predictions', icon: Crown },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-white/5 pt-24 px-4 z-40">
      <div className="space-y-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                isActive
                  ? 'text-primary bg-primary/10 font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
              }`}
            >
              <Icon className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} />
              <span className="font-body-lg text-body-lg">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
