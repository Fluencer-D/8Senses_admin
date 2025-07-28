"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminToken } from "@/utils/storage";

interface InventoryItem {
  _id: string;
  image?: string;
  name: string; // Changed from productName to match API
  category: string;
  quantity: number; // Changed from stockLevel to match API
  stockStatus: string; // Changed from status to match API
}

const Inventory = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = getAdminToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/all-inventory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch inventory");

        const data = await res.json();
        console.log(data); //debug
        console.log(data);
        setInventoryData(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredData = inventoryData.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-700";
      case "Low Stock":
        return "bg-red-100 text-red-500";
      case "Out of Stock":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const goToPage = (page: number) => setCurrentPage(page);

  if (loading) return <div className="p-6">Loading inventory...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      <h1 className="text-[#333843] text-3xl">Inventory</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer">E-commerce</span> &gt;{" "}
          <span className="text-gray-800 font-semibold">Inventory</span>
        </div>

        {/* Export Button */}
        {/* <div>
          <button className="flex items-center gap-2 bg-[#C83C92] text-white px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="2 2 20 20"
              fill="none"
            >
              <g clipPath="url(#clip0_786_597)">
                <path
                  d="M15.7071 7.20706C15.3166 7.59758 14.6834 7.59758 14.2929 7.20706L13 5.91417V15.5C13 16.0522 12.5523 16.5 12 16.5C11.4477 16.5 11 16.0522 11 15.5V5.91417L9.70711 7.20706C9.31658 7.59758 8.68342 7.59758 8.29289 7.20706C7.90237 6.81654 7.90237 6.18337 8.29289 5.79285L11.6464 2.43929C11.8417 2.24403 12.1583 2.24403 12.3536 2.43929L15.7071 5.79285C16.0976 6.18337 16.0976 6.81654 15.7071 7.20706Z"
                  fill="white"
                />
                <path
                  d="M18 8.49996C20.2091 8.49996 22 10.2908 22 12.5V17.5C22 19.7091 20.2091 21.5 18 21.5H6C3.79086 21.5 2 19.7091 2 17.5V12.5C2 10.2908 3.79086 8.49996 6 8.49996H8C8.55229 8.49996 9 8.94767 9 9.49996C9 10.0522 8.55229 10.5 8 10.5H6C4.89543 10.5 4 11.3954 4 12.5V17.5C4 18.6045 4.89543 19.5 6 19.5H18C19.1046 19.5 20 18.6045 20 17.5V12.5C20 11.3954 19.1046 10.5 18 10.5H16C15.4477 10.5 15 10.0522 15 9.49996C15 8.94767 15.4477 8.49996 16 8.49996H18Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_786_597">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Export
          </button>
        </div> */}
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            className="bg-white border border-[#E0E2E7] text-[#858D9D] text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date and Filter Buttons */}
        <div className="flex gap-3">
          {/* <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.5 2.49996C7.5 2.03972 7.1269 1.66663 6.66667 1.66663C6.20643 1.66663 5.83333 2.03972 5.83333 2.49996H5C3.61929 2.49996 2.5 3.61925 2.5 4.99996V15.8333C2.5 17.214 3.61929 18.3333 5 18.3333H15C16.3807 18.3333 17.5 17.214 17.5 15.8333V4.99996C17.5 3.61925 16.3807 2.49996 15 2.49996H14.1667C14.1667 2.03972 13.7936 1.66663 13.3333 1.66663C12.8731 1.66663 12.5 2.03972 12.5 2.49996H7.5ZM15.8333 5.83329V4.99996C15.8333 4.53972 15.4602 4.16663 15 4.16663H14.1667C14.1667 4.62686 13.7936 4.99996 13.3333 4.99996C12.8731 4.99996 12.5 4.62686 12.5 4.16663H7.5C7.5 4.62686 7.1269 4.99996 6.66667 4.99996C6.20643 4.99996 5.83333 4.62686 5.83333 4.16663H5C4.53976 4.16663 4.16667 4.53972 4.16667 4.99996V5.83329H15.8333ZM4.16667 7.49996V15.8333C4.16667 16.2935 4.53976 16.6666 5 16.6666H15C15.4602 16.6666 15.8333 16.2935 15.8333 15.8333V7.49996H4.16667Z"
                fill="#667085"
              />
            </svg>
            Select Dates
          </button> */}
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10.8333 6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5C12.1269 7.5 12.5 7.1269 12.5 6.66667V5.83333H16.6667C17.1269 5.83333 17.5 5.46024 17.5 5C17.5 4.53976 17.1269 4.16667 16.6667 4.16667H12.5V3.33333C12.5 2.8731 12.1269 2.5 11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667Z"
                fill="#667085"
              />
              <path
                d="M2.5 10C2.5 9.53976 2.8731 9.16667 3.33333 9.16667H4.58333C4.81345 9.16667 5 9.35321 5 9.58333V10.4167C5 10.6468 4.81345 10.8333 4.58333 10.8333H3.33333C2.8731 10.8333 2.5 10.4602 2.5 10Z"
                fill="#667085"
              />
              <path
                d="M7.5 7.5C7.03976 7.5 6.66667 7.8731 6.66667 8.33333V11.6667C6.66667 12.1269 7.03976 12.5 7.5 12.5C7.96024 12.5 8.33333 12.1269 8.33333 11.6667V10.8333H16.6667C17.1269 10.8333 17.5 10.4602 17.5 10C17.5 9.53976 17.1269 9.16667 16.6667 9.16667H8.33333V8.33333C8.33333 7.8731 7.96024 7.5 7.5 7.5Z"
                fill="#667085"
              />
              <path
                d="M2.5 5C2.5 4.53976 2.8731 4.16667 3.33333 4.16667H8.75C8.98012 4.16667 9.16667 4.35321 9.16667 4.58333V5.41667C9.16667 5.64679 8.98012 5.83333 8.75 5.83333H3.33333C2.8731 5.83333 2.5 5.46024 2.5 5Z"
                fill="#667085"
              />
              <path
                d="M12.5 13.3333C12.5 12.8731 12.8731 12.5 13.3333 12.5C13.7936 12.5 14.1667 12.8731 14.1667 13.3333V14.1667H16.6667C17.1269 14.1667 17.5 14.5398 17.5 15C17.5 15.4602 17.1269 15.8333 16.6667 15.8333H14.1667V16.6667C14.1667 17.1269 13.7936 17.5 13.3333 17.5C12.8731 17.5 12.5 17.1269 12.5 16.6667V13.3333Z"
                fill="#667085"
              />
              <path
                d="M2.5 15C2.5 14.5398 2.8731 14.1667 3.33333 14.1667H10.4167C10.6468 14.1667 10.8333 14.3532 10.8333 14.5833V15.4167C10.8333 15.6468 10.6468 15.8333 10.4167 15.8333H3.33333C2.8731 15.8333 2.5 15.4602 2.5 15Z"
                fill="#667085"
              />
            </svg>
            Filters
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-5 p-4 border-b border-[#E0E2E7] bg-white text-[#1E437A] font-semibold">
          <div className="col-span-1">Product Name</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Stock Level</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Action</div>
        </div>
        {currentItems.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-5 p-4 border-b border-[#E0E2E7] items-center"
          >
            <div className="col-span-1 text-[#1E437A] font-medium">
              {item.name}
            </div>
            <div className="col-span-1 text-[#1E437A]">{item.category}</div>
            <div className="col-span-1 text-[#1E437A]">{item.quantity}</div>
            <div className="col-span-1">
              <span
                className={`px-3 py-1 rounded-lg text-sm ${getStatusBadgeStyle(
                  item.stockStatus
                )}`}
              >
                {item.stockStatus}
              </span>
            </div>
            <Link
              href={`/ecommerce/inventory/updateStock?id=${item._id}`}
              className="col-span-1"
            >
              <button className="text-[#C83C92] flex items-center gap-1 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.3047 6.81991C18.281 5.8436 18.281 4.26069 17.3047 3.28438L16.7155 2.69512C15.7391 1.71881 14.1562 1.71881 13.1799 2.69512L3.69097 12.1841C3.34624 12.5288 3.10982 12.9668 3.01082 13.4442L2.34111 16.6735C2.21932 17.2607 2.73906 17.7805 3.32629 17.6587L6.55565 16.989C7.03302 16.89 7.47103 16.6536 7.81577 16.3089L17.3047 6.81991ZM16.1262 4.46289L15.5369 3.87363C15.2115 3.5482 14.6839 3.5482 14.3584 3.87363L13.4745 4.75755L15.2423 6.52531L16.1262 5.6414C16.4516 5.31596 16.4516 4.78833 16.1262 4.46289ZM14.0638 7.70382L12.296 5.93606L4.86948 13.3626C4.75457 13.4775 4.67577 13.6235 4.64277 13.7826L4.23082 15.769L6.21721 15.3571C6.37634 15.3241 6.52234 15.2453 6.63726 15.1303L14.0638 7.70382Z"
                    fill="#C83C92"
                  />
                </svg>
                Update Stock
              </button>
            </Link>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, totalItems)} from {totalItems}
        </div>
        <div className="flex gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E0E2E7] disabled:opacity-50"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                currentPage === index + 1
                  ? "bg-[#C83C92] text-white"
                  : "border border-[#E0E2E7] hover:bg-gray-100"
              }`}
              onClick={() => goToPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border bg-[rgba(200,60,146,0.1)] border-[#E0E2E7] disabled:opacity-50"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
