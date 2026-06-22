import { useEffect, useState } from 'react';
import { BarChart3, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { getCompletedFixtures, ApiFixture } from '../services/apiFootball';
import { supabase } from '../lib/supabase';

interface MatchResult {
  league: string;
  teams: string;
  homeScore: number;
  awayScore: number;
  prediction?: string;
  won: boolean;
}

function normalizeName(name: string): string {
  const map: Record<string, string> = {
    'manchester city': 'manchester city',
    'manchester utd': 'manchester united',
    'man utd': 'manchester united',
    'bayern munich': 'bayern münih',
    'bayern münih': 'bayern münih',
    'fenerbahce': 'fenerbahçe',
  };
  return map[name.toLowerCase().trim()] || name.toLowerCase().trim();
}

export default function ResultsScreen() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [completedApi, supabaseData] = await Promise.all([
          getCompletedFixtures(),
          supabase.from('matches').select('*').eq('status', 'completed'),
        ]);

        const predictions = (supabaseData.data || []) as Array<{
          teams: string;
          home_team?: string;
          away_team?: string;
          free_prediction: string;
        }>;

        const mapped: MatchResult[] = completedApi.map((f: ApiFixture) => {
          const home = normalizeName(f.teams.home.name);
          const away = normalizeName(f.teams.away.name);
          const pred = predictions.find((p) => {
            const pHome = normalizeName(p.home_team || p.teams.split(' - ')[0] || '');
            const pAway = normalizeName(p.away_team || p.teams.split(' - ')[1] || '');
            return pHome === home && pAway === away;
          });

          const homeScore = f.goals.home ?? 0;
          const awayScore = f.goals.away ?? 0;
          const won = pred ? homeScore > awayScore : false;

          return {
            league: f.league.name,
            teams: `${f.teams.home.name} - ${f.teams.away.name}`,
            homeScore,
            awayScore,
            prediction: pred?.free_prediction,
            won,
          };
        });

        setResults(mapped);
      } catch (e) {
        console.error('Sonuc alinamadi:', e);
      }
      setLoading(false);
    };

    fetchResults();
  }, []);

  const total = results.length;
  const wins = results.filter((r) => r.won).length;
  const losses = total - wins;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const stats = [
    { label: 'Total Predictions', value: String(total), icon: BarChart3 },
    { label: 'Win Rate', value: `${winRate}%`, icon: Trophy },
    { label: 'Wins', value: String(wins), icon: TrendingUp, color: 'text-primary' },
    { label: 'Losses', value: String(losses), icon: TrendingDown, color: 'text-error' },
  ];

  if (loading) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile py-lg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile py-lg overflow-y-auto">
      <h2 className="font-title-md text-title-md text-on-surface mb-sm flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-secondary" />
        Results Overview
      </h2>

      <div className="grid grid-cols-2 gap-2 mb-lg">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-panel rounded-xl p-3 flex flex-col items-center gap-1">
              <Icon className={`w-5 h-5 ${s.color || 'text-secondary'}`} />
              <span className="font-data-label text-data-label text-on-surface-variant">{s.label}</span>
              <span className={`font-headline-lg-mobile text-headline-lg-mobile font-black ${s.color || 'text-on-surface'}`}>
                {s.value}
              </span>
            </div>
          );
        })}
      </div>

      <h3 className="font-title-md text-title-md text-on-surface mb-sm">Completed Matches</h3>
      <div className="flex flex-col gap-2 pb-lg">
        {results.length === 0 && (
          <div className="glass-panel rounded-lg p-3 text-center text-on-surface-variant font-data-label text-data-label">
            No completed matches today. Check back later.
          </div>
        )}
        {results.map((r, i) => (
          <div key={i} className="glass-panel rounded-lg p-3 flex justify-between items-center relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${r.won ? 'bg-primary' : 'bg-error'}`} />
            <div className="flex flex-col pl-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-data-label text-data-label text-on-surface-variant">{r.league}</span>
                <span className="w-1 h-1 rounded-full bg-surface-variant" />
                <span className="font-data-label text-data-label text-on-surface-variant truncate">{r.teams}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                  {r.homeScore} - {r.awayScore}
                </span>
                {r.prediction && (
                  <span className="font-data-label text-data-label text-surface-variant ml-2">
                    | {r.prediction}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className={`font-data-label text-data-label ${r.won ? 'text-primary' : 'text-error'}`}>
                {r.won ? 'Won' : 'Lost'}
              </span>
              {r.won ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-error" />}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
