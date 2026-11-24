import BakingToFabSection from './components/fab/BakingToFabSection';
import IntroScrollFilm from './components/intro/IntroScrollFilm';
import ChapterRail from './components/ui/ChapterRail';
import { kicker } from './data/chapters';
import { useMagneticScroll } from './lib/useMagneticScroll';

/** Demo page: 00–01 prologue film, 02–03 furnace to wafer, then a stand-in for chapter 04. */
export default function App() {
  useMagneticScroll();
  return (
    <main className="bg-ink text-white">
      <ChapterRail />
      <IntroScrollFilm />
      <BakingToFabSection />
      <section id="lithography" className="grid min-h-[50vh] place-items-center px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">Next · {kicker('lithography', 'EUV lithography')}</p>
      </section>
    </main>
  );
}
