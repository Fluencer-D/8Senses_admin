"use client"
import React, { useState } from "react";
import Navbar from "./navbar/page";
import Sidebar from "./sidebar/page";
import { useRouter } from "next/router";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar state
  // const router = useRouter();

  if(!localStorage.getItem("adminToken")){
    // router.replace("/")
  }

  return (
    <div className="flex">
      {/* Sidebar Component */}
      {
        localStorage.getItem("adminToken") && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
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
