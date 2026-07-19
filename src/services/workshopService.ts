import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { normalizeServiceSlug } from "@/lib/serviceTypes";

// Services (workshops, washing/painting centers, petrol pumps, tyre service,
// and custom "other" categories) all live in the `workshops` collection —
// kept as-is so existing security rules and data need no migration.

export const getAllServices = async () => {
  const snapshot = await getDocs(collection(db, "workshops"));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

// Filter by category slug. Legacy docs with no typeSlug resolve to "workshop".
export const getServicesByType = async (slug: string) => {
  const all = await getAllServices();

  return all.filter((s: any) => normalizeServiceSlug(s) === slug);
};

export const deleteService = async (serviceId: string) => {
  await deleteDoc(doc(db, "workshops", serviceId));
};

// Backwards-compatible aliases (older imports).
export const getAllWorkshops = getAllServices;
export const deleteWorkshop = deleteService;
