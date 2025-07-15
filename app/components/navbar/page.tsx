"use client";
import { Bell, Mail, Menu, Search } from "lucide-react";
import NavbarAvatar from "@/public/NavbarAvatar.png";
import Image from "next/image";
interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void; // Ensuring setIsOpen receives a boolean
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, setIsOpen }) => {
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <header
      className={`transition-all font-sans duration-300 ${
        isOpen ? "w-[86%] left-70" : "w-full left-0"
      } h-16 flex items-center justify-between px-6 bg-white fixed top-0 z-10 border-l-1`}
    >
      {" "}
      {/* Left: Menu Button */}

      {/* Right Section */}
      <div className="flex items-center space-x-8">
        <button className="text-gray-600 hover:text-gray-900">
          
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          {/* <Image
            src={NavbarAvatar} // Replace with actual profile image
            alt="User Profile"
            width={45}
            height={45}
            className="rounded-full"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-[#1A1C21]">
              Shruti Patil
            </span>
            <span className="text-xs font-semibold text-[#667085]">Doctor</span>
          </div> */}
          <h3 className="text-blue-600 text-xl font-bold">Admin Panel</h3>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
