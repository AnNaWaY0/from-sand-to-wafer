import RevealText from '../fab/RevealText';

export type Spec = { label: string; value: string };

type Props = {
  kicker: string;
  title: string;
  body: string;
  specs?: Spec[];
  tone?: 'trace' | 'molten';
  /** drive the headline reveal from outside; omit to reveal when scrolled into view */
  show?: boolean;
};

const TONE = {
  trace: { text: 'text-trace', rule: 'bg-trace/70' },
  molten: { text: 'text-molten', rule: 'bg-molten/70' },
};

/**
 * The one caption style used across the site: mono kicker with a short rule,
 * masked headline, quiet body, optional spec row. Positioning is up to the parent.
 */
export default function Caption({ kicker, title, body, specs, tone = 'trace', show }: Props) {
  const t = TONE[tone];
  return (
    <div className="w-full max-w-sm">
      <p className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] ${t.text}`}>
        <span className={`h-px w-8 ${t.rule}`} />
        {kicker}
      </p>
      <RevealText
        show={show}
        text={title}
        className="mt-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text font-display text-3xl font-medium leading-[1.05] tracking-[-0.02em] text-transparent md:text-[44px]"
      />
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">{body}</p>
      {specs && (
        <dl className="mt-6 flex gap-5 border-t border-white/10 pt-4">
          {specs.map((s) => (
            <div key={s.label}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">{s.label}</dt>
              <dd className="mt-1 whitespace-nowrap font-mono text-[12px] text-zinc-200">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
