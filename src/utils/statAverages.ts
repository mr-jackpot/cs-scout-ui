import type { PlayerStats } from '../types/api';

// ESEA average stats for comparison
export const ESEA_AVERAGES = {
  kd_ratio: 1.0,
  kr_ratio: 0.65,
  adr: 75,
  headshot_pct: 45,
  win_rate: 50,
};

export type StatKey = keyof typeof ESEA_AVERAGES;

export function getStatColor(value: number, average: number, higherIsBetter = true): string {
  const ratio = value / average;

  if (higherIsBetter) {
    if (ratio >= 1.1) return 'var(--color-good)';
    if (ratio >= 0.9) return 'var(--color-avg)';
    return 'var(--color-poor)';
  } else {
    if (ratio <= 0.9) return 'var(--color-good)';
    if (ratio <= 1.1) return 'var(--color-avg)';
    return 'var(--color-poor)';
  }
}

export function calculateRating(kdRatio: number, adr: number): number {
  // If ADR is 0 (CS:GO didn't track ADR), use K/D ratio only
  if (adr === 0) {
    return Math.round(kdRatio * 100) / 100;
  }

  const kdComponent = kdRatio * 0.6;
  const adrComponent = (adr / 75) * 0.4;

  return Math.round((kdComponent + adrComponent) * 100) / 100;
}

export function getRatingTier(rating: number): { label: string; color: string } {
  if (rating >= 1.15) return { label: 'Great', color: 'var(--color-good)' };
  if (rating >= 0.9) return { label: 'Average', color: 'var(--color-avg)' };
  return { label: 'Below', color: 'var(--color-poor)' };
}

export interface CareerStats {
  kd_ratio: number;
  adr: number;
  rating: number;
  total_matches: number;
}

export function calculateCareerStats(stats: PlayerStats[]): CareerStats | null {
  const valid = stats.filter(s => s.matches_played > 0);
  if (valid.length === 0) return null;

  const totalKills = valid.reduce((sum, s) => sum + s.kills, 0);
  const totalDeaths = valid.reduce((sum, s) => sum + s.deaths, 0);
  if (totalDeaths === 0) return null;

  const kd_ratio = Math.round((totalKills / totalDeaths) * 100) / 100;
  const total_matches = valid.reduce((sum, s) => sum + s.matches_played, 0);

  // Only include seasons with real ADR data — treat adr=0 as missing (e.g. old CS:GO data)
  const adrSeasons = valid.filter(s => s.adr > 0);
  let aggregatedAdr = 0;
  if (adrSeasons.length > 0) {
    const adrTotal = adrSeasons.reduce((sum, s) => sum + s.adr * s.matches_played, 0);
    const adrMatchCount = adrSeasons.reduce((sum, s) => sum + s.matches_played, 0);
    aggregatedAdr = Math.round((adrTotal / adrMatchCount) * 10) / 10;
  }

  const rating = calculateRating(kd_ratio, aggregatedAdr);
  return { kd_ratio, adr: aggregatedAdr, rating, total_matches };
}
