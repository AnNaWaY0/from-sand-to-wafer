import { motion } from 'framer-motion';
import { WORLD_PATHS, WORLD_VIEWBOX } from '../../data/worldPaths';
import type { Site } from '../../data/processSteps';

type Props = { highlight: string[]; sites: Site[] };

const project = (lat: number, lon: number) => ({ x: lon + 180, y: WORLD_VIEWBOX.latTop - lat });

/** Small world map in the section's style: countries of the current stage glow, sites pulse. */
export default function MiniWorldMap({ highlight, sites }: Props) {
  const on = new Set(highlight);
  // Frame the sites of this stage (with margin), keeping a 2:1 map shape.
  const xs = sites.map((s) => s.lon + 180), ys = sites.map((s) => WORLD_VIEWBOX.latTop - s.lat);
  let x0 = Math.min(...xs) - 28, x1 = Math.max(...xs) + 28, y0 = Math.min(...ys) - 16, y1 = Math.max(...ys) + 16;
  const w = Math.max(x1 - x0, (y1 - y0) * 2), h = w / 2;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  x0 = Math.max(0, Math.min(WORLD_VIEWBOX.width - w, cx - w / 2));
  y0 = Math.max(0, Math.min(WORLD_VIEWBOX.height - h, cy - h / 2));
  return (
    <svg
      viewBox={`${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Map highlighting ${[...new Set(sites.map((s) => s.country))].join(', ')}`}
    >
      <defs>
        <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {Object.entries(WORLD_PATHS).map(([id, d]) => (
        <path
          key={id}
          d={d}
          fill={on.has(id) ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.06)'}
          stroke={on.has(id) ? '#38BDF8' : 'rgba(255,255,255,0.14)'}
          strokeWidth={on.has(id) ? 0.5 : 0.25}
          filter={on.has(id) ? 'url(#mapGlow)' : undefined}
        />
      ))}
      {sites.map((s, i) => {
        const p = project(s.lat, s.lon);
        return (
          <g key={s.name}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={w / 60}
              fill="none"
              stroke="#38BDF8"
              strokeWidth={0.6}
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
            <circle cx={p.x} cy={p.y} r={w / 160} fill="#E0F2FE" />
          </g>
        );
      })}
    </svg>
  );
}
