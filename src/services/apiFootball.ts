const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

function getCurrentSeason(): string {
  const now = new Date();
  return now.getMonth() >= 7 ? String(now.getFullYear()) : String(now.getFullYear() - 1);
}

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

export function getLeagueNames(): string[] {
  return POPULAR_LEAGUES.map((l) => l.name);
}

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: { id: number; name: string; country: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

async function fetchFromApi(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
  });

  if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
  const data = await res.json();
  return data.response as ApiFixture[];
}

export async function getTodaysFixtures(): Promise<ApiFixture[]> {
  const today = new Date().toISOString().split('T')[0];
  const all: ApiFixture[] = [];

  for (const league of POPULAR_LEAGUES) {
    try {
      const fixtures = await fetchFromApi('/fixtures', {
        date: today,
        league: String(league.id),
        season: getCurrentSeason(),
      });
      all.push(...fixtures);
    } catch (e) {
      console.warn(`Failed to fetch ${league.name}:`, e);
    }
  }

  return all;
}

export async function getLiveFixtures(): Promise<ApiFixture[]> {
  try {
    return await fetchFromApi('/fixtures', { live: 'all' });
  } catch (e) {
    console.warn('Failed to fetch live fixtures:', e);
    return [];
  }
}

export async function getFixtureById(fixtureId: number): Promise<ApiFixture | null> {
  try {
    const fixtures = await fetchFromApi('/fixtures', { id: String(fixtureId) });
    return fixtures[0] || null;
  } catch {
    return null;
  }
}

export function mapStatus(short: string): 'upcoming' | 'live' | 'completed' {
  if (short === 'NS' || short === 'TBD') return 'upcoming';
  if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(short)) return 'live';
  return 'completed';
}

export async function getCompletedFixtures(): Promise<ApiFixture[]> {
  const today = new Date().toISOString().split('T')[0];
  const all: ApiFixture[] = [];

  for (const league of POPULAR_LEAGUES) {
    try {
      const fixtures = await fetchFromApi('/fixtures', {
        date: today,
        league: String(league.id),
        season: getCurrentSeason(),
        status: 'FT',
      });
      all.push(...fixtures);
    } catch {
      // league has no completed fixtures today
    }
  }

  return all;
}

export function formatMatchTime(fixture: ApiFixture): string {
  const status = fixture.fixture.status.short;
  if (status === 'NS') return new Date(fixture.fixture.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (['1H', '2H', 'HT'].includes(status)) return `${fixture.fixture.status.short === 'HT' ? 'HT' : fixture.fixture.status.short}`;
  if (status === 'FT') return 'FT';
  return status;
}
