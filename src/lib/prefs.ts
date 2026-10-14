"use client";

import { useCallback, useSyncExternalStore } from "react";

// Per-device preferences kept in localStorage: saved parts and the
// vehicle you drive. They need no login and no Firestore rules, which
// keeps them working before the rules deploy lands; sync can come later.

const SAVED_KEY = "sparex.savedListings";
const GARAGE_KEY = "sparex.garage";

export type GarageVehicle = {
  make: string;
  model: string;
  year?: string;
  regNo?: string;
};

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
};

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const write = (key: string, value: unknown) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage full: the UI simply won't remember.
  }
  emit();
};

const parse = <T,>(raw: string, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

// Cache parsed values per raw string so snapshots stay referentially
// stable between renders (useSyncExternalStore requires that).
const cache = new Map<string, unknown>();
const cached = <T,>(raw: string, fallback: T): T => {
  const key = raw || "__empty__";
  if (!cache.has(key)) cache.set(key, parse(raw, fallback));
  return cache.get(key) as T;
};

const EMPTY: string[] = [];

export function useSavedListings() {
  const ids = useSyncExternalStore(
    subscribe,
    () => cached<string[]>(read(SAVED_KEY), EMPTY),
    () => EMPTY
  );

  const toggle = useCallback(
    (id: string) => {
      const current = cached<string[]>(read(SAVED_KEY), EMPTY);
      write(
        SAVED_KEY,
        current.includes(id)
          ? current.filter((x) => x !== id)
          : [id, ...current]
      );
    },
    []
  );

  return { savedIds: ids, isSaved: (id: string) => ids.includes(id), toggle };
}

export function useGarage() {
  const vehicle = useSyncExternalStore(
    subscribe,
    () => cached<GarageVehicle | null>(read(GARAGE_KEY), null),
    () => null
  );

  const setVehicle = useCallback((next: GarageVehicle | null) => {
    write(GARAGE_KEY, next);
  }, []);

  return { vehicle, setVehicle };
}

export const garageLabel = (v: GarageVehicle) =>
  [v.make, v.model, v.year].filter(Boolean).join(" ") +
  (v.regNo ? `, ${v.regNo}` : "");

/** Does a listing fit the garage vehicle? Same make, and model if both known. */
export const fitsVehicle = (
  item: { make?: string; model?: string; vehicle?: string },
  v: GarageVehicle | null
) => {
  if (!v) return true;

  const make = v.make.toLowerCase();
  const model = v.model.toLowerCase();

  const itemMake = (item.make || "").toLowerCase();
  const itemModel = (item.model || "").toLowerCase();
  const legacy = (item.vehicle || "").toLowerCase();

  if (itemMake) {
    if (itemMake !== make) return false;
    return !model || !itemModel || itemModel.includes(model) || model.includes(itemModel);
  }

  // Older listings only have a free-text vehicle string.
  return legacy.includes(make) || (!!model && legacy.includes(model));
};
