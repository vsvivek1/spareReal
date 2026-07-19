// The service categories shown on the Services hub. Each service doc (stored
// in the `workshops` Firestore collection for historical reasons) carries a
// `typeSlug` used for routing/filtering and a human `type` label. Legacy
// workshop docs predate these fields, so anything without a typeSlug is
// treated as a Workshop (see normalizeServiceSlug).

export type ServiceType = {
  slug: string;
  label: string; // plural, for buttons/headings
  singular: string; // stored as the doc's `type`
  icon: string;
  blurb: string;
};

export const SERVICE_TYPES: ServiceType[] = [
  {
    slug: "workshop",
    label: "Workshops",
    singular: "Workshop",
    icon: "🔧",
    blurb: "Repair & dismantling garages",
  },
  {
    slug: "washing",
    label: "Washing Centers",
    singular: "Washing Center",
    icon: "🚿",
    blurb: "Car & bike wash",
  },
  {
    slug: "painting",
    label: "Painting Centers",
    singular: "Painting Center",
    icon: "🎨",
    blurb: "Denting & painting",
  },
  {
    slug: "petrol",
    label: "Petrol Pumps",
    singular: "Petrol Pump",
    icon: "⛽",
    blurb: "Fuel stations",
  },
  {
    slug: "tyre",
    label: "Tyre Service",
    singular: "Tyre Service",
    icon: "🛞",
    blurb: "Tyres, puncture & alignment",
  },
];

// Catch-all bucket for user-added custom categories.
export const OTHER_SERVICE: ServiceType = {
  slug: "other",
  label: "Other Services",
  singular: "Other",
  icon: "🧰",
  blurb: "Everything else",
};

const KNOWN_SLUGS = new Set(SERVICE_TYPES.map((t) => t.slug));

// A legacy workshop doc (no typeSlug) counts as a Workshop.
export const normalizeServiceSlug = (doc: { typeSlug?: string }) =>
  doc.typeSlug || "workshop";

export const getServiceType = (slug: string): ServiceType =>
  SERVICE_TYPES.find((t) => t.slug === slug) ||
  (slug === "other" ? OTHER_SERVICE : SERVICE_TYPES[0]);

export const isKnownSlug = (slug: string) =>
  KNOWN_SLUGS.has(slug) || slug === "other";
