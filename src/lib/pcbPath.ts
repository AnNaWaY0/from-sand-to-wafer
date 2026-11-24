// PCB-style routing: every connection is built from straight runs and 45° diagonals only.
export type Pt = { x: number; y: number };

/**
 * Route from a to b with one horizontal/vertical run and one 45° diagonal.
 * `diagFirst` places the diagonal at the start instead of the end.
 */
function route(a: Pt, b: Pt, diagFirst = false): Pt[] {
  const dx = b.x - a.x, dy = b.y - a.y;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (adx === 0 || ady === 0 || adx === ady) return [a, b];
  const sx = Math.sign(dx), sy = Math.sign(dy);
  if (adx > ady) {
    const run = adx - ady;
    const mid = diagFirst ? { x: a.x + sx * ady, y: b.y } : { x: a.x + sx * run, y: a.y };
    return [a, mid, b];
  }
  const run = ady - adx;
  const mid = diagFirst ? { x: b.x, y: a.y + sy * adx } : { x: a.x, y: a.y + sy * run };
  return [a, mid, b];
}

/** Chamfer each corner a little so bends read like etched copper, not polyline joints. */
function toPathD(pts: Pt[], chamfer = 10): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1], p = pts[i], p1 = pts[i + 1];
    const l0 = Math.hypot(p.x - p0.x, p.y - p0.y), l1 = Math.hypot(p1.x - p.x, p1.y - p.y);
    const c = Math.min(chamfer, l0 / 2, l1 / 2);
    const a = { x: p.x - ((p.x - p0.x) / l0) * c, y: p.y - ((p.y - p0.y) / l0) * c };
    const b = { x: p.x + ((p1.x - p.x) / l1) * c, y: p.y + ((p1.y - p.y) / l1) * c };
    d += ` L ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${p.x} ${p.y} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L ${last.x} ${last.y}`;
}

function polyLength(pts: Pt[]) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return s;
}

/**
 * Builds the main trace through `stops`. Returns the path and, for every stop,
 * its position along the trace as a 0–1 fraction (used to light the via pads).
 */
export function pcbPath(stops: Pt[], opts: { diagFirst?: boolean[]; chamfer?: number } = {}) {
  const pts: Pt[] = [stops[0]];
  const stopAt: number[] = [0];
  for (let i = 1; i < stops.length; i++) {
    const seg = route(stops[i - 1], stops[i], opts.diagFirst?.[i - 1]);
    pts.push(...seg.slice(1));
    stopAt.push(pts.length - 1);
  }
  const total = polyLength(pts);
  const fractions = stopAt.map((idx) => polyLength(pts.slice(0, idx + 1)) / total);
  return { d: toPathD(pts, opts.chamfer), fractions, total };
}

/** Deterministic pseudo-random generator so background traces never change between renders. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Decorative background traces: short 45° routes with a pad at each end. */
export function backgroundTraces(w: number, h: number, count: number, seed = 7) {
  const rnd = seeded(seed);
  const grid = 24;
  const snap = (v: number) => Math.round(v / grid) * grid;
  const out: { d: string; ends: Pt[] }[] = [];
  for (let i = 0; i < count; i++) {
    const a = { x: snap(rnd() * w), y: snap(rnd() * h) };
    const len = 80 + rnd() * 260;
    const ang = Math.floor(rnd() * 8) * (Math.PI / 4);
    const b = { x: snap(a.x + Math.cos(ang) * len), y: snap(a.y + Math.sin(ang) * len * 0.6) };
    const pts = route(a, b, rnd() > 0.5);
    out.push({ d: toPathD(pts, 6), ends: [a, b] });
  }
  return out;
}
