"use client"; 

import { useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { getAdminToken } from "@/utils/storage";

export default function Home() {
  const router = useRouter();

  if(getAdminToken()){
    // router.replace("/"); 
  }

  useEffect(() => {
    router.replace("/admin"); 
  }, [router]);

  return null;
}
