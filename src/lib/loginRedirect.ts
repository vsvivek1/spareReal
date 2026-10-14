// Sends people to /login and back to where they were once signed in.

/** Only same-site paths are allowed back, so ?next= can't bounce users off-site. */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/";
  }

  if (raw === "/login" || raw.startsWith("/login?")) return "/";

  return raw;
}

export function loginHref(next?: string | null): string {
  const path = safeNextPath(next);
  return path === "/" ? "/login" : `/login?next=${encodeURIComponent(path)}`;
}

/** The current page (path and query), for use in click handlers. */
export function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + window.location.search;
}
