"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { getAdminToken } from "@/utils/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      router.replace("/dashbaord"); // or some secure route
    } else {
      router.replace("/admin");
    }
  }, [router]);

  return null;
}
