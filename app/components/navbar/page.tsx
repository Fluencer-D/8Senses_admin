"use client";
import { Bell, Mail, Menu, Search } from "lucide-react";
import NavbarAvatar from '@/public/NavbarAvatar.png'
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
    className={`transition-all duration-300 ${
      isOpen ? "w-[82%] left-70" : "w-full left-0"
    } h-16 flex items-center justify-between px-6 bg-white fixed top-0 z-10 border-l-1`}
  >      {/* Left: Menu Button */}
      <button className="text-gray-600 hover:text-gray-900" onClick={toggleSidebar}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7Z" fill="#667085"/>
  <path d="M3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12Z" fill="#667085"/>
  <path d="M4 16C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18H20C20.5523 18 21 17.5523 21 17C21 16.4477 20.5523 16 20 16H4Z" fill="#667085"/>
</svg>
      </button>

      

      {/* Right Section */}
      <div className="flex items-center space-x-8">
      <button className="text-gray-600 hover:text-gray-900">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fillRule="evenodd" clipRule="evenodd" d="M14.7847 16.1988C11.6462 18.6414 7.10654 18.4202 4.22181 15.5355C1.09761 12.4113 1.09761 7.346 4.22181 4.22181C7.346 1.09761 12.4113 1.09761 15.5355 4.22181C18.4202 7.10653 18.6414 11.6462 16.1989 14.7846L20.4853 19.0711C20.8758 19.4616 20.8758 20.0948 20.4853 20.4853C20.0948 20.8758 19.4616 20.8758 19.0711 20.4853L14.7847 16.1988ZM5.63602 14.1213C7.97917 16.4644 11.7782 16.4644 14.1213 14.1213C16.4644 11.7782 16.4644 7.97917 14.1213 5.63602C11.7782 3.29288 7.97917 3.29288 5.63602 5.63602C3.29288 7.97917 3.29288 11.7782 5.63602 14.1213Z" fill="#667085"/>
</svg>      </button>
        {/* Notifications */}
        <div className="relative cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fillRule="evenodd" clipRule="evenodd" d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V3.57088C7.60769 4.0561 4.99997 6.97352 4.99997 10.5V15.5L4.28237 16.7558C3.71095 17.7558 4.433 19 5.58474 19H8.12602C8.57006 20.7252 10.1362 22 12 22C13.8638 22 15.4299 20.7252 15.874 19H18.4152C19.5669 19 20.289 17.7558 19.7176 16.7558L19 15.5V10.5C19 6.97354 16.3923 4.05614 13 3.57089V3ZM6.99997 16.0311L6.44633 17H17.5536L17 16.0311V10.5C17 7.73858 14.7614 5.5 12 5.5C9.23854 5.5 6.99997 7.73858 6.99997 10.5V16.0311ZM12 20C11.2597 20 10.6134 19.5978 10.2676 19H13.7324C13.3866 19.5978 12.7403 20 12 20Z" fill="#667085"/>
</svg>          <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold rounded-full px-1.5">
            3
          </span>
        </div>

        {/* Messages */}
        <div className="relative cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fillRule="evenodd" clipRule="evenodd" d="M2 7C2 5.34315 3.34315 4 5 4H19C20.6569 4 22 5.34315 22 7V17C22 18.6569 20.6569 20 19 20H5C3.34315 20 2 18.6569 2 17V7ZM18.3334 6H5.6667L11.4 10.3C11.7556 10.5667 12.2445 10.5667 12.6 10.3L18.3334 6ZM4 7.24998V17C4 17.5523 4.44772 18 5 18H19C19.5523 18 20 17.5523 20 17V7.25002L13.8 11.9C12.7334 12.7 11.2667 12.7 10.2 11.9L4 7.24998Z" fill="#667085"/>
</svg>          <span className="absolute -top-2.5 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
            64
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <Image
            src={NavbarAvatar} // Replace with actual profile image
            alt="User Profile"
            width={45}
            height={45}
            className="rounded-full"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-[#1A1C21]">Shruti Patil</span>
            <span className="text-xs font-semibold text-[#667085]">Doctor</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path fillRule="evenodd" clipRule="evenodd" d="M15.5893 6.9107C15.2638 6.58527 14.7362 6.58527 14.4108 6.9107L10 11.3214L5.58928 6.9107C5.26384 6.58527 4.7362 6.58527 4.41077 6.9107C4.08533 7.23614 4.08533 7.76378 4.41077 8.08921L9.70539 13.3838C9.86811 13.5466 10.1319 13.5466 10.2946 13.3838L15.5893 8.08921C15.9147 7.76378 15.9147 7.23614 15.5893 6.9107Z" fill="#667085"/>
</svg>
        </div>
      </div>
    </header>
  );
};
export default Navbar;