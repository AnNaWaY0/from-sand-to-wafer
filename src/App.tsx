import BakingToFabSection from './components/fab/BakingToFabSection';
import IntroScrollFilm from './components/intro/IntroScrollFilm';
import ChapterRail from './components/ui/ChapterRail';
import { kicker, TEASER } from './data/chapters';
import { useGuidedScroll } from './lib/useGuidedScroll';
import { useMagneticScroll } from './lib/useMagneticScroll';

/** Demo page: 00–01 prologue film, 02–03 furnace to wafer, then a stand-in for chapter 04. */
export default function App() {
  useMagneticScroll({ radius: 0.5, idle: 90, duration: 0.55 });
  useGuidedScroll();
  return (
    <main className="bg-ink text-white">
      <ChapterRail />
      <IntroScrollFilm />
      <BakingToFabSection />
      {TEASER ? (
        <section className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-trace">Work in progress</p>
            <p className="mt-4 font-display text-2xl font-medium tracking-[-0.02em] text-zinc-300 md:text-3xl">To be continued.</p>
          </div>
        </section>
      ) : (
        <section id="lithography" className="grid min-h-[50vh] place-items-center px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Next · {kicker('lithography', 'EUV lithography')}</p>
        </section>
      )}
    </main>
  );
}
