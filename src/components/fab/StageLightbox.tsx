import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { FabStep } from '../../data/processSteps';
import MiniWorldMap from './MiniWorldMap';

type Props = {
  steps: FabStep[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

/** Expanded view of one stage: large player, full text, prev/next and the production map. */
export default function StageLightbox({ steps, index, onClose, onNavigate }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const open = index !== null;
  const step = open ? steps[index] : null;

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index! < steps.length - 1) onNavigate(index! + 1);
      if (e.key === 'ArrowLeft' && index! > 0) onNavigate(index! - 1);
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('button, video[controls], a[href]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      (lastFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open, index, steps.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {step && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stage-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid max-h-[92vh] w-full max-w-6xl grid-cols-1 overflow-auto rounded-2xl border border-[rgba(56,189,248,0.3)] bg-zinc-950/90 shadow-[0_40px_140px_-30px_rgba(56,189,248,0.4)] outline-none lg:grid-cols-[1.6fr_1fr]"
          >
            <div className="relative bg-black">
              <AnimatePresence mode="wait">
                <motion.video
                  key={step.id}
                  className="aspect-video h-full w-full object-cover"
                  src={step.video}
                  poster={step.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-5 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-trace">
                    Stage {String(step.index).padStart(2, '0')} of {String(steps.length).padStart(2, '0')}
                  </p>
                  <h3 id="stage-title" className="mt-2 font-display text-3xl font-semibold text-white">
                    {step.title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-zinc-300 hover:border-trace/60 hover:text-trace focus-visible:border-trace focus-visible:outline-none"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 2l8 8M10 2 2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
                {step.description.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>

              <dl className="grid grid-cols-3 gap-3 border-y border-white/10 py-4">
                {step.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{f.label}</dt>
                    <dd className="mt-1 font-mono text-[13px] text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{f.value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Where it happens</p>
                <div className="rounded-lg border border-white/10 bg-ink/60 p-2">
                  <MiniWorldMap highlight={step.countries} sites={step.sites} />
                </div>
                <ul className="mt-3 grid grid-cols-1 gap-1 font-mono text-[11px] text-zinc-400 sm:grid-cols-2">
                  {step.sites.map((s) => (
                    <li key={s.name} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-trace shadow-[0_0_6px_#38BDF8]" />
                      {s.name}, {s.country}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto flex justify-between gap-3 pt-2">
                <button
                  disabled={step.index === 1}
                  onClick={() => onNavigate(index! - 1)}
                  className="rounded-full border border-white/15 px-4 py-2 font-mono text-xs text-zinc-300 transition enabled:hover:border-trace/60 enabled:hover:text-trace disabled:opacity-30 focus-visible:border-trace focus-visible:outline-none"
                >
                  ← Previous stage
                </button>
                <button
                  disabled={step.index === steps.length}
                  onClick={() => onNavigate(index! + 1)}
                  className="rounded-full border border-trace/50 bg-trace/10 px-4 py-2 font-mono text-xs text-trace transition enabled:hover:bg-trace/20 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trace"
                >
                  Next stage →
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
