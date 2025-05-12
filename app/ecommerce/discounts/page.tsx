"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Discount {
  _id: string;
  code: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  createdBy: string;
}

const Discounts = () => {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch discounts");

        const data = await res.json();
        setDiscounts(data.data);
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const filteredData = discounts.filter(
    (item) =>
      typeof item.code === "string" &&
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatus = (discount: Discount): "Active" | "Scheduled" | "Expired" => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    if (!discount.isActive || now > end) return "Expired";
    if (now < start) return "Scheduled";
    return "Active";
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active": return "bg-[#E7F4EE] text-[#0D894F]";
      case "Scheduled": return "bg-[#E8F8FD] text-[#13B2E4]";
      case "Expired": return "bg-[#FEEDEC] text-[#F04438]";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateNewDiscount = () => {
    router.push("/ecommerce/discounts/createDiscount");
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#333843] text-3xl">Discounts</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-blue-600 cursor-pointer">E-commerce</span> &gt;{" "}
            <span className="text-gray-800">Discounts</span>
          </div>
        </div>
        <div className="flex gap-3">
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
          <button
            className="flex items-center gap-2 bg-[#C83C92] cursor-pointer text-white px-4 py-2 rounded-lg"
            onClick={handleCreateNewDiscount}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 4V16" />
              <path d="M4 10H16" />
            </svg>
            Create New Discount
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="Search discounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 
                4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-6 p-4 border-b bg-gray-50 text-[#1E437A] font-medium">
          <div>Coupon Code</div>
          <div>Discount</div>
          <div>Valid Till</div>
          <div>Status</div>
          <div>Usage</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-6">No discounts found.</div>
        ) : (
          currentItems.map((d) => {
            const status = getStatus(d);
            return (
              <div
                key={d._id}
                className="grid grid-cols-6 p-4 border-b text-[#456696] items-center"
              >
                <div>{d.code}</div>
                <div>{d.discountValue}% OFF</div>
                <div>{new Date(d.endDate).toLocaleDateString()}</div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeStyle(status)}`}
                  >
                    {status}
                  </span>
                </div>
                <div>{`${d.usageCount} / ${d.usageLimit}`}</div>
                <div>
                  {status === "Expired" ? (
                    <button className="text-[#C83C92]">Reactivate</button>
                  ) : (
                    <button className="text-[#C83C92]">Edit</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, totalItems)} of{" "}
          {totalItems}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-2 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-[#C83C92] text-white"
                  : "bg-gray-100 text-[#C83C92]"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Discounts;
