import { animate } from 'framer-motion';
import { useEffect } from 'react';

declare global {
  interface Window {
    __guidedScroll?: boolean;
  }
}

/**
 * "Magnetic" scroll: when the reader stops scrolling close to a story point
 * (any element with [data-snap]), the page glides the rest of the way so that
 * point lines up with the top of the viewport. Far from a point nothing happens,
 * and any new wheel, touch or key input cancels the glide immediately.
 */
export function useMagneticScroll({ radius = 0.3, idle = 160, duration = 0.8 } = {}) {
  useEffect(() => {
    let timer = 0;
    let anim: ReturnType<typeof animate> | null = null;
    let gliding = false;
    let lastY = window.scrollY;
    let dir = 0; // direction of the reader's last scroll: 1 down, -1 up

    const stop = () => {
      if (anim) {
        anim.stop();
        anim = null;
      }
      gliding = false;
    };

    const settle = () => {
      if (gliding || window.__guidedScroll) return;
      if (document.body.style.overflow === 'hidden') return; // a modal is open
      const y = window.scrollY;
      const vh = window.innerHeight;
      let best: number | null = null;
      // only pull forward in the direction the reader was going (never yank them back)
      const back = 0.08 * vh;
      document.querySelectorAll<HTMLElement>('[data-snap]').forEach((el) => {
        const t = el.getBoundingClientRect().top + y;
        const d = t - y;
        const ahead = dir >= 0 ? d >= -back : d <= back;
        if (ahead && Math.abs(d) <= radius * vh && (best === null || Math.abs(d) < Math.abs(best - y))) best = t;
      });
      if (best === null || Math.abs(best - y) < 3) return;
      gliding = true;
      anim = animate(y, best, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => window.scrollTo(0, v),
        onComplete: () => {
          gliding = false;
          anim = null;
        },
      });
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (!gliding && !window.__guidedScroll && y !== lastY) dir = y > lastY ? 1 : -1;
      lastY = y;
      if (gliding) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, idle);
    };
    const onInput = () => {
      if (gliding) stop();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });
    window.addEventListener('keydown', onInput);
    return () => {
      window.clearTimeout(timer);
      stop();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
      window.removeEventListener('keydown', onInput);
    };
  }, [radius, idle, duration]);
}
