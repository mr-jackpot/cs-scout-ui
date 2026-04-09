import type { Season, PlayerStats } from '../types/api';
import { InlineRatingBadge } from './InlineRatingBadge';

interface SeasonsListProps {
  seasons: Season[];
  seasonStatsMap: Record<string, PlayerStats>;
  loadingStatsMap: Record<string, boolean>;
  failedStatsSet: Set<string>;
  onSelectSeason: (season: Season) => void;
}

export function SeasonsList({ seasons, seasonStatsMap, loadingStatsMap, failedStatsSet, onSelectSeason }: SeasonsListProps) {
  // Filter out seasons with 0 matches (only after stats are loaded)
  const filteredSeasons = seasons.filter((season) => {
    const stats = seasonStatsMap[season.competition_id];
    const isLoading = loadingStatsMap[season.competition_id];
    // Show while loading, hide if stats loaded and matches_played is 0
    if (isLoading || !stats) return true;
    return stats.matches_played > 0;
  });

  if (filteredSeasons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base-content/40">No ESEA seasons found</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
          Seasons
        </h3>
        <span className="text-xs text-base-content/30">
          {filteredSeasons.length} competition{filteredSeasons.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Season cards */}
      <div className="space-y-2">
        {filteredSeasons.map((season) => (
          <div
            key={season.competition_id}
            className="group flex items-center justify-between p-4 rounded-xl bg-base-200/30 hover:bg-base-200/50 border border-transparent hover:border-[var(--color-primary)]/20 cursor-pointer transition-all duration-200"
            onClick={() => onSelectSeason(season)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base-content/90 group-hover:text-white truncate transition-colors">
                {season.competition_name}
              </div>
              <div className="text-sm text-base-content/40">
                {(() => {
                  const stats = seasonStatsMap[season.competition_id];
                  const count = stats?.matches_played ?? season.match_count;
                  return `${count} match${count !== 1 ? 'es' : ''}`;
                })()}
              </div>
            </div>

            {/* Rating badge */}
            <div className="flex-shrink-0 mr-3">
              {loadingStatsMap[season.competition_id] ? (
                <span className="loading loading-spinner loading-sm text-base-content/30"></span>
              ) : seasonStatsMap[season.competition_id] ? (
                <InlineRatingBadge
                  kdRatio={seasonStatsMap[season.competition_id].kd_ratio}
                  adr={seasonStatsMap[season.competition_id].adr}
                />
              ) : failedStatsSet.has(season.competition_id) ? (
                <span title="Stats failed to load">
                  <svg className="w-4 h-4 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </span>
              ) : null}
            </div>

            <button
              type="button"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSeason(season);
              }}
            >
              View
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
