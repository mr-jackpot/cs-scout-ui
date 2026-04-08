import { getFaceitLevelColor } from '../utils/faceitLevel';

interface FaceitLevelBadgeProps {
  level: number;
  elo: number;
}

export function FaceitLevelBadge({ level, elo }: FaceitLevelBadgeProps) {
  const color = getFaceitLevelColor(level);
  const imageUrl = `/images/faceit/level${level}.png`;

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="relative">
        <div
          className="absolute inset-0 blur-md opacity-30 rounded-full"
          style={{ backgroundColor: color }}
        />
        <img
          src={imageUrl}
          alt={`FACEIT Level ${level}`}
          className="relative w-9 h-9 object-contain"
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {elo.toLocaleString()}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-base-content/40 font-medium">
          ELO
        </span>
      </div>
    </div>
  );
}
