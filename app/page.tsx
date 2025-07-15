"use client"; 

import { useEffect } from "react";
import { useRouter } from "next/navigation"; 

export default function Home() {
  const router = useRouter();

  if(localStorage.getItem("adminToken")){
    // router.replace("/"); 
  }

  useEffect(() => {
    router.replace("/admin"); 
  }, [router]);

  return null;
}
