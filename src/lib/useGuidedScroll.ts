import { animate } from 'framer-motion';
import { useEffect } from 'react';

type Stop = { t: number; d?: number };

const DOWN_KEYS = ['ArrowDown', 'PageDown', ' ', 'Spacebar'];
const UP_KEYS = ['ArrowUp', 'PageUp', 'Home'];

/**
 * Guided scroll for the scroll-driven films. Inside a zone (elements sharing a
 * [data-guide="zone"] value mark its stops), one downward gesture plays the
 * scene by itself to the next stop. Scrolling up is always free and manual,
 * and cancels a glide in progress.
 */
export function useGuidedScroll({ pace = 0.55, min = 0.8, max = 3.2 } = {}) {
  useEffect(() => {
    let anim: ReturnType<typeof animate> | null = null;
    let quietTimer = 0;
    let waitForQuiet = false; // swallow trackpad momentum after a glide
    let touchY = 0;

    const zones = () => {
      const y0 = window.scrollY;
      const map = new Map<string, Stop[]>();
      document.querySelectorAll<HTMLElement>('[data-guide]').forEach((el) => {
        const z = el.dataset.guide!;
        const t = Math.round(el.getBoundingClientRect().top + y0);
        const d = Number(el.dataset.guideDuration);
        map.set(z, [...(map.get(z) ?? []), { t, d: Number.isFinite(d) && d > 0 ? d : undefined }]);
      });
      return [...map.values()].map((v) => v.sort((a, b) => a.t - b.t));
    };

    const nextStop = (y: number) => {
      for (const stops of zones()) {
        if (y >= stops[0].t - 4 && y < stops[stops.length - 1].t - 4) return stops.find((s) => s.t > y + 4) ?? null;
      }
      return null;
    };

    const stop = () => {
      anim?.stop();
      anim = null;
      window.__guidedScroll = false;
    };

    const quiet = () => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(() => {
        waitForQuiet = false;
      }, 220);
    };

    const glide = ({ t: target, d }: Stop) => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      // a stop can ask for its own duration (films play at a set speed); otherwise scale with distance
      const duration = d ?? Math.min(max, Math.max(min, 0.5 + (Math.abs(target - y) / vh) * pace));
      window.__guidedScroll = true;
      anim = animate(y, target, {
        duration,
        ease: d ? [0.3, 0, 0.75, 1] : [0.45, 0, 0.2, 1],
        onUpdate: (v) => window.scrollTo(0, v),
        onComplete: () => {
          anim = null;
          window.__guidedScroll = false;
          waitForQuiet = true;
          quiet();
        },
      });
    };

    // returns true when the down gesture was taken over
    const down = (e: Event) => {
      if (document.body.style.overflow === 'hidden') return false; // modal open
      if (anim || waitForQuiet) {
        e.preventDefault();
        if (waitForQuiet) quiet();
        return true;
      }
      const target = nextStop(window.scrollY);
      if (target === null) return false;
      e.preventDefault();
      glide(target);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        if (anim) stop();
        waitForQuiet = false;
        return; // up: free
      }
      if (e.deltaY > 0) down(e);
    };
    const onKey = (e: KeyboardEvent) => {
      if (UP_KEYS.includes(e.key)) {
        if (anim) stop();
        return;
      }
      if (DOWN_KEYS.includes(e.key)) {
        const t = e.target as HTMLElement | null;
        if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'BUTTON'].includes(t.tagName))) return;
        if (anim) {
          e.preventDefault();
          return;
        }
        down(e);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - (e.touches[0]?.clientY ?? touchY);
      if (dy < -6) {
        if (anim) stop();
        return; // finger down = page up: free
      }
      if (dy > 6) down(e);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      stop();
      window.clearTimeout(quietTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [pace, min, max]);
}
