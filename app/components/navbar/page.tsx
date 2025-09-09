"use client";
import { Menu } from "lucide-react";
import { getAdminToken } from "@/utils/storage";
import { useRouter } from "next/navigation";

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminDetails");

    // router.push("/admin");
    window.location.href = `${router.basePath || "/admin"}`;

  };

  return (
    <header
      className={`transition-all font-sans duration-300 fixed top-0 z-10 border-l-1 bg-white h-16 flex items-center justify-between px-6`}
      style={{
        width: isOpen && getAdminToken() ? "88%" : "100%",
        left: isOpen && getAdminToken() ? "11.1%" : "0", // ✅ keeps alignment correct
      }}
    >
      {/* Left: Menu Button */}
      <button
        onClick={toggleSidebar}
        className="text-gray-600 hover:text-gray-900 md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Center: Title */}
      <h3 className="text-blue-600 text-xl font-bold"></h3>

      {/* Right: Logout Button */}
      {
        getAdminToken()
        &&
        <button
          onClick={handleLogout}
          className="px-4 py-2 mr-8 text-white bg-red-500 hover:bg-red-600 rounded-md transition"
        >
          Logout
        </button>
      }
    </header>
  );
};

export default Navbar;
