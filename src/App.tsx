import { useState, useEffect } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { useCapacitorAdMob } from './hooks/useCapacitorAdMob';
import AdSplash from './components/AdSplash';
import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const adState = useCapacitorAdMob();

  useEffect(() => {
    const initializeAdMobAndBanner = async () => {
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
        });

        const options: BannerAdOptions = {
          adId: 'ca-app-pub-6440512201259891/1179673116',
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        };

        await AdMob.showBanner(options);
      } catch (error) {
        console.error("AdMob başlatılamadı:", error);
      }
    };

    initializeAdMobAndBanner();

    return () => {
      AdMob.hideBanner().catch(console.error);
    };
  }, []);

  if (adState !== 'dismissed') {
    return <AdSplash />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white font-sans flex flex-col relative">

      <header className="sticky top-0 z-50 bg-[#0a0f18]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <span className="font-black text-black text-xl leading-none">P</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">
                PRODIGY <span className="text-green-400">AI</span>
              </h1>
              <span className="text-[9px] text-cyan-500 font-mono tracking-widest uppercase">VIP Analiz Radarı</span>
              <span className="text-[7px] text-gray-500 font-mono tracking-widest mt-0.5">ENGINEERED BY EA LABS</span>
            </div>
          </div>

          <button className="text-green-400 hover:text-white transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </header>

      <div className="bg-[#0f1623] border-b border-white/5">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3 text-xs font-bold tracking-widest transition-all duration-300 ${activeTab === 'home' ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            GÜNÜN MAÇLARI
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-bold tracking-widest transition-all duration-300 ${activeTab === 'history' ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            ÖNCEKİ SONUÇLAR
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-[100px]">
        {activeTab === 'home' ? <HomeScreen /> : <ResultsScreen />}
      </main>
    </div>
  );
}
