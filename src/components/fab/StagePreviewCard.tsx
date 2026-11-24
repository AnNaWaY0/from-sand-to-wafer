import { motion } from 'framer-motion';
import type { FabStep } from '../../data/processSteps';

type Props = { step: FabStep; onOpen: () => void };

/** Large glass preview shown beside the trace while the camera rests on a via pad. */
export default function StagePreviewCard({ step, onOpen }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open stage ${step.index}: ${step.title}`}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.99 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-[rgba(56,189,248,0.3)] bg-zinc-950/55 text-left shadow-[0_30px_90px_-30px_rgba(56,189,248,0.35)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-trace hover:shadow-[0_0_0_1px_rgba(56,189,248,0.6),0_30px_120px_-20px_rgba(56,189,248,0.6)] focus-visible:border-trace focus-visible:outline-none"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        <video
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={step.video}
          poster={step.poster}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded border border-trace/40 bg-ink/70 px-2 py-0.5 font-mono text-[11px] tracking-[0.2em] text-trace">
          STAGE {String(step.index).padStart(2, '0')}
        </span>
        {/* "Details" badge: always visible, lights up on hover */}
        <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-ink/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition-colors duration-300 group-hover:border-trace group-hover:bg-trace group-hover:text-ink">
          Details
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div className="space-y-3 p-6 md:p-7">
        <h3 className="font-display text-2xl font-semibold text-white md:text-3xl">{step.title}</h3>
        <p className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
            <path d="M5 11s4-3.6 4-6.5A4 4 0 0 0 1 4.5C1 7.4 5 11 5 11Z" stroke="#38BDF8" strokeWidth="1.2" />
            <circle cx="5" cy="4.6" r="1.3" fill="#38BDF8" />
          </svg>
          {step.location}
        </p>
        <p className="text-[15px] leading-relaxed text-zinc-300">{step.description[0]}</p>
        <dl className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          {step.facts.map((f) => (
            <div key={f.label}>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{f.label}</dt>
              <dd className="mt-1 font-mono text-[13px] text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.button>
  );
}
