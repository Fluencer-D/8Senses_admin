"use client"
import React, { useEffect, useState } from "react";
import Navbar from "./navbar/page";
import Sidebar from "./sidebar/page";
import { useRouter } from "next/router";
import { getAdminToken } from "@/utils/storage";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar state

  useEffect(()=>{
    getAdminToken();
  },[]);
  // const router = useRouter();

  if(!getAdminToken()){
    // router.replace("/")
  }

  return (
    <div className="flex">
      {/* Sidebar Component */}
      {
        getAdminToken() && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      }

      <div className="flex-1">
        {/* Navbar Component */}
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
