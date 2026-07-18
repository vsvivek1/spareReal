import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

export const getAllWorkshops = async () => {
  const snapshot = await getDocs(collection(db, "workshops"));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const deleteWorkshop = async (workshopId: string) => {
  await deleteDoc(doc(db, "workshops", workshopId));
};
