import { useState, useRef, useCallback } from 'react';
import { getPlayerMatches } from '../services/api';
import type { PlayerMatchResult } from '../types/api';

interface MatchHistoryListProps {
  playerId: string;
  competitionId: string;
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export function MatchHistoryList({ playerId, competitionId }: MatchHistoryListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [matches, setMatches] = useState<PlayerMatchResult[]>([]);
  const hasFetchedRef = useRef(false);

  const fetchMatches = useCallback(() => {
    hasFetchedRef.current = true;
    setStatus('loading');
    getPlayerMatches(playerId, competitionId)
      .then((data) => {
        setMatches(data);
        setStatus('success');
      })
      .catch(() => {
        hasFetchedRef.current = false;
        setStatus('error');
      });
  }, [playerId, competitionId]);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (open && !hasFetchedRef.current) {
      fetchMatches();
    }
  };

  const handleRetry = () => {
    if (!isOpen) setIsOpen(true);
    fetchMatches();
  };

  return (
    <div className="collapse bg-base-200/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors mt-2">
      <input
        type="checkbox"
        className="peer"
        checked={isOpen}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      <div className="collapse-title text-sm font-semibold text-base-content/70 peer-checked:text-white transition-colors flex items-center py-3 min-h-0">
        <span>Match History</span>
        {status === 'loading' && (
          <span className="loading loading-spinner loading-xs text-base-content/40 ml-auto" />
        )}
      </div>

      <div className="collapse-content pb-4">
        {status === 'idle' && null}

        {status === 'loading' && (
          <div className="flex justify-center py-6">
            <span className="loading loading-spinner loading-md text-[var(--color-primary)]/60" />
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-6">
            <p className="text-base-content/50 text-sm mb-3">Failed to load match history</p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {status === 'success' && matches.length === 0 && (
          <p className="text-center text-base-content/40 text-sm py-4">No matches found</p>
        )}

        {status === 'success' && matches.length > 0 && (
          <div className="space-y-1.5">
            {matches.map((match) => (
              <MatchRow key={match.match_id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MatchRowProps {
  match: PlayerMatchResult;
}

function MatchRow({ match }: MatchRowProps) {
  const date = new Date(match.finished_at * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const mapName = match.map.replace(/^de_/, '');

  const resultColor =
    match.result === 'win'
      ? 'var(--color-good)'
      : match.result === 'loss'
      ? 'var(--color-poor)'
      : 'var(--color-avg)';

  const resultLabel = match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : '?';

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-base-200/20 hover:bg-base-200/40 transition-colors text-sm">
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          backgroundColor: `color-mix(in srgb, ${resultColor} 15%, transparent)`,
          color: resultColor,
        }}
      >
        {resultLabel}
      </span>

      <div className="flex-1 min-w-0">
        <span className="font-medium text-white capitalize">{mapName}</span>
        <span className="text-base-content/40 text-xs ml-2">{date}</span>
      </div>

      <span className="text-base-content/50 font-mono text-xs flex-shrink-0">{match.score}</span>

      <span className="font-mono text-xs text-base-content/70 flex-shrink-0 hidden sm:block">
        {match.kills}/{match.deaths}/{match.assists}
      </span>

      <span className="font-mono text-xs text-base-content/50 flex-shrink-0 hidden md:block w-14 text-right">
        {match.adr.toFixed(0)} ADR
      </span>

      <span className="font-mono text-xs text-base-content/50 flex-shrink-0 hidden md:block w-12 text-right">
        {match.headshot_pct.toFixed(0)}% HS
      </span>
    </div>
  );
}
