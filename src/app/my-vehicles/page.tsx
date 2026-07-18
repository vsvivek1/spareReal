"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function MyVehiclesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-account?tab=vehicles");
  }, [router]);

  return null;
}
