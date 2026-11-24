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
            variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
          >
            {w}
            {' '}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
