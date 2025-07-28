"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminToken } from "@/utils/storage";

type OrderStatus = "Completed" | "Pending" | "Processing" | "Refunded" | string;

interface Order {
  _id: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  dateTime: string;
}

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getAdminToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        console.log(data); //debug

        const formatted = data.data.map((order: any) => ({
          _id: order._id,
          customerName:
            `${order.customerInfo?.firstName || ""} ${
              order.customerInfo?.lastName || ""
            }`.trim() || "N/A",
          amount: order.total || 0,
          status:
            order.status?.charAt(0).toUpperCase() + order.status?.slice(1) ||
            "Pending", // capitalizing
          dateTime: new Date(order.createdAt).toLocaleString(),
        }));

        setOrders(formatted);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredData = orders.filter((item) =>
    item.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadgeStyle = (status: OrderStatus): string => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-orange-100 text-orange-600";
      case "Processing":
        return "bg-blue-100 text-blue-600";
      case "Refunded":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#333843] text-3xl">Orders</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-blue-600 cursor-pointer">E-commerce</span>{" "}
            &gt; <span className="text-gray-800">Orders</span>
          </div>
        </div>

        {/* Export Button */}
        {/* <button className="flex items-center gap-2 bg-[#C83C92] text-white px-4 py-2 rounded-lg font-medium">
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
        </button> */}
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between mb-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
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
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="Search order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date and Filter Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg font-medium">
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
          </button>
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 p-4 border-b border-gray-200 bg-gray-50 text-[#1E437A] font-medium">
          <div className="col-span-1">Order ID</div>
          <div className="col-span-1 ml-10">Customer Name</div>
          <div className="col-span-1 ml-8">Amount</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Date & Time</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-6">No orders found.</div>
        ) : (
          currentItems.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-6 p-4 border-b border-gray-200 items-center"
            >
              <div className="col-span-1 text-[#1E437A]">#{order._id}</div>
              <div className="col-span-1 text-[#1E437A] ml-22">
                {order.customerName}
              </div>
              <div className="col-span-1 text-[#1E437A] ml-10">
                {typeof order.amount === "number"
                  ? `$${order.amount.toFixed(2)}`
                  : "N/A"}
              </div>
              <div className="col-span-1">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="col-span-1 text-[#1E437A]">{order.dateTime}</div>
              <Link
                href={`/ecommerce/orders/orderDetails?id=${order._id}`}
                className="col-span-1"
              >
                <button className="flex items-center gap-1 text-[#C83C92]">
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
                      d="M9.99996 4.1665C15.1083 4.1665 17.5256 7.59147 18.3765 9.19265C18.6475 9.7025 18.6475 10.2972 18.3765 10.807C17.5256 12.4082 15.1083 15.8332 9.99996 15.8332C4.89164 15.8332 2.47436 12.4082 1.62339 10.807C1.35242 10.2972 1.35242 9.7025 1.62339 9.19265C2.47436 7.59147 4.89164 4.1665 9.99996 4.1665ZM5.69692 7.06458C4.31336 7.98129 3.50548 9.20269 3.09512 9.97482C3.09054 9.98345 3.08865 9.98943 3.08783 9.99271C3.08699 9.99605 3.08683 9.99984 3.08683 9.99984C3.08683 9.99984 3.08699 10.0036 3.08783 10.007C3.08865 10.0102 3.09054 10.0162 3.09512 10.0249C3.50548 10.797 4.31336 12.0184 5.69692 12.9351C5.1257 12.0993 4.79163 11.0886 4.79163 9.99984C4.79163 8.91109 5.1257 7.90037 5.69692 7.06458ZM14.303 12.9351C15.6866 12.0184 16.4944 10.797 16.9048 10.0249C16.9094 10.0162 16.9113 10.0103 16.9121 10.007C16.9126 10.0048 16.913 10.0017 16.913 10.0017L16.9131 9.99984L16.9128 9.99617L16.9121 9.99271C16.9113 9.98942 16.9094 9.98344 16.9048 9.97482C16.4944 9.20269 15.6866 7.9813 14.303 7.06459C14.8742 7.90038 15.2083 8.91109 15.2083 9.99984C15.2083 11.0886 14.8742 12.0993 14.303 12.9351ZM6.4583 9.99984C6.4583 8.04383 8.04396 6.45817 9.99997 6.45817C11.956 6.45817 13.5416 8.04383 13.5416 9.99984C13.5416 11.9558 11.956 13.5415 9.99997 13.5415C8.04396 13.5415 6.4583 11.9558 6.4583 9.99984Z"
                      fill="#C83C92"
                    />
                  </svg>
                  View Details
                </button>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-[#456696]">
          Showing {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, filteredData.length)} from{" "}
          {filteredData.length}
        </span>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 rounded-lg bg-[rgba(200,60,146,0.1)] text-[#C83C92]"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? "bg-[#C83C92] text-white"
                  : "bg-[rgba(200,60,146,0.1)] text-[#C83C92]"
              }`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded-lg bg-[rgba(200,60,146,0.1)] text-[#C83C92]"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
