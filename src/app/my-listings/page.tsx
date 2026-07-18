"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function MyListingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-account?tab=listings");
  }, [router]);

  return null;
}
