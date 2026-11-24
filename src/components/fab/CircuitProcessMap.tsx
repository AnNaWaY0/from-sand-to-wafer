import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FabStep } from '../../data/processSteps';
import { backgroundTraces, pcbPath, type Pt } from '../../lib/pcbPath';
import StageLightbox from './StageLightbox';
import { chapter, kicker } from '../../data/chapters';
import Caption from '../ui/Caption';
import StagePreviewCard from './StagePreviewCard';

const ACCENT = '#38BDF8';
const W = 1200;            // design width of the board (SVG units)
const GAP = 1100;          // vertical distance between stations
const TOP = 600;           // first station (room for the chapter label above it)
const TAIL = 760;          // trace after the last station, down to the section edge
const CENTER = W / 2;
const HOLD = 0.05;         // half-width of each pause, in scroll progress

type Props = { steps: FabStep[] };

/**
 * Stage 2: a vertical circuit-board trace. Scrolling moves the "camera" down the
 * trace; at every via pad it pauses and a large preview card slides in beside it.
 */
export default function CircuitProcessMap({ steps }: Props) {
  const n = steps.length;
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [size, setSize] = useState({ w: 1152, h: 800 });
  const [active, setActive] = useState<number | null>(null);
  const [lit, setLit] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  // Geometry: pads alternate left/right of the centre so the card always has room on the other side.
  const H = TOP + (n - 1) * GAP + TAIL;
  const sides = steps.map((_, i) => (i % 2 === 0 ? 'right' : 'left') as 'left' | 'right');
  const nodes: Pt[] = steps.map((_, i) => ({ x: sides[i] === 'right' ? CENTER - 120 : CENTER + 120, y: TOP + i * GAP }));
  const { d, fractions } = useMemo(() => {
    const stops: Pt[] = [{ x: CENTER, y: 0 }];
    nodes.forEach((p, i) => {
      if (i > 0) {
        // a PCB-style dog-leg between stations: jog out, run down, jog back
        const prev = nodes[i - 1];
        const jog = (i % 2 === 0 ? -1 : 1) * 140;
        stops.push({ x: prev.x + jog, y: prev.y + 260 });
        stops.push({ x: prev.x + jog, y: p.y - 300 });
      } else {
        stops.push({ x: CENTER, y: p.y - 160 });
      }
      stops.push(p);
    });
    const last = nodes[n - 1];
    stops.push({ x: CENTER, y: last.y + 180 });
    stops.push({ x: CENTER, y: H });
    const r = pcbPath(stops, { chamfer: 18 });
    // keep only the fractions that belong to stations
    const stationIdx = nodes.map((_, i) => (i === 0 ? 2 : 2 + i * 3));
    return { d: r.d, fractions: stationIdx.map((k) => r.fractions[k]) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  const bg = useMemo(() => backgroundTraces(W, H, 140, 21), [H]);

  // Measure the sticky stage so SVG units can be converted to pixels.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const s = size.w / W; // px per unit

  // Scroll → position along the trace, with a plateau (pause) at each station.
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end end'] });
  const stops = steps.map((_, i) => 0.08 + (i * 0.84) / Math.max(1, n - 1));
  const input: number[] = [0];
  const output: number[] = [0];
  stops.forEach((st, i) => {
    input.push(st - HOLD, st + HOLD);
    output.push(fractions[i], fractions[i]);
  });
  input.push(1);
  output.push(1);
  const along = useTransform(scrollYProgress, input, output);
  const smooth = useSpring(along, { stiffness: 120, damping: 26, mass: 0.5 });

  const headX = useMotionValue(CENTER);
  const headY = useMotionValue(0);
  const camY = useMotionValue(0);

  const place = (f: number) => {
    const el = pathRef.current;
    if (!el) return;
    const pt = el.getPointAtLength(Math.max(0, Math.min(1, f)) * el.getTotalLength());
    headX.set(pt.x);
    headY.set(pt.y);
    // camera keeps the current in the middle of the screen, clamped to the board
    const y = size.h / 2 - pt.y * s;
    camY.set(Math.min(0, Math.max(size.h - H * s, y)));
  };
  useMotionValueEvent(smooth, 'change', place);
  useEffect(() => place(smooth.get()), [size.w, size.h]); // eslint-disable-line react-hooks/exhaustive-deps

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = stops.findIndex((st) => p >= st - HOLD - 0.012 && p <= st + HOLD + 0.02);
    setActive((prev) => (prev === (i < 0 ? null : i) ? prev : i < 0 ? null : i));
  });
  useMotionValueEvent(smooth, 'change', (f) => {
    const k = fractions.filter((fr) => f >= fr - 0.003).length;
    setLit((prev) => (prev === k ? prev : k));
  });

  return (
    <>
      <div ref={outerRef} id="wafer-line" className="relative" style={{ height: `${n * 135 + 60}vh` }}>
        {/* story points for the magnetic scroll: the chapter label and every station pause */}
        <div data-snap data-guide="route" aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px" />
        {stops.map((st, i) => (
          <div key={i} data-snap data-guide="route" aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `${st * (n * 135 + 60 - 100)}vh` }} />
        ))}
        {/* end of the route: the trace runs on into the next block */}
        <div data-guide="route" aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `${n * 135 + 60 - 100}vh` }} />
        <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden">
          <motion.div className="absolute left-0 top-0 w-full" style={{ y: camY, height: H * s }}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H * s} className="block overflow-visible" aria-hidden>
              <defs>
                <filter id="traceGlowV" x="-50%" y="-5%" width="200%" height="110%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="headGlowV">
                  <stop offset="0%" stopColor="#E0F2FE" />
                  <stop offset="35%" stopColor={ACCENT} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* background copper for depth */}
              <g opacity={0.12} stroke={ACCENT} fill="none" strokeWidth={1.2}>
                {bg.map((t, i) => (
                  <g key={i}>
                    <path d={t.d} strokeLinecap="round" strokeLinejoin="round" />
                    {t.ends.map((e, j) => (
                      <circle key={j} cx={e.x} cy={e.y} r={3} />
                    ))}
                  </g>
                ))}
              </g>

              {/* chapter label, printed on the board like PCB silkscreen */}
              <g>
                <motion.text
                  x={515}
                  y={440}
                  textAnchor="end"
                  fontFamily="Space Grotesk, sans-serif"
                  fontWeight={600}
                  fontSize={300}
                  letterSpacing="-0.04em"
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={1.2}
                  strokeDasharray={1400}
                  initial={{ strokeDashoffset: 1400, opacity: 0.15 }}
                  whileInView={{ strokeDashoffset: 0, opacity: 0.22 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {chapter('wafer-line').no}
                </motion.text>
                <g stroke="rgba(255,255,255,0.28)" strokeWidth={1.4} fill="none">
                  {[
                    'M60 140 V120 H80',
                    'M500 120 H520 V140',
                    'M60 480 V500 H80',
                    'M500 500 H520 V480',
                  ].map((c) => (
                    <path key={c} d={c} />
                  ))}
                </g>
                {/* IC pins along the bottom edge */}
                <g stroke="rgba(56,189,248,0.35)" strokeWidth={2}>
                  {Array.from({ length: 12 }, (_, k) => (
                    <line key={k} x1={110 + k * 32} y1={508} x2={110 + k * 32} y2={522} />
                  ))}
                </g>
                <text x={60} y={104} fontFamily="JetBrains Mono, monospace" fontSize={13} letterSpacing="0.2em" fill="rgba(255,255,255,0.35)">
                  U{Number(chapter('wafer-line').no)} · WAFER LINE
                </text>
                {/* branch from the main trace into the label */}
                <path d={`M${CENTER} 220 L${CENTER - 40} 260 H530`} fill="none" stroke="rgba(56,189,248,0.45)" strokeWidth={2} strokeLinejoin="round" />
                <circle cx={530} cy={260} r={6} fill="#09090B" stroke={ACCENT} strokeWidth={1.5} />
              </g>

              {/* dormant trace */}
              <path d={d} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="2 7" />

              {/* live current */}
              <motion.path d={d} fill="none" stroke={ACCENT} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} filter="url(#traceGlowV)" style={{ pathLength: smooth }} />
              <motion.path ref={pathRef} d={d} fill="none" stroke={ACCENT} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: smooth }} />
              <motion.circle cx={headX} cy={headY} r={22} fill="url(#headGlowV)" />

              {/* via pads */}
              {nodes.map((p, i) => {
                const on = i < lit;
                const here = active === i;
                return (
                  <g key={steps[i].id}>
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={26}
                      fill="#09090B"
                      stroke={on ? ACCENT : 'rgba(255,255,255,0.35)'}
                      strokeWidth={1.6}
                      animate={{ scale: here ? 1.15 : 1 }}
                      style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    />
                    <circle cx={p.x} cy={p.y} r={18} fill="none" stroke={on ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.12)'} strokeDasharray="1.5 3.5" />
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={9}
                      animate={{
                        fill: on ? ACCENT : '#27272A',
                        filter: here
                          ? 'drop-shadow(0 0 12px rgba(56,189,248,1)) drop-shadow(0 0 26px rgba(56,189,248,0.7))'
                          : on
                            ? 'drop-shadow(0 0 6px rgba(56,189,248,0.8))'
                            : 'drop-shadow(0 0 0 rgba(56,189,248,0))',
                      }}
                      transition={{ duration: 0.35 }}
                    />
                    <text
                      x={sides[i] === 'right' ? p.x - 46 : p.x + 46}
                      y={p.y + 5}
                      textAnchor={sides[i] === 'right' ? 'end' : 'start'}
                      fontFamily="JetBrains Mono, monospace"
                      fontSize={15}
                      letterSpacing="0.18em"
                      fill={on ? ACCENT : 'rgba(255,255,255,0.4)'}
                    >
                      {String(steps[i].index).padStart(2, '0')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* chapter heading sits inside the silkscreen frame and scrolls with the board */}
            <div className="absolute" style={{ left: 100 * s, top: 150 * s, width: 384 }}>
              <Caption
                kicker={kicker('wafer-line', 'From metal to mirror')}
                title="Five stations to a mirror-flat wafer."
                body="The current pauses at every station. Open a card to see the machine at work."
                specs={[
                  { label: 'Stations', value: '5' },
                  { label: 'Ingot to box', value: '3–4 weeks' },
                  { label: 'Output', value: 'Ø 300 mm' },
                ]}
              />
            </div>
          </motion.div>

          {/* large preview card beside the resting pad */}
          <AnimatePresence mode="wait">
            {active !== null && (
              <motion.div
                key={steps[active].id}
                className="absolute top-1/2 w-[min(540px,44%)]"
                initial={{ opacity: 0, x: sides[active] === 'right' ? 48 : -48, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: sides[active] === 'right' ? 24 : -24, filter: 'blur(4px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  y: '-50%',
                  ...(
                  sides[active] === 'right'
                    ? { left: (nodes[active].x + 90) * s }
                    : { right: (W - nodes[active].x + 90) * s }),
                }}
              >
                <StagePreviewCard step={steps[active]} onOpen={() => setOpen(active)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* soft vignette at top and bottom of the moving board */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
        </div>
      </div>

      {/* the trace leaves the section: hand-off to the next block */}
      <div aria-hidden className="relative h-40">
        <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-gradient-to-b from-trace to-trace/0 shadow-[0_0_14px_rgba(56,189,248,0.8)]" />
      </div>

      <StageLightbox steps={steps} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} />
    </>
  );
}
