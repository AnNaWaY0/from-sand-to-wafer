import { motion } from 'framer-motion';

type Props = { text: string; className?: string; delay?: number; as?: 'h2' | 'h3' | 'p'; show?: boolean };

/** Words rise out of a mask one after another when the line enters the viewport (or when `show` turns true). */
export default function RevealText({ text, className, delay = 0, as = 'h2', show }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      {...(show === undefined
        ? { whileInView: 'show', viewport: { once: true, amount: 0.6 } }
        : { animate: show ? 'show' : 'hidden' })}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
      aria-label={text}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%', opacity: 0, filter: 'blur(4px)', transition: { duration: 0.25, ease: 'easeIn' } },
              show: {
                y: '0%',
                filter: 'blur(0px)',
                // brief digital flicker as each word locks in
                opacity: [0, 1, 0.35, 1],
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.5, times: [0, 0.4, 0.6, 1] } },
              },
            }}
          >
            {w}
            {' '}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
