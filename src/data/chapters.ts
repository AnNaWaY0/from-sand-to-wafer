// Single source of truth for chapter order and numbering across the site.
export type Chapter = { id: string; no: string; title: string };

export const chapters: Chapter[] = [
  { id: 'prologue', no: '00', title: 'Prologue' },
  { id: 'spruce-pine', no: '01', title: 'Spruce Pine' },
  { id: 'smelting', no: '02', title: 'Smelting' },
  { id: 'wafer-line', no: '03', title: 'Wafer line' },
  { id: 'lithography', no: '04', title: 'Lithography' },
];

export const chapter = (id: string): Chapter => {
  const c = chapters.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown chapter ${id}`);
  return c;
};

/** "02 — Smelting" (or a custom label after the dash) */
export const kicker = (id: string, label?: string) => `${chapter(id).no} — ${label ?? chapter(id).title}`;

/**
 * Teaser build for presenting work in progress: the story stops at the chapter 03 heading.
 * On when the site is served from the "-preview" repository, or with ?teaser in the URL.
 */
export const TEASER =
  typeof window !== 'undefined' &&
  (/-preview(\/|$)/.test(window.location.pathname) || new URLSearchParams(window.location.search).has('teaser'));

/** chapters shown in this build */
export const visibleChapters = TEASER ? chapters.filter((c) => c.id !== 'lithography') : chapters;
