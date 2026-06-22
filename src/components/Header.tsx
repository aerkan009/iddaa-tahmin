import { Zap, Star } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(74,225,118,0.1)] pt-safe">
      <div className="flex items-center justify-between px-margin-mobile h-16 w-full max-w-7xl mx-auto">
        <button className="text-primary dark:text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full">
          <Zap className="w-6 h-6" fill="currentColor" />
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-primary italic tracking-tighter">
          PRODIGY VIP
        </h1>
        <button className="text-primary dark:text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full">
          <Star className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
