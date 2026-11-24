import { useLayoutEffect, useRef } from 'react';

const GLYPHS = '01<>/\\[]{}#%&*+=_-ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const STEP = 1000 / 30; // update at 30 fps: smooth enough for a flip-board, light on the main thread

type Props = { text: string; active: boolean; duration?: number; delay?: number; className?: string };

/**
 * Digital "decode" effect, like a split-flap board: characters cycle through
 * random glyphs and lock in from left to right when `active` turns on, and
 * dissolve back when it turns off. Writes straight to the DOM (no re-renders).
 */
export default function ScrambleText({ text, active, duration = 700, delay = 0, className }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);
  const first = useRef(true);

  useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    cancelAnimationFrame(raf.current);
    if (first.current) {
      first.current = false;
      if (!active) {
        node.textContent = ' ';
        return;
      }
    }
    const start = performance.now() + (active ? delay : 0);
    const dur = active ? duration : duration * 0.45;
    const len = text.length;
    let last = 0;
    const tick = (now: number) => {
      if (now - last >= STEP || now - start >= dur) {
        last = now;
        const t = Math.min(1, Math.max(0, (now - start) / dur));
        const locked = Math.floor((active ? t : 1 - t) * len);
        const noise = active ? 6 : 3;
        let s = '';
        for (let i = 0; i < len && i < locked + noise; i++) {
          const c = text[i];
          s += c === ' ' || i < locked ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        node.textContent = s || ' ';
        if (t >= 1) {
          node.textContent = active ? text : ' ';
          return;
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, text, duration, delay]);

  return (
    <span className={className} aria-label={text}>
      {/* React never renders text here: the effect owns this node's content */}
      <span ref={el} aria-hidden />
    </span>
  );
}
