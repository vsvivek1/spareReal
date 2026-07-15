import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const getUserVehicles = async (sellerId: string) => {
  const q = query(
    collection(db, "vehicles"),
    where("sellerId", "==", sellerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const getVehicle = async (vehicleId: string) => {
  const snapshot = await getDoc(doc(db, "vehicles", vehicleId));

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() };
};

export const getVehicleListings = async (vehicleId: string) => {
  const q = query(
    collection(db, "spareListings"),
    where("vehicleId", "==", vehicleId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

// Firestore rules can't check "are there listings referencing this
// vehicle" (no cross-collection queries in rules), so that guard has
// to live here instead — deleting the vehicle record would otherwise
// leave listings pointing at a vehicleId that no longer resolves.
export const deleteVehicle = async (vehicleId: string) => {
  const listings = await getVehicleListings(vehicleId);

  if (listings.length > 0) {
    throw new Error(
      "This vehicle still has parts listed against it. Delete or unlink those listings first."
    );
  }

  await deleteDoc(doc(db, "vehicles", vehicleId));
};

export const markVehicleFullyPartedOut = async (vehicleId: string) => {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    status: "Fully Parted Out",
  });
};

export const markVehiclePartingOut = async (vehicleId: string) => {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    status: "Parting Out",
  });
};
