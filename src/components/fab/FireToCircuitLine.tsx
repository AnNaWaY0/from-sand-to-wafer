import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const MOLTEN = '#F97316';
const ACCENT = '#38BDF8';
// PCB-style connector: straight runs and 45° jogs, starts and ends on the centre line
const D = 'M100 0 V70 L130 100 V170 L100 200 V260';
const LEN = 70 + 30 * Math.SQRT2 + 70 + 30 * Math.SQRT2 + 60;

/**
 * Scroll-story bridge between the furnace film and the circuit route: the line
 * leaves the film in molten orange and cools into the circuit blue as you scroll.
 */
export default function FireToCircuitLine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const head = useTransform(scrollYProgress, (p) => {
    const l = Math.max(0, Math.min(1, p)) * LEN;
    // walk the polyline to place the head
    const segs: [number, number, number, number][] = [
      [100, 0, 100, 70],
      [100, 70, 130, 100],
      [130, 100, 130, 170],
      [130, 170, 100, 200],
      [100, 200, 100, 260],
    ];
    let rest = l;
    for (const [x1, y1, x2, y2] of segs) {
      const sl = Math.hypot(x2 - x1, y2 - y1);
      if (rest <= sl) return { x: x1 + ((x2 - x1) * rest) / sl, y: y1 + ((y2 - y1) * rest) / sl };
      rest -= sl;
    }
    return { x: 100, y: 260 };
  });
  const hx = useTransform(head, (h) => h.x);
  const hy = useTransform(head, (h) => h.y);
  const headColor = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [MOLTEN, MOLTEN, ACCENT, ACCENT]);
  const glow = useTransform(headColor, (c) => `drop-shadow(0 0 10px ${c}) drop-shadow(0 0 22px ${c})`);

  return (
    <div ref={ref} aria-hidden className="relative mx-auto h-[260px] w-[200px]">
      <svg viewBox="0 0 200 260" width="200" height="260" className="overflow-visible">
        <defs>
          <linearGradient id="fireToIce" x1="0" y1="0" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={MOLTEN} />
            <stop offset="35%" stopColor={MOLTEN} />
            <stop offset="55%" stopColor="#F5D0A9" />
            <stop offset="75%" stopColor={ACCENT} />
            <stop offset="100%" stopColor={ACCENT} />
          </linearGradient>
          <filter id="fireGlow" x="-200%" y="-10%" width="500%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path d={D} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} strokeLinejoin="round" />
        <motion.path d={D} fill="none" stroke="url(#fireToIce)" strokeWidth={10} strokeLinejoin="round" opacity={0.45} filter="url(#fireGlow)" style={{ pathLength: draw }} />
        <motion.path d={D} fill="none" stroke="url(#fireToIce)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
        <motion.circle cx={hx} cy={hy} r={5} style={{ fill: headColor, filter: glow }} />
      </svg>
    </div>
  );
}
