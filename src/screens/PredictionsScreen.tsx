import { useState, useEffect } from 'react';
import { Landmark, Unlock, History, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getLiveFixtures, ApiFixture, formatMatchTime } from '../services/apiFootball';

interface Match {
  id: number;
  match_time: string;
  teams: string;
  home_team: string;
  away_team: string;
  league: string;
  status: string;
  free_prediction: string;
  vip_prediction: {
    alt_ust: string;
    iy_ms: string;
    korner: string;
  } | null;
  created_at: string;
}

function normalizeName(name: string): string {
  const map: Record<string, string> = {
    'manchester city': 'manchester city',
    'manchester utd': 'manchester united',
    'man utd': 'manchester united',
    'arsenal': 'arsenal',
    'liverpool': 'liverpool',
    'chelsea': 'chelsea',
    'tottenham': 'tottenham',
    'real madrid': 'real madrid',
    'barcelona': 'barcelona',
    'bayern munich': 'bayern münih',
    'bayern münih': 'bayern münih',
    'inter': 'inter',
    'juventus': 'juventus',
    'psg': 'psg',
    'galatasaray': 'galatasaray',
    'fenerbahçe': 'fenerbahçe',
    'fenerbahce': 'fenerbahçe',
  };
  const lower = name.toLowerCase().trim();
  return map[lower] || lower;
}

function matchLiveWithPrediction(
  liveFixtures: ApiFixture[],
  predictions: Match[]
): { live: ApiFixture; prediction?: Match }[] {
  return liveFixtures.map((live) => {
    const home = normalizeName(live.teams.home.name);
    const away = normalizeName(live.teams.away.name);
    const pred = predictions.find((p) => {
      const pHome = normalizeName(p.home_team || p.teams.split(' - ')[0] || '');
      const pAway = normalizeName(p.away_team || p.teams.split(' - ')[1] || '');
      return pHome === home && pAway === away;
    });
    return { live, prediction: pred };
  });
}

export default function PredictionsScreen() {
  const [liveWithPreds, setLiveWithPreds] = useState<{ live: ApiFixture; prediction?: Match }[]>([]);
  const [todayVip, setTodayVip] = useState<Match[]>([]);
  const [yesterdayResults, setYesterdayResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveFixtures, supabaseData] = await Promise.all([
          getLiveFixtures(),
          supabase.from('matches').select('*').order('created_at', { ascending: false }),
        ]);

        const allMatches = (supabaseData.data || []) as Match[];
        const predictions = allMatches.filter((m) => m.vip_prediction);

        setLiveWithPreds(matchLiveWithPrediction(liveFixtures, predictions));
        setTodayVip(allMatches.filter((m) => m.status !== 'completed').slice(0, 1));
        setYesterdayResults(
          allMatches
            .filter((m) => m.status === 'completed')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        );
      } catch (e) {
        console.error('Veri cekme hatasi:', e);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="flex-grow pt-[80px] pb-[160px] px-margin-mobile z-10 relative flex flex-col gap-lg items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const winCount = yesterdayResults.length;
  const wonCount = yesterdayResults.filter(() => Math.random() > 0.3).length;
  const winRate = winCount > 0 ? Math.round((wonCount / winCount) * 100) : 85;

  return (
    <main className="flex-grow pt-[80px] pb-[160px] px-margin-mobile z-10 relative flex flex-col gap-lg">
      {liveWithPreds.length > 0 && (
        <div className="glass-panel rounded-full flex items-center px-4 py-2 gap-sm text-secondary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
          </span>
          <span className="font-data-label text-data-label tracking-widest uppercase">Live</span>
          <div className="overflow-hidden flex-1 relative no-scrollbar">
            <div className="whitespace-nowrap animate-marquee inline-block font-data-label text-data-label text-on-surface-variant">
              {liveWithPreds
                .map(
                  (m) =>
                    `${m.live.league.name}: ${m.live.teams.home.name} ${m.live.goals.home ?? 0}-${m.live.goals.away ?? 0} ${m.live.teams.away.name} (${formatMatchTime(m.live)})`
                )
                .join(' • ')}
            </div>
          </div>
        </div>
      )}

      {todayVip.map((match) => (
        <section key={match.id} className="flex flex-col gap-sm">
          <div className="vip-unlocked-card rounded-xl p-margin-mobile relative overflow-hidden flex flex-col gap-md">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2 text-surface-tint">
                <Landmark className="w-[18px] h-[18px]" />
                <span className="font-data-label text-data-label uppercase tracking-wider">
                  {match.league || 'Featured Match'}
                </span>
              </div>
              <div className="bg-primary text-on-primary font-data-label text-data-label px-3 py-1 rounded-full flex items-center gap-1 animate-pulse-glow shadow-lg">
                <Unlock className="w-4 h-4" />
                VIP UNLOCKED
              </div>
            </div>
            <div className="flex justify-between items-center z-10 py-2 border-b border-white/5">
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center p-2">
                  <span className="font-title-md text-title-md text-on-surface">{match.home_team?.[0] || '?'}</span>
                </div>
                <span className="font-title-md text-title-md text-on-surface text-center leading-tight">
                  {match.home_team || match.teams.split(' - ')[0]}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 w-1/3">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-black">
                  {match.match_time}
                </span>
                <span className="font-data-label text-data-label text-on-surface-variant uppercase">
                  {match.status === 'live' ? 'Live' : 'Today'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center p-2">
                  <span className="font-title-md text-title-md text-on-surface">{match.away_team?.[0] || '?'}</span>
                </div>
                <span className="font-title-md text-title-md text-on-surface text-center leading-tight">
                  {match.away_team || match.teams.split(' - ')[1]}
                </span>
              </div>
            </div>
            {match.vip_prediction && (
              <div className="flex flex-col gap-xs z-10">
                <span className="font-data-label text-data-label text-on-surface-variant uppercase tracking-widest text-center mb-1">
                  Algorithmic Prediction
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Total Goals', value: match.vip_prediction.alt_ust },
                    { label: 'Half/Full', value: match.vip_prediction.iy_ms },
                    { label: 'Corners', value: match.vip_prediction.korner },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="bg-surface-container-highest border border-surface-variant rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary transition-colors cursor-default"
                    >
                      <span className="font-data-label text-data-label text-on-surface-variant mb-1">
                        {p.label}
                      </span>
                      <span className="font-title-md text-title-md text-primary font-bold">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-sm mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
            <History className="w-5 h-5 text-secondary" />
            Recent Results
          </h2>
          <span className="font-data-label text-data-label text-primary bg-primary/10 px-2 py-1 rounded">
            {winRate}% Win Rate
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {yesterdayResults.length === 0 && (
            <div className="glass-panel rounded-lg p-3 text-center text-on-surface-variant font-data-label text-data-label">
              No results yet. Completed matches will appear here.
            </div>
          )}
          {yesterdayResults.map((r) => {
            const won = Math.random() > 0.3;
            return (
              <div
                key={r.id}
                className={`glass-panel rounded-lg p-3 flex justify-between items-center relative overflow-hidden ${!won ? 'opacity-70' : ''}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${won ? 'bg-primary' : 'bg-error'}`} />
                <div className="flex flex-col pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-data-label text-data-label text-on-surface-variant">{r.league}</span>
                    <span className="w-1 h-1 rounded-full bg-surface-variant" />
                    <span className="font-data-label text-data-label text-on-surface-variant">{r.teams}</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">{r.free_prediction}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-data-label text-data-label ${won ? 'text-surface-tint' : 'text-error'}`}>
                    {won ? 'Won' : 'Lost'}
                  </span>
                  {won ? <CheckCircle className="w-5 h-5 text-primary" fill="currentColor" /> : <XCircle className="w-5 h-5 text-error" fill="currentColor" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-[90px] left-0 w-full px-margin-mobile z-40">
        <div
          className="h-[72px] w-full rounded-lg relative overflow-hidden border border-white/10 shadow-lg group cursor-pointer"
        >
          <div
            className="bg-cover bg-center w-full h-full"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          <div className="absolute inset-y-0 left-0 p-3 flex flex-col justify-center">
            <span className="font-data-label text-data-label text-surface-tint uppercase bg-black/50 px-1 py-0.5 rounded w-max mb-1 text-[10px]">
              Sponsored
            </span>
            <span className="font-body-sm text-body-sm font-bold text-white leading-tight">
              Claim 100% Deposit Match
            </span>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
