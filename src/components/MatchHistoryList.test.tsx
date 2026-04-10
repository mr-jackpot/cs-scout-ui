import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchHistoryList } from './MatchHistoryList';
import * as api from '../services/api';
import type { PlayerMatchResult } from '../types/api';

vi.mock('../services/api');

const mockMatches: PlayerMatchResult[] = [
  {
    match_id: 'match-1',
    map: 'de_mirage',
    started_at: 1700000000,
    finished_at: 1700003600,
    result: 'win',
    score: '16 / 10',
    kills: 22,
    deaths: 14,
    assists: 5,
    kd_ratio: 1.57,
    adr: 92.3,
    headshot_pct: 54.5,
    mvps: 3,
  },
  {
    match_id: 'match-2',
    map: 'de_inferno',
    started_at: 1699990000,
    finished_at: 1699993600,
    result: 'loss',
    score: '12 / 16',
    kills: 18,
    deaths: 19,
    assists: 4,
    kd_ratio: 0.95,
    adr: 78.1,
    headshot_pct: 44.4,
    mvps: 1,
  },
];

describe('MatchHistoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the accordion title', () => {
    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);
    expect(screen.getByText('Match History')).toBeInTheDocument();
  });

  it('does not fetch until the accordion is opened', () => {
    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);
    expect(api.getPlayerMatches).not.toHaveBeenCalled();
  });

  it('fetches and renders match rows when accordion is opened', async () => {
    vi.mocked(api.getPlayerMatches).mockResolvedValue(mockMatches);
    const user = userEvent.setup();

    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('mirage')).toBeInTheDocument();
      expect(screen.getByText('inferno')).toBeInTheDocument();
    });

    expect(api.getPlayerMatches).toHaveBeenCalledWith('player-1', 'comp-1');
    expect(api.getPlayerMatches).toHaveBeenCalledTimes(1);
  });

  it('does not re-fetch on repeated open/close', async () => {
    vi.mocked(api.getPlayerMatches).mockResolvedValue(mockMatches);
    const user = userEvent.setup();

    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox); // open
    await waitFor(() => expect(screen.getByText('mirage')).toBeInTheDocument());

    await user.click(checkbox); // close
    await user.click(checkbox); // re-open

    expect(api.getPlayerMatches).toHaveBeenCalledTimes(1);
  });

  it('shows error state and retry button on fetch failure', async () => {
    vi.mocked(api.getPlayerMatches).mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByText('Failed to load match history')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries fetch when retry button is clicked', async () => {
    vi.mocked(api.getPlayerMatches)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockMatches);

    const user = userEvent.setup();

    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);

    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('mirage')).toBeInTheDocument();
    });

    expect(api.getPlayerMatches).toHaveBeenCalledTimes(2);
  });

  it('shows empty state when API returns no matches', async () => {
    vi.mocked(api.getPlayerMatches).mockResolvedValue([]);
    const user = userEvent.setup();

    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByText('No matches found')).toBeInTheDocument();
    });
  });

  it('resets state when remounted with new competitionId (via key prop)', async () => {
    vi.mocked(api.getPlayerMatches).mockResolvedValue(mockMatches);
    const user = userEvent.setup();

    // Parent passes key so remount happens on competition change
    const { rerender } = render(
      <MatchHistoryList key="player-1-comp-1" playerId="player-1" competitionId="comp-1" />
    );

    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByText('mirage')).toBeInTheDocument());

    // Simulate parent re-rendering with new key (competition changed)
    vi.mocked(api.getPlayerMatches).mockResolvedValue([]);
    rerender(
      <MatchHistoryList key="player-1-comp-2" playerId="player-1" competitionId="comp-2" />
    );

    // Fresh mount: accordion closed, no stale data visible
    expect(screen.queryByText('mirage')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('displays win/loss result indicators', async () => {
    vi.mocked(api.getPlayerMatches).mockResolvedValue(mockMatches);
    const user = userEvent.setup();

    render(<MatchHistoryList playerId="player-1" competitionId="comp-1" />);

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByText('W')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
    });
  });
});
