import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CareerOverviewCard } from './CareerOverviewCard';
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

describe('CareerOverviewCard', () => {
  it('renders nothing when stats array is empty', () => {
    const { container } = render(<CareerOverviewCard stats={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a loading spinner when isLoading is true', () => {
    const { container } = render(<CareerOverviewCard stats={[]} isLoading />);
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Great')).not.toBeInTheDocument();
  });

  it('renders stats once loaded (isLoading false)', () => {
    render(<CareerOverviewCard stats={[makeStats()]} isLoading={false} />);
    expect(screen.getByText('1.35')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('renders nothing when all seasons have 0 matches', () => {
    const { container } = render(
      <CareerOverviewCard stats={[makeStats({ matches_played: 0 })]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the match count for a single season', () => {
    render(<CareerOverviewCard stats={[makeStats({ matches_played: 10 })]} />);
    expect(screen.getByText('10 matches')).toBeInTheDocument();
  });

  it('renders combined total match count across seasons', () => {
    render(
      <CareerOverviewCard
        stats={[
          makeStats({ matches_played: 10 }),
          makeStats({ competition_id: 'comp-2', matches_played: 8 }),
        ]}
      />
    );
    expect(screen.getByText('18 matches')).toBeInTheDocument();
  });

  it('renders aggregated KD from raw kills/deaths totals', () => {
    // 150+80=230 kills, 100+60=160 deaths → 1.44
    render(
      <CareerOverviewCard
        stats={[
          makeStats({ kills: 150, deaths: 100, matches_played: 10 }),
          makeStats({ competition_id: 'comp-2', kills: 80, deaths: 60, matches_played: 8 }),
        ]}
      />
    );
    expect(screen.getByText('1.44')).toBeInTheDocument();
  });

  it('renders weighted ADR', () => {
    // (85×10 + 70×8) / 18 = 78.3
    render(
      <CareerOverviewCard
        stats={[
          makeStats({ adr: 85, matches_played: 10 }),
          makeStats({ competition_id: 'comp-2', adr: 70, matches_played: 8 }),
        ]}
      />
    );
    expect(screen.getByText('78.3')).toBeInTheDocument();
  });

  it('shows — for ADR when all seasons have adr=0', () => {
    render(<CareerOverviewCard stats={[makeStats({ adr: 0 })]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('excludes adr=0 seasons from ADR weighted average', () => {
    // Only comp-2 (adr=80) contributes → ADR = 80.0
    render(
      <CareerOverviewCard
        stats={[
          makeStats({ adr: 0, matches_played: 10 }),
          makeStats({ competition_id: 'comp-2', adr: 80, matches_played: 8 }),
        ]}
      />
    );
    expect(screen.getByText('80.0')).toBeInTheDocument();
  });

  it('renders the rating value', () => {
    // kd=1.5, adr=85 → rating = 1.5×0.6 + (85/75)×0.4 = 0.9 + 0.453 ≈ 1.35
    render(<CareerOverviewCard stats={[makeStats()]} />);
    expect(screen.getByText('1.35')).toBeInTheDocument();
  });

  it('renders a rating tier label', () => {
    // rating 1.35 >= 1.15 → Great
    render(<CareerOverviewCard stats={[makeStats()]} />);
    expect(screen.getByText('Great')).toBeInTheDocument();
  });

  it('shows warning banner when failedSeasonCount > 0 and career stats exist', () => {
    render(<CareerOverviewCard stats={[makeStats()]} failedSeasonCount={2} />);
    expect(screen.getByText('Stats may be incomplete — 2 seasons failed to load')).toBeInTheDocument();
  });

  it('shows singular "season" in warning when failedSeasonCount is 1', () => {
    render(<CareerOverviewCard stats={[makeStats()]} failedSeasonCount={1} />);
    expect(screen.getByText('Stats may be incomplete — 1 season failed to load')).toBeInTheDocument();
  });

  it('does not show warning when failedSeasonCount is 0', () => {
    render(<CareerOverviewCard stats={[makeStats()]} failedSeasonCount={0} />);
    expect(screen.queryByText(/Stats may be incomplete/)).not.toBeInTheDocument();
  });

  it('shows fallback warning card when all seasons failed (no career stats)', () => {
    render(<CareerOverviewCard stats={[]} failedSeasonCount={3} />);
    expect(screen.getByText('Stats may be incomplete — 3 seasons failed to load')).toBeInTheDocument();
  });

  it('renders nothing when no stats and no failures', () => {
    const { container } = render(<CareerOverviewCard stats={[]} failedSeasonCount={0} />);
    expect(container.firstChild).toBeNull();
  });
});
