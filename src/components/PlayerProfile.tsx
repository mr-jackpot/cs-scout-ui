import type { Player } from '../types/api';
import { CountryFlag } from '../utils/countryFlag';
import { FaceitLevelBadge } from './FaceitLevelBadge';

interface PlayerProfileProps {
  player: Player;
  onBack: () => void;
  children: React.ReactNode;
}

export function PlayerProfile({ player, onBack, children }: PlayerProfileProps) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-fade-in-up">
      {/* Header with gradient background */}
      <div className="relative p-5 md:p-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--glass-bg)] to-transparent pointer-events-none" />

        {/* Mobile layout: stacked, Desktop: horizontal */}
        <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
          {/* Top row: Avatar + Info + Badge (on desktop) */}
          <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
            {/* Avatar with country flag overlay */}
            <div className="relative flex-shrink-0">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.nickname}
                  className="w-16 h-16 md:w-24 md:h-24 rounded-2xl ring-4 ring-white/10 shadow-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-xl">
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {player.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Country flag badge */}
              <div className="absolute -bottom-1.5 -right-1.5 md:-bottom-2 md:-right-2 bg-base-100 rounded-md p-0.5 md:p-1 shadow-lg">
                <CountryFlag countryCode={player.country} className="w-5 h-4 md:w-7 md:h-5 rounded-sm" />
              </div>
            </div>

            {/* Info + Badge stacked on mobile */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-3xl font-bold text-white truncate mb-0.5 md:mb-1">
                {player.nickname}
              </h2>
              <p className="text-base-content/50 text-xs md:text-sm mb-2 md:mb-0">
                ESEA Competition History
              </p>
              {/* FACEIT Badge - visible only on mobile */}
              {player.games?.cs2 && (
                <div className="md:hidden">
                  <FaceitLevelBadge
                    level={player.games.cs2.skill_level}
                    elo={player.games.cs2.faceit_elo}
                  />
                </div>
              )}
            </div>
          </div>

          {/* FACEIT Level Badge - visible only on desktop */}
          {player.games?.cs2 && (
            <div className="hidden md:block flex-shrink-0">
              <FaceitLevelBadge
                level={player.games.cs2.skill_level}
                elo={player.games.cs2.faceit_elo}
              />
            </div>
          )}

          {/* Action buttons row */}
          <div className="flex items-center gap-2 md:gap-0 flex-shrink-0">
            {/* FACEIT Profile Link */}
            <a
              href={player.faceit_url ? player.faceit_url.replace('{lang}', 'en') : `https://www.faceit.com/en/players/${player.player_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              title="View FACEIT Profile"
            >
              <img src="/images/faceit-logo.png" alt="FACEIT" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity duration-200" />
            </a>

            {/* Steam Profile Link */}
            {player.steam_id_64 && (
              <a
                href={`https://steamcommunity.com/profiles/${player.steam_id_64}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                title="View Steam Profile"
              >
                <img src="/images/steam-logo.png" alt="Steam" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity duration-200" />
              </a>
            )}

            {/* Back button */}
            <button
              type="button"
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium text-base-content/60 hover:text-white hover:bg-white/10 transition-all duration-200 ml-auto md:ml-0"
              onClick={onBack}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-8 pt-0 md:pt-0">
        {children}
      </div>
    </div>
  );
}
