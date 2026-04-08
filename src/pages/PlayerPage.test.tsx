import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlayerPage } from './PlayerPage';
import * as api from '../services/api';

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
      expect(screen.getByText('1.50')).toBeInTheDocument(); // K/D ratio
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
});
