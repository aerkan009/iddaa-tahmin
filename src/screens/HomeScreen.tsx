import { useEffect, useState } from 'react';
import { AdMob, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';
import { supabase } from '../lib/supabase';
import { getLiveFixtures, ApiFixture, formatMatchTime } from '../services/apiFootball';

interface Match {
  id: number;
  match_time: string;
  teams: string;
  home_team?: string;
  away_team?: string;
  home_logo?: string;
  away_logo?: string;
  league?: string;
  status?: string;
  home_score?: number | null;
  away_score?: number | null;
  free_prediction: string;
  vip_prediction: Record<string, string> | null;
}

function Logo({ src, name }: { src?: string; name: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center text-sm font-bold text-on-surface-variant">
        {name?.[0] || '?'}
      </div>
    );
  }
  return (
    <img
      className="w-10 h-10 object-contain"
      src={src}
      alt={name}
      onError={() => setError(true)}
    />
  );
}

export default function HomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveFixtures, setLiveFixtures] = useState<ApiFixture[]>([]);
  const [unlockedMatches, setUnlockedMatches] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [supabaseData, liveData] = await Promise.all([
        supabase.from('matches').select('*').order('created_at', { ascending: false }),
        getLiveFixtures().catch(() => [] as ApiFixture[]),
      ]);

      if (!supabaseData.error) setMatches(supabaseData.data || []);
      setLiveFixtures(liveData);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlockVip = async (matchId: number) => {
    try {
      const options: RewardAdOptions = {
        adId: 'ca-app-pub-6440512201259891/2085560673',
      };

      await AdMob.prepareRewardVideoAd(options);

      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        setUnlockedMatches((prev) => {
          if (!prev.includes(matchId)) {
            return [...prev, matchId];
          }
          return prev;
        });
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        AdMob.removeAllListeners();
      });

      await AdMob.showRewardVideoAd();

    } catch {
      alert('Reklam sistemi aktif! (Test icin kilit aciliyor.)');
      setUnlockedMatches((prev) => [...prev, matchId]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f18] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-400 font-mono tracking-widest animate-pulse">RADAR TARANIYOR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-4 sm:p-6 font-sans relative overflow-hidden">
      
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-green-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tight">
            SON 7 GUN BASARI: %84
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">Gercek verilerle AI destekli analizler</p>
        </div>

        {liveFixtures.length > 0 && (
          <div className="bg-white/[0.03] backdrop-blur-lg border border-green-500/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-green-400 font-bold text-sm uppercase tracking-wider">Canli Maclar</span>
            </div>
            <div className="space-y-2">
              {liveFixtures.slice(0, 5).map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-gray-300 font-semibold text-sm truncate">{f.teams.home.name}</span>
                    <span className="text-gray-500 text-xs">vs</span>
                    <span className="text-gray-300 font-semibold text-sm truncate">{f.teams.away.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-green-400 font-bold text-sm">
                      {f.goals.home ?? 0} - {f.goals.away ?? 0}
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded">
                      {formatMatchTime(f)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {matches.map((match) => {
            const isUnlocked = unlockedMatches.includes(match.id);

            return (
              <div 
                key={match.id} 
                className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-3xl p-1 shadow-2xl hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="bg-[#0f1623] rounded-[22px] p-5 h-full relative overflow-hidden">
                  
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-green-400 font-mono font-bold text-sm tracking-wider">{match.match_time}</span>
                      {match.league && (
                        <span className="text-gray-500 text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded">{match.league}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-5 gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Logo src={match.home_logo} name={match.home_team || match.teams.split(' - ')[0] || ''} />
                      <span className="font-extrabold text-base text-gray-100 truncate">{match.home_team || match.teams.split(' - ')[0]}</span>
                    </div>
                    <span className="text-gray-500 text-xs font-bold px-2">VS</span>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-extrabold text-base text-gray-100 truncate">{match.away_team || match.teams.split(' - ')[1]}</span>
                      <Logo src={match.away_logo} name={match.away_team || match.teams.split(' - ')[1] || ''} />
                    </div>
                  </div>

                  <div className="relative">
                    <div className={`space-y-4 transition-all duration-700 ease-in-out ${!isUnlocked ? 'blur-lg opacity-30 select-none' : 'blur-0 opacity-100'}`}>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Guvenilir Tahmin</span>
                        <span className="font-bold text-white text-md">{match.free_prediction}</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-cyan-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                            <span>💎</span> VIP Derin Analiz
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-4 border border-white/5">
                          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10">
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Alt/Ust</span>
                              <span className="text-green-400 font-bold text-lg">{match.vip_prediction?.alt_ust || '?'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">IY/MS</span>
                              <span className="text-green-400 font-bold text-lg">{match.vip_prediction?.iy_ms || '?'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Korner</span>
                              <span className="text-green-400 font-bold text-lg">{match.vip_prediction?.korner || '?'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <button 
                          onClick={() => handleUnlockVip(match.id)}
                          className="group relative overflow-hidden rounded-full p-[1px] transform transition-transform hover:scale-105 active:scale-95"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-green-400 via-cyan-500 to-green-400 rounded-full animate-[spin_3s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity"></span>
                          <div className="relative bg-[#0f1623] px-6 py-3 rounded-full flex items-center gap-3 transition-colors group-hover:bg-[#0a0f18]">
                            <span className="text-xl">🔓</span>
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                              Reklam Izle - Tahmini Gor
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
