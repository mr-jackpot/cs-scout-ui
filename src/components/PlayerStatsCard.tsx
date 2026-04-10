import type { PlayerStats, PlayerMapStats } from '../types/api';
import { StatBar } from './StatBar';
import { RatingBadge } from './RatingBadge';
import { ESEA_AVERAGES } from '../utils/statAverages';

interface PlayerStatsCardProps {
  stats: PlayerStats;
}

export function PlayerStatsCard({ stats }: PlayerStatsCardProps) {
  const mapRows = Object.values(stats.maps ?? {}).sort(
    (a, b) => b.matches_played - a.matches_played
  );

  const hasAdvancedStats =
    (stats.kr_ratio ?? 0) > 0 ||
    (stats.damage ?? 0) > 0 ||
    (stats.headshots ?? 0) > 0 ||
    (stats.first_kills ?? 0) > 0;

  const hasEntryClutch =
    (stats.entry_count ?? 0) > 0 ||
    (stats.clutch_kills ?? 0) > 0 ||
    (stats.one_v_one_wins ?? 0) > 0;

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-scale-in">
      <div className="p-5 md:p-8">
        {/* Header with title and rating */}
        <div className="flex justify-between items-start gap-4 mb-6 md:mb-8">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              Season Stats
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white truncate">
              {stats.competition_name}
            </h2>
            <p className="text-base-content/50 text-sm mt-1">
              {stats.matches_played} matches played
            </p>
          </div>
          <RatingBadge kdRatio={stats.kd_ratio} adr={stats.adr} />
        </div>

        {/* Main stat bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          <StatBar
            label="K/D Ratio"
            value={stats.kd_ratio}
            max={2.0}
            average={ESEA_AVERAGES.kd_ratio}
            format="ratio"
          />
          <StatBar
            label="ADR"
            value={stats.adr}
            max={120}
            average={ESEA_AVERAGES.adr}
            format="number"
          />
          <StatBar
            label="Headshot %"
            value={stats.headshot_pct}
            max={100}
            average={ESEA_AVERAGES.headshot_pct}
            format="percent"
          />
        </div>

        {/* Win/Loss section */}
        <div className="bg-base-200/30 rounded-xl p-4 md:p-5 mb-5 md:mb-6 border border-white/5">
          <div className="flex flex-wrap justify-between items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-base-content/60 text-sm">Record:</span>
              <span className="text-[var(--color-good)] font-bold text-lg font-mono">{stats.wins}W</span>
              <span className="text-base-content/30">-</span>
              <span className="text-[var(--color-poor)] font-bold text-lg font-mono">{stats.losses}L</span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-primary) 15%, transparent)`,
                  color: 'var(--color-primary)'
                }}
              >
                {stats.win_rate}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/60 text-sm">MVPs:</span>
              <span className="font-bold text-lg font-mono" style={{ color: 'var(--color-primary)' }}>
                {stats.mvps}
              </span>
            </div>
          </div>
        </div>

        {/* Combat stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          <StatBox value={stats.kills} label="Kills" highlight />
          <StatBox value={stats.deaths} label="Deaths" />
          <StatBox value={stats.assists} label="Assists" />
        </div>

        {/* Multi-kills section */}
        <div className="bg-base-200/30 rounded-xl p-4 md:p-5 border border-white/5 mb-3">
          <h3 className="text-xs font-semibold text-base-content/50 mb-3 md:mb-4 uppercase tracking-wider">
            Multi-Kills
          </h3>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            <MultiKillBox value={stats.multi_kills.doubles ?? 0} label="2K" />
            <MultiKillBox value={stats.multi_kills.triples} label="3K" />
            <MultiKillBox value={stats.multi_kills.quads} label="4K" />
            <MultiKillBox value={stats.multi_kills.aces} label="ACE" highlight />
          </div>
        </div>

        {/* ── Accordion sections ── */}
        <div className="space-y-2 mt-4">

          {/* Advanced Stats */}
          {hasAdvancedStats && (
            <AccordionSection title="Advanced Stats">
              <div className="space-y-4">
                {(stats.kr_ratio ?? 0) > 0 && (
                  <StatBar
                    label="K/R Ratio"
                    value={stats.kr_ratio!}
                    max={1.5}
                    average={ESEA_AVERAGES.kr_ratio}
                    format="ratio"
                  />
                )}
                <div className="grid grid-cols-3 gap-3">
                  <StatBox value={stats.damage ?? 0} label="Damage" />
                  <StatBox value={stats.headshots ?? 0} label="Headshots" />
                  <StatBox value={stats.first_kills ?? 0} label="First Kills" />
                </div>
              </div>
            </AccordionSection>
          )}

          {/* Entry & Clutch */}
          {hasEntryClutch && (
            <AccordionSection title="Entry & Clutch">
              <div className="space-y-4">
                {(stats.entry_count ?? 0) > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox value={stats.entry_count ?? 0} label="Entry Attempts" />
                    <StatBox value={stats.entry_wins ?? 0} label="Entry Wins" />
                    <StatBox
                      value={stats.entry_success_rate ?? 0}
                      label="Entry Win %"
                      format="percent"
                    />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <StatBox value={stats.clutch_kills ?? 0} label="Clutch Kills" highlight />
                  <StatBox value={stats.one_v_one_wins ?? 0} label="1v1 Wins" />
                  <StatBox value={stats.one_v_two_wins ?? 0} label="1v2 Wins" />
                </div>
              </div>
            </AccordionSection>
          )}

          {/* Weapons & Utility */}
          <AccordionSection title="Weapons & Utility">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBox value={stats.sniper_kills ?? 0} label="Sniper Kills" />
              <StatBox value={stats.utility_damage ?? 0} label="Utility Dmg" />
              <StatBox value={stats.flash_successes ?? 0} label="Flashes" />
            </div>
          </AccordionSection>

          {/* Per-Map Breakdown */}
          {mapRows.length > 0 && (
            <AccordionSection title="Per-Map Breakdown">
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-base-content/40 uppercase tracking-wider border-b border-white/5">
                      <th className="pb-2 font-medium">Map</th>
                      <th className="pb-2 font-medium text-center">GP</th>
                      <th className="pb-2 font-medium text-center">W%</th>
                      <th className="pb-2 font-medium text-center">K/D</th>
                      <th className="pb-2 font-medium text-center">ADR</th>
                      <th className="pb-2 font-medium text-center">HS%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mapRows.map((row) => (
                      <MapRow key={row.map} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionSection>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
}

function AccordionSection({ title, children }: AccordionSectionProps) {
  return (
    <div className="collapse collapse-arrow bg-base-200/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-sm font-semibold text-base-content/70 peer-checked:text-white transition-colors py-3 min-h-0">
        {title}
      </div>
      <div className="collapse-content pb-4">
        {children}
      </div>
    </div>
  );
}

interface StatBoxProps {
  value: number;
  label: string;
  highlight?: boolean;
  format?: 'number' | 'percent';
}

function StatBox({ value, label, highlight, format }: StatBoxProps) {
  const display = format === 'percent' ? `${value}%` : value.toLocaleString();
  return (
    <div className="bg-base-200/40 p-3 md:p-4 rounded-xl text-center border border-white/5 hover:border-white/10 transition-colors">
      <div
        className="text-xl md:text-2xl font-bold font-mono tabular-nums"
        style={highlight ? { color: 'var(--color-primary)' } : { color: 'white' }}
      >
        {display}
      </div>
      <div className="text-xs text-base-content/50 mt-1">{label}</div>
    </div>
  );
}

interface MultiKillBoxProps {
  value: number;
  label: string;
  highlight?: boolean;
}

function MultiKillBox({ value, label, highlight }: MultiKillBoxProps) {
  return (
    <div className="text-center py-2">
      <div
        className="text-2xl font-bold font-mono tabular-nums"
        style={highlight ? { color: 'var(--color-primary)' } : { color: 'white' }}
      >
        {value}
      </div>
      <div className="text-xs text-base-content/50 uppercase tracking-wide">{label}</div>
    </div>
  );
}

interface MapRowProps {
  row: PlayerMapStats;
}

function MapRow({ row }: MapRowProps) {
  const mapName = row.map.replace(/^de_/, '');
  const winColor =
    row.win_rate >= 55
      ? 'var(--color-good)'
      : row.win_rate >= 45
      ? 'var(--color-avg)'
      : 'var(--color-poor)';

  return (
    <tr className="hover:bg-white/3 transition-colors">
      <td className="py-2 pr-3 font-medium text-white capitalize">{mapName}</td>
      <td className="py-2 text-center text-base-content/60">{row.matches_played}</td>
      <td className="py-2 text-center font-mono font-semibold" style={{ color: winColor }}>
        {row.win_rate}%
      </td>
      <td className="py-2 text-center font-mono text-base-content/80">{row.kd_ratio.toFixed(2)}</td>
      <td className="py-2 text-center font-mono text-base-content/80">{row.adr.toFixed(1)}</td>
      <td className="py-2 text-center font-mono text-base-content/80">{row.headshot_pct.toFixed(1)}%</td>
    </tr>
  );
}
