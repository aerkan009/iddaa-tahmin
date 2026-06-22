import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const SEASON = currentMonth >= 7 ? String(currentYear) : String(currentYear - 1);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openAiKey = process.env.OPENAI_API_KEY;
const apiFootballKey = process.env.VITE_API_FOOTBALL_KEY;

if (!supabaseUrl || !supabaseKey || !openAiKey) {
  console.error("Eksik API Anahtari! Lutfen .env dosyanizi kontrol edin.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openAiKey });

const PredictionSchema = z.object({
  free_prediction: z.string(),
  vip_prediction: z.object({
    alt_ust: z.string(),
    iy_ms: z.string(),
    korner: z.string(),
    kg_var: z.string(),
    ciftsans: z.string(),
    toplam_gol: z.string()
  })
});

const API_BASE = 'https://v3.football.api-sports.io';
const POPULAR_LEAGUES = [
  { id: 39, name: 'ENG PL' },
  { id: 140, name: 'SPA LL' },
  { id: 135, name: 'ITA SA' },
  { id: 78, name: 'GER BL' },
  { id: 61, name: 'FRA L1' },
  { id: 2, name: 'UCL' },
  { id: 3, name: 'UEL' },
  { id: 211, name: 'Süper Lig' },
  { id: 88, name: 'NED ERE' },
  { id: 94, name: 'POR LIG' },
  { id: 71, name: 'BRA SA' },
  { id: 144, name: 'BEL PL' },
];

interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string } };
  league: { id: number; name: string; country: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

function mapStatus(short: string): 'upcoming' | 'live' | 'completed' {
  if (short === 'NS' || short === 'TBD') return 'upcoming';
  if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(short)) return 'live';
  return 'completed';
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
    'bayern munich': 'bayern munih',
    'bayern münih': 'bayern munih',
    'inter': 'inter',
    'juventus': 'juventus',
    'psg': 'psg',
    'galatasaray': 'galatasaray',
    'fenerbahçe': 'fenerbahce',
    'fenerbahce': 'fenerbahce',
  };
  return map[name.toLowerCase().trim()] || name.toLowerCase().trim();
}

async function fetchFromApi(endpoint: string, params: Record<string, string> = {}): Promise<ApiFixture[]> {
  if (!apiFootballKey) return [];
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key': apiFootballKey,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.response || [];
}

async function syncFixtures() {
  console.log("1. API-Football'dan bugunun maclari cekiliyor...\n");
  const today = new Date().toISOString().split('T')[0];
  const apiMaclari: ApiFixture[] = [];

  for (const league of POPULAR_LEAGUES) {
    try {
      const fixtures = await fetchFromApi('/fixtures', {
        date: today,
        league: String(league.id),
        season: SEASON,
      });
      apiMaclari.push(...fixtures);
    } catch {
      console.warn(`  ${league.name} alinamadi`);
    }
  }
  console.log(`  ${apiMaclari.length} mac bulundu.\n`);

  const { data: existingData } = await supabase
    .from('matches')
    .select('id, home_team, away_team, teams, status, home_score, away_score');

  const existing = (existingData || []) as Array<{
    id: number; home_team?: string; away_team?: string;
    teams: string; status: string; home_score?: number | null; away_score?: number | null;
  }>;

  let yeniSayisi = 0;
  let guncellemeSayisi = 0;

  for (const apiMac of apiMaclari) {
    const apiHome = normalizeName(apiMac.teams.home.name);
    const apiAway = normalizeName(apiMac.teams.away.name);
    const apiStatus = mapStatus(apiMac.fixture.status.short);
    const apiHomeScore = apiMac.goals.home;
    const apiAwayScore = apiMac.goals.away;

    const matchTime = new Date(apiMac.fixture.date).toLocaleTimeString('tr-TR', {
      hour: '2-digit', minute: '2-digit',
    });
    const teams = `${apiMac.teams.home.name} - ${apiMac.teams.away.name}`;

    const eslesen = existing.find((e) => {
      const eHome = normalizeName(e.home_team || e.teams.split(' - ')[0] || '');
      const eAway = normalizeName(e.away_team || e.teams.split(' - ')[1] || '');
      return eHome === apiHome && eAway === apiAway;
    });

    if (eslesen) {
      const updates: Record<string, unknown> = {};
      if (eslesen.status !== apiStatus) updates.status = apiStatus;
      if (apiHomeScore !== null && (eslesen.home_score !== apiHomeScore || eslesen.away_score !== apiAwayScore)) {
        updates.home_score = apiHomeScore;
        updates.away_score = apiAwayScore;
      }
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('matches').update(updates).eq('id', eslesen.id);
        if (!error) {
          guncellemeSayisi++;
          console.log(`  Guncellendi: ${teams} -> ${apiStatus}${apiHomeScore !== null ? ` (${apiHomeScore}-${apiAwayScore})` : ''}`);
        }
      }
    } else {
      yeniSayisi++;
      console.log(`  Yeni mac: ${teams} (${matchTime})`);

      let prediction: { free_prediction: string; vip_prediction: { alt_ust: string; iy_ms: string; korner: string } } | null = null;

      if (openAiKey) {
        try {
          const prompt = `
            Sen profesyonel bir futbol analistisin. Su mac icin tahmin uret: ${teams} (${apiMac.league.name})
            Lutfen SADECE asagidaki JSON formatinda, ekstra hicbir yorum olmadan yanit ver:
            {
            "free_prediction": "Mac Sonucu: 1 (veya 0, 2)",
            "vip_prediction": {
              "alt_ust": "2.5 Ust vb.",
              "iy_ms": "1/1 vb.",
              "korner": "9.5 Alt vb.",
              "kg_var": "KG VAR",
              "ciftsans": "1X",
              "toplam_gol": "2-3 Gol"
            }
            }
          `;
          const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
          });
          const content = JSON.parse(completion.choices[0].message.content || "{}");
          prediction = PredictionSchema.parse(content);
        } catch (e) {
          console.warn(`  OpenAI tahmini basarisiz: ${teams}`, e);
        }
      }

      const { error } = await supabase.from('matches').insert({
        match_time: matchTime,
        teams: teams,
        home_team: apiMac.teams.home.name,
        away_team: apiMac.teams.away.name,
        home_logo: apiMac.teams.home.logo,
        away_logo: apiMac.teams.away.logo,
        league: apiMac.league.name,
        status: apiStatus,
        home_score: apiHomeScore,
        away_score: apiAwayScore,
        free_prediction: prediction?.free_prediction || null,
        vip_prediction: prediction?.vip_prediction || null,
      });

      if (error) {
        console.error(`  Kayit hatasi: ${teams}`, error);
      } else {
        console.log(`  Kaydedildi: ${teams}${prediction ? ' (tahminli)' : ''}`);
      }
    }
  }

  console.log(`\n  Ozet: ${yeniSayisi} yeni, ${guncellemeSayisi} guncellendi.\n`);
}

async function main() {
  console.log("========================================");
  console.log("  FUTBOL TAHMIN ROBOTU v2");
  console.log(`  Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
  console.log(`  Saat: ${new Date().toLocaleTimeString('tr-TR')}`);
  console.log("========================================\n");

  await syncFixtures();

  console.log("========================================");
  console.log("  OPERASYON TAMAMLANDI");
  console.log("  Uygulamayi acip guncel verileri gorebilirsin.");
  console.log("========================================");
}

main().catch(console.error);
