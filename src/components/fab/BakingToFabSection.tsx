import { TEASER } from '../../data/chapters';
import { fabSteps, melting } from '../../data/processSteps';
import CircuitProcessMap from './CircuitProcessMap';
import MeltingVideo from './MeltingVideo';

/**
 * Section that follows the quartz-firing block: a full-screen furnace film whose
 * molten trace cools from orange to blue and becomes the vertical circuit route
 * through the wafer production stages. The route leaves the bottom edge of the
 * section to hand off to the next block.
 */
export default function BakingToFabSection() {
  return (
    <section id="furnace-to-wafer" className="relative isolate bg-ink">
      <MeltingVideo intro={melting} />

      <div className="mx-auto max-w-6xl px-6">
        <CircuitProcessMap steps={fabSteps} teaser={TEASER} />
      </div>
    </section>
  );
}
