import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { kicker } from '../../data/chapters';
import { FrameStore } from '../../lib/frameStore';
import Caption from '../ui/Caption';

// Rendered Blender film as an image sequence (public/intro/frames/f000.webp …), 960×540.
const FRAMES = 514;
const FW = 960;
const FH = 540;
const CARD = 216; // card faces the camera, just before it turns to sand
const END = 511; // landscape almost fully revealed
const MARK = { x: 0.33, y: 0.68 }; // the quarry, as a share of the frame

// Scroll timeline (0..1 over the whole pinned stretch)
const T = { card: 0.3, cardOut: 0.37, land: 0.8, landOut: 0.87 };

const LEN = 1000; // pinned stretch, in vh
// pause where the card faces the viewer and the question appears
const AUTOPLAY_TO = (T.card + T.cardOut) / 2;
const SPRUCE_AT = (T.land + T.landOut) / 2;

// Guided playback speed relative to the rendered film (24 fps). 1 = real time.
const PLAYBACK = 1.2;
const FPS = 24;
// seconds for each guided glide, so the moving part of the film runs at PLAYBACK speed
const GLIDE_TO_CARD = CARD / FPS / PLAYBACK / (T.card / AUTOPLAY_TO);
const GLIDE_TO_SPRUCE = (END - CARD) / FPS / PLAYBACK / ((T.land - T.cardOut) / (SPRUCE_AT - AUTOPLAY_TO));
const frameUrl = (i: number) => `intro/frames/f${String(i).padStart(3, '0')}.webp`;
// download order: everything up to the first pause first, then the rest
const LOAD_ORDER = Array.from({ length: FRAMES }, (_, i) => i);

/**
 * Prologue: scroll-to-play film. The GPU card zooms out until it faces the viewer,
 * a question appears; it dissolves into sand and opens onto Spruce Pine, where a
 * location marker and caption appear; then the film blurs away into the next section.
 */
export default function IntroScrollFilm() {
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useRef<FrameStore | null>(null);
  const lastDrawn = useRef(-1);
  const want = useRef(0);
  const dir = useRef(1);
  const rafId = useRef(0);
  const [box, setBox] = useState({ w: 1440, h: 900, dx: 0, dy: 0, dw: 1440, dh: 810 });
  const [phase, setPhase] = useState<'start' | 'card' | 'move' | 'land' | 'out'>('start');

  const { scrollYProgress: p } = useScroll({ target: outerRef, offset: ['start start', 'end end'] });
  const rawFrame = useTransform(p, [0, T.card, T.cardOut, T.land, 1], [0, CARD, CARD, END, END]);
  const frame = useSpring(rawFrame, { stiffness: 180, damping: 34, mass: 0.6 });

  // exit: blur + fade into the page
  const blur = useTransform(p, [T.landOut + 0.02, 1], [0, 26]);
  const filter = useTransform(blur, (b) => (b < 0.3 ? 'none' : `blur(${b.toFixed(1)}px)`));
  const filmOpacity = useTransform(p, [T.landOut + 0.02, 0.985], [1, 0]);
  // while the card faces the viewer the film steps back and to the right, leaving room for the question
  const filmScale = useTransform(
    p,
    [0, T.card - 0.08, T.card, T.cardOut, T.cardOut + 0.06, T.landOut, 1],
    [1, 1, 0.56, 0.56, 1, 1, 1.08],
  );
  const filmX = useTransform(p, [T.card - 0.08, T.card, T.cardOut, T.cardOut + 0.06], ['0%', '17%', '17%', '0%']);
  const hintOpacity = useTransform(p, [0, 0.03], [1, 0]);

  // Draw at most once per screen refresh, and only when the shown frame changes.
  const paint = () => {
    rafId.current = 0;
    const c = canvasRef.current;
    const st = store.current;
    if (!c || !st) return;
    st.focus(want.current, dir.current);
    const hit = st.nearest(want.current);
    if (!hit || hit.index === lastDrawn.current) return;
    const ctx = c.getContext('2d', { alpha: false });
    if (!ctx) return;
    // canvas is exactly one frame in size; CSS object-fit: cover scales it on the GPU
    ctx.drawImage(hit.bmp, 0, 0);
    lastDrawn.current = hit.index;
  };
  const requestPaint = () => {
    if (!rafId.current) rafId.current = requestAnimationFrame(paint);
  };

  useEffect(() => {
    const st = new FrameStore(FRAMES, frameUrl);
    store.current = st;
    st.onReady = (i) => {
      if (Math.abs(i - want.current) <= 24) requestPaint();
    };
    st.focus(0, 1);
    st.load(LOAD_ORDER, 6);
    return () => {
      cancelAnimationFrame(rafId.current);
      st.dispose();
      store.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // marker placement follows the cover-fit of the canvas
  useEffect(() => {
    const fit = () => {
      const c = canvasRef.current;
      if (!c) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      const s = Math.max(w / FW, h / FH);
      setBox({ w, h, dw: FW * s, dh: FH * s, dx: (w - FW * s) / 2, dy: (h - FH * s) / 2 });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useMotionValueEvent(frame, 'change', (f) => {
    const k = Math.max(0, Math.min(FRAMES - 1, Math.round(f)));
    if (k === want.current) return;
    dir.current = k > want.current ? 1 : -1;
    want.current = k;
    requestPaint();
  });
  useMotionValueEvent(p, 'change', (v) => {
    const next =
      v < T.card - 0.02 ? 'start' : v < T.cardOut ? 'card' : v < T.land - 0.01 ? 'move' : v < T.landOut + 0.02 ? 'land' : 'out';
    setPhase((prev) => (prev === next ? prev : next));
  });

  const mx = box.dx + MARK.x * box.dw;
  const my = box.dy + MARK.y * box.dh;

  return (
    <div ref={outerRef} className="relative" style={{ height: `${LEN}vh` }}>
      {/* chapter anchors sit at the scroll position of each pause */}
      <div id="prologue" data-snap data-guide="intro" aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px" />
      <div id="spruce-pine" data-snap data-guide="intro" data-guide-duration={GLIDE_TO_SPRUCE.toFixed(2)} aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `${SPRUCE_AT * (LEN - 100)}vh` }} />
      <div data-snap data-guide="intro" data-guide-duration={GLIDE_TO_CARD.toFixed(2)} aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `${AUTOPLAY_TO * (LEN - 100)}vh` }} />
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        <motion.div className="absolute inset-0" style={{ filter, opacity: filmOpacity, scale: filmScale, x: filmX }}>
          <canvas ref={canvasRef} width={FW} height={FH} className="absolute inset-0 h-full w-full object-cover" aria-label="A GPU card zooms out, dissolves into sand and opens onto the quartz mines of Spruce Pine" role="img" />

          {/* edges fade into the page, like every film on the site */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[24%] bg-gradient-to-r from-ink via-ink/40 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-ink via-ink/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-ink via-ink/50 to-transparent" />

          {/* location marker on the quarry */}
          <motion.div
            className="pointer-events-none absolute"
            style={{ left: mx, top: my }}
            initial={false}
            animate={{ opacity: phase === 'land' ? 1 : 0, scale: phase === 'land' ? 1 : 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="300" height="190" viewBox="0 0 300 190" className="absolute" style={{ left: -130, top: -176 }} overflow="visible">
              {/* PCB-style leader: up, 45°, across */}
              <path
                d="M130 176 V110 L160 80 H290"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={phase === 'land' ? 0 : 1}
                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s' }}
              />
              <circle cx="290" cy="80" r="3.5" fill="#38BDF8" />
              <text x="170" y="70" fill="rgba(255,255,255,0.75)" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2.2">
                SPRUCE PINE
              </text>
              <text x="170" y="98" fill="rgba(255,255,255,0.45)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1.6">
                35.9° N · 82.1° W
              </text>
            </svg>
            <span className="absolute -left-6 -top-6 h-12 w-12 animate-ping rounded-full border border-trace/70" />
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-trace bg-ink/80" />
            <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-trace shadow-[0_0_12px_rgba(56,189,248,1)]" />
          </motion.div>
        </motion.div>

        {/* caption 1: the question, while the card faces the viewer */}
        <Slot show={phase === 'card'} className="bottom-[12vh]">
          <Caption
            show={phase === 'card'}
            kicker={kicker('prologue')}
            title="Ever wondered how a GPU chip is made?"
            body="Tens of billions of transistors on a sliver of silicon. Their story starts far from any factory, in a handful of sand."
            specs={[
              { label: 'Transistors', value: '≈ 80 billion' },
              { label: 'Die', value: '≈ 800 mm²' },
              { label: 'Node', value: '4 nm' },
            ]}
          />
        </Slot>

        {/* caption 2: the place */}
        <Slot show={phase === 'land'} className="top-[13vh]">
          <Caption
            show={phase === 'land'}
            kicker={kicker('spruce-pine', 'Spruce Pine, North Carolina')}
            title="The purest quartz on Earth."
            body="The granite of these Blue Ridge hills holds quartz so clean that, refined, it becomes the crucibles every silicon crystal is grown in. A few mines here supply most of the world."
            specs={[
              { label: 'Rock', value: 'Alaskite granite' },
              { label: 'Mined for', value: 'High-purity quartz' },
              { label: 'Used as', value: 'Crucibles' },
            ]}
          />
        </Slot>

        {/* scroll to play */}
        <motion.div style={{ opacity: hintOpacity }} className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400">Scroll to play</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-trace"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/** Positions a caption in the pinned stage and fades it with its phase. */
function Slot({ show, className, children }: { show: boolean; className: string; children: ReactNode }) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-x-0 ${className}`}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 24 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </motion.div>
  );
}
