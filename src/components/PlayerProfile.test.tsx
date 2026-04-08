import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerProfile } from './PlayerProfile';
import type { Player } from '../types/api';

const mockPlayer: Player = {
  player_id: '123',
  nickname: 'TestPlayer',
  avatar: 'https://example.com/avatar.jpg',
  country: 'US',
};

describe('PlayerProfile', () => {
  it('renders player nickname', () => {
    render(
      <PlayerProfile player={mockPlayer} onBack={() => {}}>
        <div>Child content</div>
      </PlayerProfile>
    );

    expect(screen.getByText('TestPlayer')).toBeInTheDocument();
  });

  it('renders player country flag', () => {
    render(
      <PlayerProfile player={mockPlayer} onBack={() => {}}>
        <div>Child content</div>
      </PlayerProfile>
    );

    // Flag is rendered as SVG with title attribute
    expect(screen.getByTitle('US')).toBeInTheDocument();
  });

  it('renders player avatar', () => {
    render(
      <PlayerProfile player={mockPlayer} onBack={() => {}}>
        <div>Child content</div>
      </PlayerProfile>
    );

    const avatar = screen.getByRole('img', { name: 'TestPlayer' });
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('does not render avatar when not provided', () => {
    const playerWithoutAvatar = { ...mockPlayer, avatar: '' };

    render(
      <PlayerProfile player={playerWithoutAvatar} onBack={() => {}}>
        <div>Child content</div>
      </PlayerProfile>
    );

    expect(screen.queryByRole('img', { name: 'TestPlayer' })).not.toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <PlayerProfile player={mockPlayer} onBack={() => {}}>
        <div>Child content</div>
      </PlayerProfile>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const handleBack = vi.fn();
    const user = userEvent.setup();

    render(
      <PlayerProfile player={mockPlayer} onBack={handleBack}>
        <div>Child content</div>
      </PlayerProfile>
    );

    // Back button now just says "Back" (with icon on larger screens)
    await user.click(screen.getByRole('button', { name: /Back/i }));

    expect(handleBack).toHaveBeenCalled();
  });
});
