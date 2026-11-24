/**
 * Image-sequence store for scroll-driven films.
 *
 * - Every frame is downloaded once as a small compressed Blob (≈40 KB).
 * - Only frames near the playhead are decoded into ImageBitmaps (off the main
 *   thread), with more room ahead in the direction of travel; the rest are freed.
 * - `nearest()` always returns something drawable immediately, so a frame that
 *   is still decoding never stalls the picture.
 */
export class FrameStore {
  private blobs: (Blob | null)[];
  private bitmaps = new Map<number, ImageBitmap>();
  private decoding = new Set<number>();
  private closed = false;
  private at = 0;
  private dir = 1;

  /** called when a frame near the playhead becomes drawable */
  onReady?: (i: number) => void;

  constructor(
    readonly count: number,
    private url: (i: number) => string,
    private opts = { ahead: 36, behind: 12, maxDecodes: 4 },
  ) {
    this.blobs = new Array(count).fill(null);
  }

  /** download frames in the given order with a few parallel requests */
  load(order: number[], concurrency = 6) {
    let k = 0;
    const next = () => {
      if (this.closed || k >= order.length) return;
      const i = order[k++];
      fetch(this.url(i))
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => {
          if (!b || this.closed) return;
          this.blobs[i] = b;
          if (Math.abs(i - this.at) <= this.opts.ahead) this.pump();
        })
        .catch(() => undefined)
        .finally(next);
    };
    for (let c = 0; c < concurrency; c++) next();
  }

  /** move the playhead; decodes around it and frees what is far away */
  focus(at: number, dir: number) {
    this.at = at;
    if (dir) this.dir = dir;
    this.evict();
    this.pump();
  }

  /** best frame to draw right now: the exact one, else the closest decoded neighbour */
  nearest(i: number): { index: number; bmp: ImageBitmap } | null {
    const exact = this.bitmaps.get(i);
    if (exact) return { index: i, bmp: exact };
    for (let d = 1; d <= 24; d++) {
      // prefer the frame we are coming from, so motion never jumps ahead
      const a = this.bitmaps.get(i - d * this.dir);
      if (a) return { index: i - d * this.dir, bmp: a };
      const b = this.bitmaps.get(i + d * this.dir);
      if (b) return { index: i + d * this.dir, bmp: b };
    }
    return null;
  }

  dispose() {
    this.closed = true;
    this.bitmaps.forEach((b) => b.close());
    this.bitmaps.clear();
  }

  private range() {
    const { ahead, behind } = this.opts;
    return this.dir >= 0 ? [this.at - behind, this.at + ahead] : [this.at - ahead, this.at + behind];
  }

  private evict() {
    const [lo, hi] = this.range();
    this.bitmaps.forEach((b, i) => {
      if (i < lo - 8 || i > hi + 8) {
        b.close();
        this.bitmaps.delete(i);
      }
    });
  }

  private pump() {
    if (this.closed || typeof createImageBitmap !== 'function') return;
    const [lo, hi] = this.range();
    const reach = Math.max(this.at - lo, hi - this.at);
    // walk outwards from the playhead, the direction of travel first
    for (let d = 0; d <= reach && this.decoding.size < this.opts.maxDecodes; d++) {
      for (const i of [this.at + d * this.dir, this.at - d * this.dir]) {
        if (i < lo || i > hi || i < 0 || i >= this.count) continue;
        if (this.bitmaps.has(i) || this.decoding.has(i) || !this.blobs[i]) continue;
        if (this.decoding.size >= this.opts.maxDecodes) break;
        this.decode(i);
      }
    }
  }

  private decode(i: number) {
    this.decoding.add(i);
    createImageBitmap(this.blobs[i]!)
      .then((bmp) => {
        this.decoding.delete(i);
        const [lo, hi] = this.range();
        if (this.closed || i < lo - 8 || i > hi + 8) {
          bmp.close();
        } else {
          this.bitmaps.set(i, bmp);
          this.onReady?.(i);
        }
        this.pump();
      })
      .catch(() => {
        this.decoding.delete(i);
      });
  }
}
