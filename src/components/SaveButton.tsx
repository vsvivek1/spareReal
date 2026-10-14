"use client";

import { useSavedListings } from "@/lib/prefs";

// Heart toggle for a listing. Floats over the card photo by default.
export default function SaveButton({
  id,
  floating = true,
}: {
  id: string;
  floating?: boolean;
}) {
  const { isSaved, toggle } = useSavedListings();
  const saved = isSaved(id);

  return (
    <button
      type="button"
      className={
        "gx-save-btn" +
        (saved ? " gx-save-btn-on" : "") +
        (floating ? " gx-save-btn-floating" : "")
      }
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save this part"}
      title={saved ? "Saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      {saved ? "♥" : "♡"}
      {!floating && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
