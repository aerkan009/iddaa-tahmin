export default function AdSplash() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F172A]">
      <div className="relative mb-8">
        <div className="text-5xl font-black tracking-tight text-primary">
          PRODIGY
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className="text-on-surface-variant font-data-label text-data-label mb-6">
        Yapay Zeka Destekli İddaa Analizleri
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
