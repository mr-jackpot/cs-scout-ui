import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlayer, getPlayerSeasons, getPlayerStats, searchPlayers } from '../services/api';
import type { Season, PlayerStats, Player } from '../types/api';
import { PlayerProfile, SeasonsList, PlayerStatsCard, CareerOverviewCard } from '../components';

export function PlayerPage() {
  const { nickname } = useParams<{ nickname: string }>();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map of competition_id -> PlayerStats (cached stats)
  const [seasonStatsMap, setSeasonStatsMap] = useState<Record<string, PlayerStats>>({});
  // Map of competition_id -> loading state
  const [loadingStatsMap, setLoadingStatsMap] = useState<Record<string, boolean>>({});
  // Set of competition_ids where stats fetch failed
  const [failedStatsSet, setFailedStatsSet] = useState<Set<string>>(new Set());
  // Currently selected season ID for modal
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  useEffect(() => {
    if (!nickname) return;

    const fetchPlayer = async () => {
      // Use cached data for immediate display while fetching full data
      const storedPlayer = sessionStorage.getItem(`player-${nickname}`);
      if (storedPlayer) {
        const cachedPlayer = JSON.parse(storedPlayer) as Player;
        setPlayer(cachedPlayer);

        // Fetch full player data using cached player_id
        try {
          const playerData = await getPlayer(cachedPlayer.player_id);
          setPlayer(playerData);
          sessionStorage.setItem(`player-${nickname}`, JSON.stringify(playerData));
        } catch {
          // Player fetch failed, continue with cached data
        }
      } else {
        // No cached data, search by nickname to get player_id
        try {
          const searchResult = await searchPlayers(nickname);
          const foundPlayer = searchResult.items.find(
            p => p.nickname.toLowerCase() === nickname.toLowerCase()
          );
          if (foundPlayer) {
            setPlayer(foundPlayer);
            sessionStorage.setItem(`player-${nickname}`, JSON.stringify(foundPlayer));

            // Fetch full player data
            try {
              const playerData = await getPlayer(foundPlayer.player_id);
              setPlayer(playerData);
              sessionStorage.setItem(`player-${nickname}`, JSON.stringify(playerData));
            } catch {
              // Continue with search result data
            }
          } else {
            setError('Player not found');
          }
        } catch {
          setError('Failed to find player');
        }
      }
    };

    fetchPlayer();
  }, [nickname]);

  useEffect(() => {
    if (!player) return;

    const fetchSeasons = async () => {
      setLoadingSeasons(true);
      setError(null);

      try {
        const response = await getPlayerSeasons(player.player_id);
        setSeasons(response.seasons);
      } catch {
        setError('Failed to fetch player seasons');
      } finally {
        setLoadingSeasons(false);
      }
    };

    fetchSeasons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.player_id]);

  // Prefetch stats for all seasons
  useEffect(() => {
    if (!player || seasons.length === 0) return;

    // Reset stats state for this player/season batch to prevent stale data
    setSeasonStatsMap({});
    setFailedStatsSet(new Set());

    // Set all seasons to loading
    setLoadingStatsMap(
      Object.fromEntries(seasons.map(s => [s.competition_id, true]))
    );

    // Fetch each season independently (parallel)
    seasons.forEach(async (season) => {
      try {
        const stats = await getPlayerStats(player.player_id, season.competition_id);
        setSeasonStatsMap(prev => ({ ...prev, [season.competition_id]: stats }));
      } catch {
        setFailedStatsSet(prev => new Set(prev).add(season.competition_id));
      } finally {
        setLoadingStatsMap(prev => ({ ...prev, [season.competition_id]: false }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.player_id, seasons]);

  const handleSelectSeason = (season: Season) => {
    setSelectedSeasonId(season.competition_id);
  };

  // Career overview is shown only when every current season is resolved (success or known failure)
  const allLoaded =
    seasons.length > 0 &&
    seasons.every(s => !!seasonStatsMap[s.competition_id] || failedStatsSet.has(s.competition_id));

  // Derive career stats only from the current player's loaded seasons (avoids stale map entries)
  const currentSeasonStats = seasons
    .map(s => seasonStatsMap[s.competition_id])
    .filter((s): s is PlayerStats => !!s);

  // Count seasons whose stats failed to load
  const failedSeasonCount = seasons.filter(s => failedStatsSet.has(s.competition_id)).length;

  // Get cached stats for modal
  const selectedStats = selectedSeasonId ? seasonStatsMap[selectedSeasonId] : null;
  const isLoadingSelectedStats = selectedSeasonId ? loadingStatsMap[selectedSeasonId] : false;

  const handleBack = () => {
    navigate('/');
  };

  const closeModal = () => {
    setSelectedSeasonId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {error && (
        <div className="alert alert-error mb-6 rounded-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {player ? (
        <PlayerProfile player={player} onBack={handleBack}>
          {loadingSeasons ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-[var(--color-primary)]"></span>
              <p className="text-base-content/40 mt-4 text-sm">Loading seasons...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {seasons.length > 0 && (
                <CareerOverviewCard
                  stats={currentSeasonStats}
                  isLoading={!allLoaded}
                  failedSeasonCount={failedSeasonCount}
                />
              )}
              <SeasonsList
                seasons={seasons}
                seasonStatsMap={seasonStatsMap}
                loadingStatsMap={loadingStatsMap}
                failedStatsSet={failedStatsSet}
                onSelectSeason={handleSelectSeason}
              />
            </div>
          )}
        </PlayerProfile>
      ) : (
        <div className="glass rounded-2xl border border-white/5 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Player Seasons</h2>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-base-content/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={handleBack}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to search
            </button>
          </div>
          {loadingSeasons ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-[var(--color-primary)]"></span>
              <p className="text-base-content/40 mt-4 text-sm">Loading seasons...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {seasons.length > 0 && (
                <CareerOverviewCard
                  stats={currentSeasonStats}
                  isLoading={!allLoaded}
                  failedSeasonCount={failedSeasonCount}
                />
              )}
              <SeasonsList
                seasons={seasons}
                seasonStatsMap={seasonStatsMap}
                loadingStatsMap={loadingStatsMap}
                failedStatsSet={failedStatsSet}
                onSelectSeason={handleSelectSeason}
              />
            </div>
          )}
        </div>
      )}

      {/* Stats Modal */}
      {selectedSeasonId && (
        <dialog className="modal modal-open">
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={closeModal}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-3xl mx-4 my-auto max-h-[90vh] overflow-y-auto">
            {isLoadingSelectedStats ? (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="loading loading-spinner loading-lg text-[var(--color-primary)]"></span>
                <p className="text-base-content/40 mt-4">Loading stats...</p>
              </div>
            ) : selectedSeasonId && failedStatsSet.has(selectedSeasonId) ? (
              <div className="bg-base-200/80 rounded-2xl border border-amber-400/20 p-8 text-center">
                <svg className="w-10 h-10 text-amber-400/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-base-content/70 font-medium mb-1">Stats failed to load</p>
                <p className="text-base-content/40 text-sm">This may be due to rate limiting. Try refreshing the page.</p>
              </div>
            ) : (
              selectedStats && <PlayerStatsCard stats={selectedStats} />
            )}

            {/* Close button */}
            <div className="flex justify-center mt-6 pb-4">
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium glass border border-white/10 text-base-content/80 hover:text-white hover:border-white/20 transition-all duration-200"
                onClick={closeModal}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
