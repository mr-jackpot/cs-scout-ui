import type {
  Player,
  PlayerSearchResponse,
  PlayerSeasonsResponse,
  PlayerStats,
  PlayerMatchResult,
  PlayerMatchHistoryResponse,
} from '../types/api';
import { config } from '../config';

const API_BASE = config.apiUrl;

const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(config.apiKey && { 'X-API-Key': config.apiKey }),
    },
  });
};

export async function getPlayer(playerId: string): Promise<Player> {
  const response = await apiFetch(`${API_BASE}/players/${playerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch player');
  }
  return response.json();
}

export async function searchPlayers(nickname: string): Promise<PlayerSearchResponse> {
  const response = await apiFetch(
    `${API_BASE}/players/search?nickname=${encodeURIComponent(nickname)}`
  );
  if (!response.ok) {
    throw new Error('Failed to search players');
  }
  return response.json();
}

export async function getPlayerSeasons(playerId: string): Promise<PlayerSeasonsResponse> {
  const response = await apiFetch(`${API_BASE}/players/${playerId}/esea`);
  if (!response.ok) {
    throw new Error('Failed to fetch player seasons');
  }
  return response.json();
}

export async function getPlayerStats(
  playerId: string,
  competitionId: string
): Promise<PlayerStats> {
  const response = await apiFetch(
    `${API_BASE}/players/${playerId}/competitions/${competitionId}/stats`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch player stats');
  }
  return response.json();
}

export async function getPlayerMatches(
  playerId: string,
  competitionId: string
): Promise<PlayerMatchResult[]> {
  const response = await apiFetch(
    `${API_BASE}/players/${playerId}/competitions/${competitionId}/matches`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch player matches');
  }
  const data: PlayerMatchHistoryResponse = await response.json();
  return data.matches;
}
