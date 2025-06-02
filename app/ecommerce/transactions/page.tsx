"use client";
import { useEffect, useState } from "react";

interface Transaction {
  _id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: "Pending" | "Successful" | "Failed";
  createdAt: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    // Only attempt to fetch after component is mounted on client
    if (typeof window === "undefined") return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch transactions");

      // const data = await res.json();
      // console.log("Fetched Data:", data.data); //debug
      // const formatted: Transaction[] = data.data.map((txn: any) => ({
      //   _id: txn._id,
      //   orderNumber: txn.orderNumber,
      //   customerName: `${txn.customerInfo.firstName} ${txn.customerInfo.lastName}`,
      //   amount: txn.total,
      //   status:
      //     txn.paymentStatus === "paid"
      //       ? "Successful"
      //       : txn.paymentStatus === "failed"
      //       ? "Failed"
      //       : "Pending",
      //   createdAt: new Date(txn.createdAt).toLocaleString(),
      // }));
      const data = await res.json();
      console.log(data);

      const transactionsArray = data.data; // no need for `data.data.data` — just `data.data`

      const formatted: Transaction[] = transactionsArray.map((txn: any) => ({
        _id: txn._id,
        orderNumber: txn.orderNumber ?? txn.transactionId, // fallback if orderNumber is null
        customerName: txn.customerName || "Unknown",
        amount: txn.amount ?? txn.total, // use amount if total is undefined
        status:
          txn.status === "successful"
            ? "Successful"
            : txn.status === "failed"
            ? "Failed"
            : "Pending",
        createdAt: new Date(txn.createdAt).toLocaleString(),
      }));

      setTransactions(formatted);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = transactions.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadgeStyle = (status: Transaction["status"]): string => {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-orange-100 text-orange-600";
      case "Failed":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // For initial server render, show a minimal loading state
  if (!isClient) {
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">Loading...</div>
    );
  }

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#333843] text-3xl">Transactions</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-blue-600 cursor-pointer">E-commerce</span>{" "}
            &gt; <span className="text-gray-800">Transactions</span>
          </div>
        </div>

        {/* Export Button */}
        <button className="flex items-center gap-2 bg-pink-50 text-[#C83C92] px-4 py-2 rounded-lg">
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
            <path d="M3 17H17" />
            <path d="M10 3V15" />
            <path d="M6 11L10 15L14 11" />
          </svg>
          Export
        </button>
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
            placeholder="Search payment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date and Filter Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="4" width="14" height="14" rx="2" />
              <path d="M3 8h14" />
              <path d="M7 3v3" />
              <path d="M13 3v3" />
            </svg>
            Select Dates
          </button>
          <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 5h10M5 10h10M5 15h10" />
              <path d="M3 5h0M3 10h0M3 15h0" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table Header */}
        <div
          className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_2fr_1fr] p-4 border-b border-gray-200 bg-gray-50 text-[#1E437A] font-medium"
          style={{ minWidth: "900px" }}
        >
          <div className="truncate">Transaction ID</div>
          <div className="truncate">Order ID</div>
          <div className="truncate">Customer Name</div>
          <div>Amount</div>
          <div>Status</div>
          <div className="truncate">Date & Time</div>
          <div>Action</div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No transactions found.
          </div>
        ) : (
          currentItems.map((txn) => (
            <div
              key={txn._id}
              className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_2fr_1fr] p-4 border-b border-gray-200 items-center"
              style={{ minWidth: "900px" }}
            >
              <div className="text-[#1E437A] truncate" title={txn._id}>
                {txn._id}
              </div>
              <div
                className="text-[#1E437A] truncate"
                title={`#${txn.orderNumber}`}
              >
                #{txn.orderNumber}
              </div>
              <div className="text-[#1E437A] truncate" title={txn.customerName}>
                {txn.customerName}
              </div>
              <div className="text-[#1E437A]">${txn.amount.toFixed(2)}</div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeStyle(
                    txn.status
                  )}`}
                >
                  {txn.status}
                </span>
              </div>
              <div
                className="text-[#1E437A] whitespace-nowrap truncate"
                title={txn.createdAt}
              >
                {txn.createdAt}
              </div>
              <div>
                <button className="flex items-center gap-1 text-[#C83C92] whitespace-nowrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M1 10s4-5 9-5 9 5 9 5-4 5-9 5-9-5-9-5z" />
                    <circle cx="10" cy="10" r="3" />
                  </svg>
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          {/* Showing results */}
          <div>
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredData.length)} from{" "}
            {filteredData.length}
          </div>

          {/* Pagination Buttons */}
          <div className="flex gap-2">
            {/* Previous Button */}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  currentPage === i + 1
                    ? "bg-[#C83C92] text-white"
                    : "bg-[rgba(200,60,146,0.1)] text-[#C83C92] border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
