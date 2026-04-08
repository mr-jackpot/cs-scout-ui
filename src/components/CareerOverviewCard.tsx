import type { PlayerStats } from '../types/api';
import { calculateCareerStats, getRatingTier, getStatColor, ESEA_AVERAGES } from '../utils/statAverages';

interface CareerOverviewCardProps {
  stats: PlayerStats[];
  isLoading?: boolean;
  failedSeasonCount?: number;
}

export function CareerOverviewCard({ stats, isLoading, failedSeasonCount = 0 }: CareerOverviewCardProps) {
  if (isLoading) {
    return (
      <div className="bg-base-200/30 rounded-2xl border border-white/5 p-5 md:p-6 flex items-center justify-center min-h-[120px]">
        <span className="loading loading-spinner loading-md text-[var(--color-primary)]/40" />
      </div>
    );
  }

  const career = calculateCareerStats(stats);

  // All seasons failed — show a warning card rather than disappearing
  if (!career) {
    if (failedSeasonCount > 0) {
      return (
        <div className="bg-base-200/30 rounded-2xl border border-amber-400/20 p-5 md:p-6 animate-fade-in">
          <PartialDataWarning count={failedSeasonCount} />
        </div>
      );
    }
    return null;
  }

  const tier = getRatingTier(career.rating);
  const kdColor = getStatColor(career.kd_ratio, ESEA_AVERAGES.kd_ratio);
  const adrColor = career.adr > 0 ? getStatColor(career.adr, ESEA_AVERAGES.adr) : undefined;

  return (
    <div className="bg-base-200/30 rounded-2xl border border-white/5 p-5 md:p-6 animate-fade-in">
      {/* Stats: column on mobile, row on desktop */}
      <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-6">
        {/* Rating circle — hero stat */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-24 h-24">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{ backgroundColor: tier.color }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${tier.color} 0deg, ${tier.color}50 360deg)`,
                padding: '3px',
              }}
            >
              <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center">
                <span
                  className="text-2xl md:text-3xl font-bold font-mono tabular-nums"
                  style={{ color: tier.color }}
                >
                  {career.rating.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <span
            className="mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `color-mix(in srgb, ${tier.color} 15%, transparent)`,
              color: tier.color,
            }}
          >
            {tier.label}
          </span>
          <span className="mt-1 text-xs text-base-content/40">
            {career.total_matches} match{career.total_matches !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Vertical divider — desktop only */}
        <div className="hidden md:block w-px h-24 bg-white/10 flex-shrink-0" />

        {/* KD + ADR as progress bars */}
        <div className="flex flex-col gap-4 w-full md:flex-1">
          <CareerStatBar
            label="K/D"
            displayValue={career.kd_ratio.toFixed(2)}
            value={career.kd_ratio}
            max={2.5}
            average={ESEA_AVERAGES.kd_ratio}
            color={kdColor}
          />
          <CareerStatBar
            label="ADR"
            displayValue={career.adr > 0 ? career.adr.toFixed(1) : '—'}
            value={career.adr}
            max={130}
            average={ESEA_AVERAGES.adr}
            color={adrColor}
          />
        </div>
      </div>

      {/* Partial data warning */}
      {failedSeasonCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <PartialDataWarning count={failedSeasonCount} />
        </div>
      )}
    </div>
  );
}

interface PartialDataWarningProps {
  count: number;
}

function PartialDataWarning({ count }: PartialDataWarningProps) {
  return (
    <div className="flex items-center gap-2 text-amber-400/70">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span className="text-xs">
        Stats may be incomplete — {count} season{count !== 1 ? 's' : ''} failed to load
      </span>
    </div>
  );
}

interface CareerStatBarProps {
  label: string;
  displayValue: string;
  value: number;
  max: number;
  average: number;
  color?: string;
}

function CareerStatBar({ label, displayValue, value, max, average, color }: CareerStatBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const avgPercentage = Math.min((average / max) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-base-content/50">{label}</span>
        <span
          className={`text-sm font-bold font-mono tabular-nums${!color ? ' text-base-content/40' : ''}`}
          style={color ? { color } : undefined}
        >
          {displayValue}
        </span>
      </div>
      <div className="relative w-full bg-base-300/50 rounded-full h-1.5">
        {value > 0 && (
          <div
            className="h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color ?? 'var(--color-primary)',
              boxShadow: color ? `0 0 8px ${color}40` : undefined,
            }}
          />
        )}
        {/* Average marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/25 rounded-full"
          style={{ left: `${avgPercentage}%` }}
        />
      </div>
    </div>
  );
}
