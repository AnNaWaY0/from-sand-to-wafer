import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { MeltingIntro } from '../../data/processSteps';
import Caption from '../ui/Caption';

type Props = { intro: MeltingIntro };

/**
 * Full-bleed furnace film. No frame: the page background melts into the video at
 * the top and sides, the bottom fades to near-black and carries the text.
 * A molten trace leaves the bottom edge and continues into the next part.
 */
export default function MeltingVideo({ intro }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // entering: fade + slow zoom-out; leaving: slight push-in and dim
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.14, 1, 1.06]);
  const opacity = useTransform(scrollYProgress, [0, 0.32, 0.72, 1], [0, 1, 1, 0.35]);
  const textY = useTransform(scrollYProgress, [0.3, 0.5, 0.75, 1], [40, 0, 0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.45, 0.75, 0.92], [0, 1, 1, 0]);
  const stub = useTransform(scrollYProgress, [0.45, 0.62], [0, 1]);

  return (
    <div ref={ref} id="smelting" data-snap data-guide="intro" className="relative h-screen min-h-[640px] w-full overflow-hidden">
      <motion.video
        style={{ scale, opacity }}
        className="absolute inset-0 h-full w-full object-cover"
        src={intro.video}
        poster={intro.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="Submerged arc furnace: glowing charge, tapping and pouring liquid silicon"
      />

      {/* background flows into the film: top, sides, bottom */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-ink via-ink/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[22%] bg-gradient-to-r from-ink via-ink/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[22%] bg-gradient-to-l from-ink via-ink/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_50%_45%,transparent_45%,rgba(9,9,11,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      {/* quiet editorial caption, bottom-left */}
      <motion.div style={{ y: textY, opacity: textOpacity }} className="absolute inset-x-0 bottom-[12vh]">
        <div className="mx-auto max-w-6xl px-6">
          <Caption tone="molten" kicker={intro.kicker} title={intro.title} body={intro.body} specs={intro.specs} />
        </div>
      </motion.div>

      {/* the molten trace starts here */}
      <motion.div
        aria-hidden
        style={{ scaleY: stub, transformOrigin: 'top' }}
        className="absolute bottom-0 left-1/2 h-[10vh] w-[2px] -translate-x-1/2 bg-gradient-to-b from-molten/0 to-molten shadow-[0_0_16px_rgba(249,115,22,0.9)]"
      />
    </div>
  );
}
