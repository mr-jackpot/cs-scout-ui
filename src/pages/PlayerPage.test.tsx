import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlayerPage } from './PlayerPage';
import * as api from '../services/api';
import type { PlayerStats } from '../types/api';

vi.mock('../services/api');

const mockGetPlayer = vi.mocked(api.getPlayer);
const mockSearchPlayers = vi.mocked(api.searchPlayers);
const mockGetPlayerSeasons = vi.mocked(api.getPlayerSeasons);
const mockGetPlayerStats = vi.mocked(api.getPlayerStats);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (nickname: string) => {
  return render(
    <MemoryRouter initialEntries={[`/player/${nickname}`]}>
      <Routes>
        <Route path="/player/:nickname" element={<PlayerPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PlayerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('fetches and displays player data', async () => {
    mockSearchPlayers.mockResolvedValueOnce({
      items: [
        {
          player_id: '123',
          nickname: 'TestPlayer',
          avatar: 'https://example.com/avatar.jpg',
          country: 'US',
        },
      ],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123',
      nickname: 'TestPlayer',
      avatar: 'https://example.com/avatar.jpg',
      country: 'US',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [
        {
          competition_id: 'comp-1',
          competition_name: 'ESEA S55',
          match_count: 10,
        },
      ],
    });

    renderWithRouter('TestPlayer');

    await waitFor(() => {
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('ESEA S55')).toBeInTheDocument();
    });

    expect(mockSearchPlayers).toHaveBeenCalledWith('TestPlayer');
    expect(mockGetPlayerSeasons).toHaveBeenCalledWith('123');
  });

  it('uses cached player data from sessionStorage', async () => {
    sessionStorage.setItem(
      'player-CachedPlayer',
      JSON.stringify({
        player_id: '123',
        nickname: 'CachedPlayer',
        avatar: 'https://example.com/avatar.jpg',
        country: 'GB',
      })
    );

    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123',
      nickname: 'CachedPlayer',
      avatar: 'https://example.com/avatar.jpg',
      country: 'GB',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [],
    });

    renderWithRouter('CachedPlayer');

    await waitFor(() => {
      expect(screen.getByText('CachedPlayer')).toBeInTheDocument();
    });

    expect(mockSearchPlayers).not.toHaveBeenCalled();
  });

  it('shows error on seasons fetch failure', async () => {
    mockSearchPlayers.mockResolvedValueOnce({
      items: [
        {
          player_id: '123',
          nickname: 'TestPlayer',
          avatar: 'https://example.com/avatar.jpg',
          country: 'US',
        },
      ],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123',
      nickname: 'TestPlayer',
      avatar: 'https://example.com/avatar.jpg',
      country: 'US',
    });
    mockGetPlayerSeasons.mockRejectedValueOnce(new Error('API error'));

    renderWithRouter('TestPlayer');

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch player seasons')).toBeInTheDocument();
    });
  });

  it('fetches stats when season is selected', async () => {
    mockSearchPlayers.mockResolvedValueOnce({
      items: [
        {
          player_id: '123',
          nickname: 'TestPlayer',
          avatar: 'https://example.com/avatar.jpg',
          country: 'US',
        },
      ],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123',
      nickname: 'TestPlayer',
      avatar: 'https://example.com/avatar.jpg',
      country: 'US',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [
        {
          competition_id: 'comp-1',
          competition_name: 'ESEA S55',
          match_count: 10,
        },
      ],
    });
    mockGetPlayerStats.mockResolvedValueOnce({
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
      adr: 85.5,
      headshot_pct: 48,
      mvps: 15,
      multi_kills: { triples: 5, quads: 2, aces: 1 },
    });

    const user = userEvent.setup();
    renderWithRouter('TestPlayer');

    await waitFor(() => {
      expect(screen.getByText('ESEA S55')).toBeInTheDocument();
    });

    // Button now says "View" instead of "View Stats"
    await user.click(screen.getByRole('button', { name: /View/i }));

    await waitFor(() => {
      // K/D ratio appears in both career overview card and the stats modal
      expect(screen.getAllByText('1.50').length).toBeGreaterThan(0);
    });

    expect(mockGetPlayerStats).toHaveBeenCalledWith('123', 'comp-1');
  });

  it('navigates back when back button is clicked', async () => {
    mockSearchPlayers.mockResolvedValueOnce({
      items: [
        {
          player_id: '123',
          nickname: 'TestPlayer',
          avatar: 'https://example.com/avatar.jpg',
          country: 'US',
        },
      ],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123',
      nickname: 'TestPlayer',
      avatar: 'https://example.com/avatar.jpg',
      country: 'US',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [],
    });

    const user = userEvent.setup();
    renderWithRouter('TestPlayer');

    await waitFor(() => {
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    // Back button now just says "Back"
    await user.click(screen.getByRole('button', { name: /Back/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  const mockStatsPayload: PlayerStats = {
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
    headshot_pct: 48,
    mvps: 15,
    multi_kills: { triples: 5, quads: 2, aces: 1 },
  };

  it('shows career overview after all season stats load', async () => {
    mockSearchPlayers.mockResolvedValueOnce({
      items: [{ player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US' }],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [{ competition_id: 'comp-1', competition_name: 'ESEA S55', match_count: 10 }],
    });
    mockGetPlayerStats.mockResolvedValueOnce(mockStatsPayload);

    renderWithRouter('TestPlayer');

    // Career rating value appears once stats are loaded
    await waitFor(() => {
      expect(screen.getAllByText('1.35').length).toBeGreaterThan(0);
    });
  });

  it('does not show career overview while season stats are still loading', async () => {
    mockSearchPlayers.mockResolvedValueOnce({
      items: [{ player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US' }],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [{ competition_id: 'comp-1', competition_name: 'ESEA S55', match_count: 10 }],
    });

    let resolveStats!: (value: PlayerStats) => void;
    mockGetPlayerStats.mockReturnValueOnce(
      new Promise<PlayerStats>(resolve => { resolveStats = resolve; })
    );

    renderWithRouter('TestPlayer');

    await waitFor(() => {
      expect(screen.getByText('ESEA S55')).toBeInTheDocument();
    });

    // Spinner is visible, stat values are not
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('1.35')).not.toBeInTheDocument();

    // Resolve so the test cleans up properly
    resolveStats(mockStatsPayload);
  });

  it('shows career overview even when some season stats fail to load', async () => {
    mockSearchPlayers.mockResolvedValueOnce({
      items: [{ player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US' }],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [
        { competition_id: 'comp-1', competition_name: 'ESEA S55', match_count: 10 },
        { competition_id: 'comp-2', competition_name: 'ESEA S54', match_count: 8 },
      ],
    });
    // comp-1 succeeds, comp-2 fails
    mockGetPlayerStats
      .mockResolvedValueOnce({ ...mockStatsPayload, competition_id: 'comp-1' })
      .mockRejectedValueOnce(new Error('API error'));

    renderWithRouter('TestPlayer');

    // Career overview appears once all seasons are resolved (success or failure)
    await waitFor(() => {
      expect(screen.getAllByText('1.35').length).toBeGreaterThan(0);
    });

    // Partial-data warning should also be shown
    await waitFor(() => {
      expect(screen.getByText(/Stats may be incomplete/)).toBeInTheDocument();
    });
  });

  it('shows error message in modal when clicking View on a failed season', async () => {
    const user = userEvent.setup();
    mockSearchPlayers.mockResolvedValueOnce({
      items: [{ player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US' }],
    });
    mockGetPlayer.mockResolvedValueOnce({
      player_id: '123', nickname: 'TestPlayer', avatar: '', country: 'US',
    });
    mockGetPlayerSeasons.mockResolvedValueOnce({
      player_id: '123',
      seasons: [{ competition_id: 'comp-1', competition_name: 'ESEA S55', match_count: 10 }],
    });
    mockGetPlayerStats.mockRejectedValueOnce(new Error('Rate limited'));

    renderWithRouter('TestPlayer');

    // Wait for the season to appear with the failed state
    await waitFor(() => {
      expect(screen.getByText('ESEA S55')).toBeInTheDocument();
    });

    // Click View on the failed season
    const viewButton = screen.getByRole('button', { name: /View/i });
    await user.click(viewButton);

    // Modal should show the error state
    await waitFor(() => {
      expect(screen.getByText('Stats failed to load')).toBeInTheDocument();
    });
  });
});
