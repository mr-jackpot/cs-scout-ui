import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerStatsCard } from './PlayerStatsCard';
import type { PlayerStats } from '../types/api';

const mockStats: PlayerStats = {
  player_id: '123',
  competition_id: 'comp-1',
  competition_name: 'ESEA S55 EU Open',
  matches_played: 10,
  wins: 7,
  losses: 3,
  win_rate: 70,
  kills: 150,
  deaths: 100,
  assists: 50,
  kd_ratio: 1.5,
  adr: 85.5,
  headshot_pct: 48.2,
  mvps: 15,
  multi_kills: {
    doubles: 20,
    triples: 5,
    quads: 2,
    aces: 1,
  },
};

const mockStatsWithExtended: PlayerStats = {
  ...mockStats,
  kr_ratio: 0.8,
  damage: 8550,
  headshots: 72,
  first_kills: 18,
  entry_count: 25,
  entry_wins: 15,
  entry_success_rate: 60,
  clutch_kills: 12,
  one_v_one_wins: 8,
  one_v_two_wins: 2,
  sniper_kills: 30,
  utility_damage: 1200,
  flash_successes: 40,
  maps: {
    de_mirage: {
      map: 'de_mirage',
      matches_played: 4,
      wins: 3,
      win_rate: 75,
      kills: 60,
      deaths: 38,
      assists: 18,
      kd_ratio: 1.58,
      adr: 88.2,
      headshot_pct: 52.0,
    },
  },
};

describe('PlayerStatsCard', () => {
  it('renders competition name', () => {
    render(<PlayerStatsCard stats={mockStats} />);
    expect(screen.getByText('ESEA S55 EU Open')).toBeInTheDocument();
  });

  it('renders key stats', () => {
    render(<PlayerStatsCard stats={mockStats} />);

    expect(screen.getByText('1.50')).toBeInTheDocument(); // K/D ratio
    expect(screen.getByText('85.5')).toBeInTheDocument(); // ADR
    expect(screen.getByText('70%')).toBeInTheDocument(); // Win rate
    expect(screen.getByText('48.2%')).toBeInTheDocument(); // HS %
  });

  it('renders match statistics', () => {
    render(<PlayerStatsCard stats={mockStats} />);

    expect(screen.getByText('10 matches played')).toBeInTheDocument();
    expect(screen.getByText('7W')).toBeInTheDocument();
    expect(screen.getByText('3L')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // MVPs
  });

  it('renders kill/death/assist stats', () => {
    render(<PlayerStatsCard stats={mockStats} />);

    expect(screen.getByText('150')).toBeInTheDocument(); // Kills
    expect(screen.getByText('100')).toBeInTheDocument(); // Deaths
    expect(screen.getByText('50')).toBeInTheDocument(); // Assists
  });

  it('renders multi-kill stats including doubles', () => {
    render(<PlayerStatsCard stats={mockStats} />);

    expect(screen.getByText('20')).toBeInTheDocument(); // Doubles
    expect(screen.getByText('5')).toBeInTheDocument();  // Triples
    expect(screen.getByText('2')).toBeInTheDocument();  // Quads
    expect(screen.getByText('1')).toBeInTheDocument();  // Aces
    expect(screen.getByText('2K')).toBeInTheDocument();
    expect(screen.getByText('3K')).toBeInTheDocument();
    expect(screen.getByText('4K')).toBeInTheDocument();
    expect(screen.getByText('ACE')).toBeInTheDocument();
  });

  it('does not render advanced stats section when all values are zero/absent', () => {
    render(<PlayerStatsCard stats={mockStats} />);
    expect(screen.queryByText('Advanced Stats')).not.toBeInTheDocument();
  });

  it('renders advanced stats accordion when extended fields are present', () => {
    render(<PlayerStatsCard stats={mockStatsWithExtended} />);
    expect(screen.getByText('Advanced Stats')).toBeInTheDocument();
    expect(screen.getByText('Damage')).toBeInTheDocument();
    expect(screen.getByText('First Kills')).toBeInTheDocument();
  });

  it('renders entry & clutch accordion when entry data is present', () => {
    render(<PlayerStatsCard stats={mockStatsWithExtended} />);
    expect(screen.getByText('Entry & Clutch')).toBeInTheDocument();
  });

  it('renders per-map breakdown accordion when maps are present', () => {
    render(<PlayerStatsCard stats={mockStatsWithExtended} />);
    expect(screen.getByText('Per-Map Breakdown')).toBeInTheDocument();
    expect(screen.getByText('mirage')).toBeInTheDocument(); // de_ prefix stripped
  });

  it('always renders weapons & utility accordion', () => {
    render(<PlayerStatsCard stats={mockStats} />);
    expect(screen.getByText('Weapons & Utility')).toBeInTheDocument();
  });
});
