import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ScrambleText from './ScrambleText';

export type Spec = { label: string; value: string };

type Props = {
  kicker: string;
  title: string;
  body: string;
  specs?: Spec[];
  tone?: 'trace' | 'molten';
  /** drive the reveal from outside; omit to reveal when scrolled into view */
  show?: boolean;
};

const TONE = {
  trace: { text: 'text-trace', rule: 'bg-trace/70', scan: 'bg-trace shadow-[0_0_14px_rgba(56,189,248,0.9)]' },
  molten: { text: 'text-molten', rule: 'bg-molten/70', scan: 'bg-molten shadow-[0_0_14px_rgba(249,115,22,0.9)]' },
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The one caption style used across the site, with a digital entrance:
 * a scan line sweeps the block, kicker, headline and specs decode from random
 * glyphs like a split-flap board, and the body resolves last.
 * Positioning is up to the parent.
 */
export default function Caption({ kicker, title, body, specs, tone = 'trace', show }: Props) {
  const t = TONE[tone];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const on = show ?? inView;

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      {/* scan line */}
      <AnimatePresence>
        {on && (
          <motion.span
            key="scan"
            aria-hidden
            className={`pointer-events-none absolute -inset-y-3 w-px ${t.scan}`}
            initial={{ left: '-2%', opacity: 0 }}
            animate={{ left: ['-2%', '104%'], opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }}
          />
        )}
      </AnimatePresence>

      <p className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] ${t.text}`}>
        <motion.span
          className={`h-px ${t.rule}`}
          initial={false}
          animate={{ width: on ? 32 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <ScrambleText text={kicker} active={on} duration={650} />
      </p>

      {/* headline decodes like the spec row; an invisible copy reserves the final layout so lines never jump */}
      <h2
        aria-label={title}
        className="mt-4 grid bg-gradient-to-b from-white to-zinc-400 bg-clip-text font-display text-3xl font-medium leading-[1.05] tracking-[-0.02em] text-transparent md:text-[44px]"
        style={{ textWrap: 'balance' }}
      >
        <span aria-hidden className="invisible col-start-1 row-start-1">
          {title}
        </span>
        <ScrambleText className="col-start-1 row-start-1" text={title} active={on} duration={900} delay={120} />
      </h2>

      <motion.p
        className="mt-4 text-[15px] leading-relaxed text-zinc-400"
        initial={false}
        animate={on ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 0, filter: 'blur(6px)', y: 6 }}
        transition={{ duration: 0.6, delay: on ? 0.45 : 0, ease: EASE }}
      >
        {body}
      </motion.p>

      {specs && (
        <motion.dl
          className="mt-6 flex gap-5 border-t border-white/10 pt-4"
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ duration: 0.3, delay: on ? 0.55 : 0 }}
        >
          {specs.map((s, i) => (
            <div key={s.label}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">{s.label}</dt>
              <dd className="mt-1 whitespace-nowrap font-mono text-[12px] text-zinc-200">
                <ScrambleText text={s.value} active={on} duration={600} delay={650 + i * 120} />
              </dd>
            </div>
          ))}
        </motion.dl>
      )}
    </div>
  );
}
