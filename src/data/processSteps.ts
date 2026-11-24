// Content for the "Furnace → Wafer" section. Edit text, clips and places here only.
// Clips are cut from the reference films (SK siltron "300mm Silicon Wafer Manufacturing Process",
// ABC Science "How Silicon Is Made") with the authors' permission.

import { kicker } from './chapters';

export type Site = { name: string; country: string; lat: number; lon: number };

export type MeltingIntro = {
  kicker: string;
  title: string;
  body: string;
  video: string;
  poster: string;
  specs: { label: string; value: string }[];
};

export type FabStep = {
  id: string;
  index: number;
  title: string;
  short: string;
  location: string;
  video: string;
  poster: string;
  description: string[];
  facts: { label: string; value: string }[];
  /** ISO 3166-1 numeric codes highlighted on the mini map */
  countries: string[];
  sites: Site[];
};

export const melting: MeltingIntro = {
  kicker: kicker('smelting'),
  title: 'Quartz meets fire.',
  body: 'At 1,800 °C carbon strips the oxygen from quartz. What pours out is silicon metal: 99% pure, and still far too dirty for a chip.',
  video: 'videos/melting.mp4',
  poster: 'posters/melting.jpg',
  specs: [
    { label: 'Furnace', value: '1,800 °C' },
    { label: 'Reaction', value: 'SiO₂ + 2C → Si + 2CO' },
    { label: 'Purity', value: '98–99%' },
  ],
};

const WAFER_SITES: Site[] = [
  { name: 'Shirakawa (Shin-Etsu)', country: 'Japan', lat: 37.13, lon: 140.21 },
  { name: 'Imari (SUMCO)', country: 'Japan', lat: 33.26, lon: 129.88 },
  { name: 'Hsinchu (GlobalWafers)', country: 'Taiwan', lat: 24.8, lon: 120.97 },
  { name: 'Freiberg (Siltronic)', country: 'Germany', lat: 50.92, lon: 13.34 },
  { name: 'Gumi (SK siltron)', country: 'South Korea', lat: 36.12, lon: 128.34 },
];
const WAFER_COUNTRIES = ['392', '158', '276', '410'];

export const fabSteps: FabStep[] = [
  {
    id: 'polysilicon',
    index: 1,
    title: 'Polysilicon',
    short: 'Refined to 99.999999999% and loaded into a quartz crucible.',
    location: 'Germany · USA · Japan',
    video: 'videos/step-1.mp4',
    poster: 'posters/step-1.jpg',
    description: [
      'Metallurgical silicon is turned into trichlorosilane gas, distilled over and over, and deposited back onto rods heated to about 1,100 °C. The result is polysilicon with nine to eleven nines of purity.',
      'The rods are broken into chunks and stacked by hand into a crucible made from Spruce Pine quartz. Gloves, gowns and filtered air keep a single fingerprint out of the melt.',
    ],
    facts: [
      { label: 'Purity', value: '9N–11N' },
      { label: 'Deposition', value: '≈ 1,100 °C' },
      { label: 'Largest makers', value: 'Wacker, Hemlock, Tokuyama' },
    ],
    countries: ['276', '840', '392'],
    sites: [
      { name: 'Burghausen (Wacker)', country: 'Germany', lat: 48.17, lon: 12.83 },
      { name: 'Hemlock, Michigan', country: 'USA', lat: 43.41, lon: -84.23 },
      { name: 'Shunan (Tokuyama)', country: 'Japan', lat: 34.05, lon: 131.8 },
    ],
  },
  {
    id: 'crystal',
    index: 2,
    title: 'Crystal growth',
    short: 'A seed is pulled from the melt into one perfect crystal.',
    location: 'Japan · Taiwan · Germany · South Korea',
    video: 'videos/step-2.mp4',
    poster: 'posters/step-2.jpg',
    description: [
      'The polysilicon melts at 1,414 °C. A thumb-sized seed crystal touches the surface and is drawn upward while seed and crucible turn in opposite directions.',
      'Atoms line up behind the seed, layer by layer, at 0.5–2 mm per minute. After two to three days a single crystal 300 mm across and almost two metres long hangs in the furnace.',
    ],
    facts: [
      { label: 'Melt', value: '1,414 °C' },
      { label: 'Growth time', value: '48–72 h' },
      { label: 'Ingot', value: 'Ø 300 mm · 300–400 kg' },
    ],
    countries: WAFER_COUNTRIES,
    sites: WAFER_SITES,
  },
  {
    id: 'slicing',
    index: 3,
    title: 'Grinding & slicing',
    short: 'The ingot is ground round and sawn into thin discs.',
    location: 'Japan · Taiwan · Germany · South Korea',
    video: 'videos/step-3.mp4',
    poster: 'posters/step-3.jpg',
    description: [
      'The cone-shaped ends are cut off and the body is ground to exactly 300 mm, with a small notch that marks the crystal orientation.',
      'A wire saw then runs hundreds of steel wires coated with diamond through the ingot at once, cutting it into roughly 1,600 discs in a single pass.',
    ],
    facts: [
      { label: 'Diameter', value: '300 ± 0.2 mm' },
      { label: 'Wafers per ingot', value: '≈ 1,600' },
      { label: 'Kerf loss', value: '≈ 120 µm per cut' },
    ],
    countries: WAFER_COUNTRIES,
    sites: WAFER_SITES,
  },
  {
    id: 'polishing',
    index: 4,
    title: 'Lapping & polishing',
    short: 'Saw marks are removed until the surface is a mirror.',
    location: 'Japan · Taiwan · Germany · South Korea',
    video: 'videos/step-4.mp4',
    poster: 'posters/step-4.jpg',
    description: [
      'Each wafer has its edge rounded so it will not chip, then it is lapped between rotating plates and etched to remove the damaged layer left by the saw.',
      'Chemical-mechanical polishing finishes the job. The surface ends up flatter than 50 nanometres across the whole wafer, with roughness below a tenth of a nanometre.',
    ],
    facts: [
      { label: 'Thickness', value: '775 µm' },
      { label: 'Site flatness', value: '< 50 nm' },
      { label: 'Roughness', value: '< 0.1 nm' },
    ],
    countries: WAFER_COUNTRIES,
    sites: WAFER_SITES,
  },
  {
    id: 'inspection',
    index: 5,
    title: 'Inspection & packing',
    short: 'Every wafer is scanned for particles, then sealed for the fab.',
    location: 'Japan · Taiwan · Germany · South Korea',
    video: 'videos/step-5.mp4',
    poster: 'posters/step-5.jpg',
    description: [
      'Lasers sweep each wafer and count particles far smaller than a bacterium. Shape, flatness and contamination are measured before a wafer is allowed to ship.',
      'Approved wafers go 25 at a time into sealed carriers and travel to chip factories in Taiwan, Korea, the USA and beyond. The whole journey from ingot to box takes three to four weeks.',
    ],
    facts: [
      { label: 'Per carrier', value: '25 wafers' },
      { label: 'Ingot to box', value: '21–28 days' },
      { label: 'Top 5 share', value: '> 90% of 300 mm wafers' },
    ],
    countries: WAFER_COUNTRIES,
    sites: WAFER_SITES,
  },
];
