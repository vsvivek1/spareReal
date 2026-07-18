"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function MyRequestsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-account?tab=requests");
  }, [router]);

  return null;
}
