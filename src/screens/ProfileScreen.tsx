import { User, Settings, Bell, Shield, HelpCircle, ChevronRight, Crown } from 'lucide-react';

const menuItems = [
  { label: 'Account Settings', icon: Settings },
  { label: 'Notifications', icon: Bell },
  { label: 'VIP Status', icon: Crown, badge: 'Active' },
  { label: 'Privacy & Security', icon: Shield },
  { label: 'Help & Support', icon: HelpCircle },
];

export default function ProfileScreen() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile py-lg overflow-y-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 mb-lg">
        <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-primary flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="font-title-md text-title-md text-on-surface font-bold">VIP Member</h2>
          <span className="font-data-label text-data-label text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Premium Access
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-panel rounded-xl p-4 mb-lg flex justify-around">
        <div className="flex flex-col items-center">
          <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-black">142</span>
          <span className="font-data-label text-data-label text-on-surface-variant">Predictions</span>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-black">85%</span>
          <span className="font-data-label text-data-label text-on-surface-variant">Win Rate</span>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-black">12</span>
          <span className="font-data-label text-data-label text-on-surface-variant">Days Streak</span>
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-2 pb-lg">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="glass-panel rounded-lg p-3 flex items-center justify-between hover:bg-white/5 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-secondary" />
                <span className="font-body-lg text-body-lg text-on-surface">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="font-data-label text-data-label text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
