export interface Player {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  faceit_url?: string;
  steam_id_64?: string;
  games?: {
    cs2?: {
      skill_level: number;
      faceit_elo: number;
    };
  };
}

export interface FaceitPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  cover_image: string;
  platforms: Record<string, string>;
  games: Record<string, {
    region: string;
    game_player_id: string;
    skill_level: number;
    faceit_elo: number;
    game_player_name: string;
    skill_level_label: string;
    game_profile_id: string;
  }>;
  settings: {
    language: string;
  };
  friends_ids: string[];
  new_steam_id: string;
  steam_id_64: string;
  steam_nickname: string;
  memberships: string[];
  faceit_url: string;
  membership_type: string;
  cover_featured_image: string;
  verified: boolean;
  activated_at: string;
}

export interface PlayerSearchResponse {
  items: Player[];
}

export interface Season {
  competition_id: string;
  competition_name: string;
  match_count: number;
}

export interface PlayerSeasonsResponse {
  player_id: string;
  seasons: Season[];
}

export interface MultiKills {
  doubles?: number;
  triples: number;
  quads: number;
  aces: number;
}

export interface PlayerMapStats {
  map: string;
  matches_played: number;
  wins: number;
  win_rate: number;
  kills: number;
  deaths: number;
  assists: number;
  kd_ratio: number;
  adr: number;
  headshot_pct: number;
}

export interface PlayerMatchResult {
  match_id: string;
  map: string;
  started_at: number;
  finished_at: number;
  result: 'win' | 'loss' | 'unknown';
  score: string;
  kills: number;
  deaths: number;
  assists: number;
  kd_ratio: number;
  adr: number;
  headshot_pct: number;
  mvps: number;
}

export interface PlayerMatchHistoryResponse {
  player_id: string;
  competition_id: string;
  matches: PlayerMatchResult[];
}

export interface PlayerStats {
  player_id: string;
  competition_id: string;
  competition_name: string;
  matches_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  kills: number;
  deaths: number;
  assists: number;
  kd_ratio: number;
  adr: number;
  headshot_pct: number;
  mvps: number;
  multi_kills: MultiKills;
  // Extended stats (optional — may be 0 for unverified FACEIT stat keys)
  kr_ratio?: number;
  damage?: number;
  headshots?: number;
  first_kills?: number;
  entry_count?: number;
  entry_wins?: number;
  entry_success_rate?: number;
  clutch_kills?: number;
  one_v_one_wins?: number;
  one_v_two_wins?: number;
  sniper_kills?: number;
  utility_damage?: number;
  flash_successes?: number;
  maps?: Record<string, PlayerMapStats>;
}
