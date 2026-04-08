import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import * as api from '../services/api';

vi.mock('../services/api');

const mockSearchPlayers = vi.mocked(api.searchPlayers);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search form', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Search for a player...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('searches for players and displays results', async () => {
    const user = userEvent.setup();
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

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText('Search for a player...'), 'TestPlayer');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    expect(mockSearchPlayers).toHaveBeenCalledWith('TestPlayer');
  });

  it('shows error message on search failure', async () => {
    const user = userEvent.setup();
    mockSearchPlayers.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText('Search for a player...'), 'test');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to search players')).toBeInTheDocument();
    });
  });

  it('navigates to player page when player is selected', async () => {
    const user = userEvent.setup();
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

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText('Search for a player...'), 'TestPlayer');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    await user.click(screen.getByText('TestPlayer'));

    expect(mockNavigate).toHaveBeenCalledWith('/player/TestPlayer');
  });
});
