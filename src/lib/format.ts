// Shared display helpers for prices and list searches.

/** "12000" -> "₹12,000"; blank or invalid values read as "Price on request". */
export function formatPrice(value: unknown): string {
  const amount = Number(value);

  if (value === null || value === undefined || value === "" || !isFinite(amount)) {
    return "Price on request";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * True when every word of the query appears somewhere in the given fields,
 * so "swift brake" matches a Swift listing in the Brake category.
 */
export function matchesSearch(query: string, fields: unknown[]): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const haystack = fields
    .filter((field) => field !== null && field !== undefined && field !== "")
    .join(" ")
    .toLowerCase();

  return words.every((word) => haystack.includes(word));
}
