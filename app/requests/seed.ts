// Model ideas already on Vivatheca's list (from the 6 Nov 2026 audit of unbuilt features and the
// shortlist of next models), shown on /requests so visitors can support them. Words are in
// t.requests.seeds[id] in both dictionaries. The Worker (worker/store.ts) accepts votes for these ids.
export const seededRequests = [
  { id: 'prosth-edentulous' },
  { id: 'ectopic-canine' },
  { id: 'development-extended' },
  { id: 'ortho-variants' },
  { id: 'oral-lichen-planus' },
  { id: 'cleft' },
  { id: 'cbct-slices' },
] as const;

export type SeededRequestId = (typeof seededRequests)[number]['id'];
