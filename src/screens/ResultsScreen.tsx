import { useEffect, useState } from 'react';
import { BarChart3, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MatchResult {
  id: number;
  league: string;
  teams: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  prediction?: string;
}

export default function ResultsScreen() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await supabase
          .from('matches')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(30);

        const mapped: MatchResult[] = (data || []).map((m: Record<string, unknown>) => ({
          id: m.id as number,
          league: (m.league as string) || '',
          teams: (m.teams as string) || '',
          homeLogo: m.home_logo as string | undefined,
          awayLogo: m.away_logo as string | undefined,
          homeScore: m.home_score as number | null,
          awayScore: m.away_score as number | null,
          prediction: m.free_prediction as string | undefined,
        }));

        setResults(mapped);
      } catch (e) {
        console.error('Sonuc alinamadi:', e);
      }
      setLoading(false);
    };

    fetchResults();
  }, []);

  const total = results.length;
  const wins = results.filter((r) => r.homeScore !== null).length;
  const losses = total - wins;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const stats = [
    { label: 'Toplam Maç', value: String(total), icon: BarChart3 },
    { label: 'Başarı Oranı', value: `${winRate}%`, icon: Trophy },
    { label: 'Kazanç', value: String(wins), icon: TrendingUp, color: 'text-primary' },
    { label: 'Kayıp', value: String(losses), icon: TrendingDown, color: 'text-error' },
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
        SONUÇLAR
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

      <h3 className="font-title-md text-title-md text-on-surface mb-sm">Oynanan Maçlar</h3>
      <div className="flex flex-col gap-2 pb-lg">
        {results.length === 0 && (
          <div className="glass-panel rounded-lg p-3 text-center text-on-surface-variant font-data-label text-data-label">
            Henüz oynanan maç yok. Canlı maçlar bittiğinde burada görünecek.
          </div>
        )}
        {results.map((r) => (
          <div key={r.id} className="glass-panel rounded-lg p-3 flex justify-between items-center relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${r.homeScore !== null ? 'bg-primary' : 'bg-error'}`} />
            <div className="flex items-center gap-2 pl-2 flex-1 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                {r.homeLogo && <img className="w-6 h-6 object-contain" src={r.homeLogo} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                {r.awayLogo && <img className="w-6 h-6 object-contain" src={r.awayLogo} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {r.league && <span className="font-data-label text-data-label text-on-surface-variant">{r.league}</span>}
                  {r.league && <span className="w-1 h-1 rounded-full bg-surface-variant" />}
                  <span className="font-data-label text-data-label text-on-surface-variant truncate">{r.teams}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                    {r.homeScore ?? '?'} - {r.awayScore ?? '?'}
                  </span>
                  {r.prediction && (
                    <span className="font-data-label text-data-label text-surface-variant ml-2">
                      | {r.prediction}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className={`font-data-label text-data-label ${r.homeScore !== null ? 'text-primary' : 'text-error'}`}>
                {r.homeScore !== null ? 'Kazandı' : 'Kaybetti'}
              </span>
              {r.homeScore !== null ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-error" />}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
