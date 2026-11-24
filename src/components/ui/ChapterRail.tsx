import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { chapters } from '../../data/chapters';

/**
 * Slim chapter index on the right edge. Each chapter has an element with its id
 * (a real section or an invisible anchor at the scroll position of its pause).
 */
export default function ChapterRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // chapter positions are measured only when the layout changes, not on every scroll
    let tops: number[] = [];
    let raf = 0;
    const measure = () => {
      tops = chapters.map((c) => {
        const el = document.getElementById(c.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
      update();
    };
    const update = () => {
      raf = 0;
      const mid = window.scrollY + window.innerHeight * 0.5;
      let k = 0;
      tops.forEach((t, i) => {
        if (t <= mid) k = i;
      });
      setActive((prev) => (prev === k ? prev : k));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  };

  return (
    <nav aria-label="Chapters" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <ol className="flex flex-col items-end gap-4">
        {chapters.map((c, i) => {
          const on = i === active;
          return (
            <li key={c.id}>
              <button type="button" onClick={() => go(c.id)} className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em]" aria-current={on ? 'step' : undefined}>
                <motion.span
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, x: on ? 0 : 6 }}
                  className="text-zinc-300 group-hover:opacity-100"
                >
                  {c.title}
                </motion.span>
                <span className={on ? 'text-trace' : 'text-zinc-600 transition-colors group-hover:text-zinc-300'}>{c.no}</span>
                <motion.span initial={false} animate={{ width: on ? 24 : 10 }} className={`h-px ${on ? 'bg-trace' : 'bg-zinc-600'}`} />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
