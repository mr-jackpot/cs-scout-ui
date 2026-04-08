import { describe, it, expect } from 'vitest';
import { calculateCareerStats } from './statAverages';
import type { PlayerStats } from '../types/api';

const makeStats = (overrides: Partial<PlayerStats> = {}): PlayerStats => ({
  player_id: '123',
  competition_id: 'comp-1',
  competition_name: 'ESEA S55',
  matches_played: 10,
  wins: 7,
  losses: 3,
  win_rate: 70,
  kills: 150,
  deaths: 100,
  assists: 50,
  kd_ratio: 1.5,
  adr: 85.0,
  headshot_pct: 48.0,
  mvps: 15,
  multi_kills: { triples: 5, quads: 2, aces: 1 },
  ...overrides,
});

describe('calculateCareerStats', () => {
  it('returns null for an empty array', () => {
    expect(calculateCareerStats([])).toBeNull();
  });

  it('returns null when all seasons have 0 matches', () => {
    expect(calculateCareerStats([makeStats({ matches_played: 0 })])).toBeNull();
  });

  it('returns null when total deaths is 0 (avoids Infinity/NaN)', () => {
    expect(calculateCareerStats([makeStats({ deaths: 0 })])).toBeNull();
  });

  it('returns correct stats for a single season', () => {
    const result = calculateCareerStats([makeStats()]);
    expect(result).not.toBeNull();
    expect(result!.kd_ratio).toBe(1.5); // 150 / 100 = 1.5
    expect(result!.adr).toBe(85.0);
    expect(result!.total_matches).toBe(10);
  });

  it('computes KD from raw kills/deaths totals across seasons', () => {
    // 150+80 = 230 kills, 100+60 = 160 deaths → 1.4375 → 1.44
    const result = calculateCareerStats([
      makeStats({ kills: 150, deaths: 100, matches_played: 10 }),
      makeStats({ competition_id: 'comp-2', kills: 80, deaths: 60, matches_played: 8 }),
    ]);
    expect(result!.kd_ratio).toBe(1.44);
  });

  it('computes ADR as a weighted average by matches_played', () => {
    // (85×10 + 70×8) / 18 = 1410/18 = 78.33… → 78.3
    const result = calculateCareerStats([
      makeStats({ adr: 85, matches_played: 10 }),
      makeStats({ competition_id: 'comp-2', adr: 70, matches_played: 8 }),
    ]);
    expect(result!.adr).toBe(78.3);
  });

  it('excludes 0-match seasons from aggregation', () => {
    const result = calculateCareerStats([
      makeStats({ kills: 150, deaths: 100, matches_played: 10 }),
      makeStats({ competition_id: 'comp-2', kills: 0, deaths: 0, matches_played: 0 }),
    ]);
    expect(result!.kd_ratio).toBe(1.5);
    expect(result!.total_matches).toBe(10);
  });

  it('treats adr=0 as missing and excludes from ADR weighted average', () => {
    // Only comp-2 (adr=80) should contribute → ADR = 80.0
    const result = calculateCareerStats([
      makeStats({ adr: 0, matches_played: 10 }),
      makeStats({ competition_id: 'comp-2', adr: 80, matches_played: 8 }),
    ]);
    expect(result!.adr).toBe(80.0);
  });

  it('returns adr=0 when all seasons have adr=0 (old CS:GO data)', () => {
    const result = calculateCareerStats([
      makeStats({ adr: 0, matches_played: 10 }),
      makeStats({ competition_id: 'comp-2', adr: 0, matches_played: 8 }),
    ]);
    expect(result!.adr).toBe(0);
  });

  it('computes correct total_matches across seasons', () => {
    const result = calculateCareerStats([
      makeStats({ matches_played: 10 }),
      makeStats({ competition_id: 'comp-2', matches_played: 8 }),
    ]);
    expect(result!.total_matches).toBe(18);
  });
});
