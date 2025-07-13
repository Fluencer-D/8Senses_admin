"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  toysAvailable: number;
  toysBorrowed: number;
  dueSoon: number;
  overdue: number;
}

interface BorrowedToy {
  _id: string;
  toyId: {
    _id: string;
    name: string;
    category: string;
    image?: string;
  };
  toyUnitId: {
    unitNumber: number;
    condition: string;
  };
  borrowerName: string;
  email: string;
  phone: string;
  relationship: string;
  issueDate: string;
  dueDate: string;
  status: string;
  notes?: string;
}

const ToyManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [borrowedToys, setBorrowedToys] = useState<BorrowedToy[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    toysAvailable: 0,
    toysBorrowed: 0,
    dueSoon: 0,
    overdue: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchDashboardStats();
    fetchBorrowedToys();
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      } else {
        console.error("Failed to fetch dashboard stats:", response.status);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Fetch borrowed toys for the table
  const fetchBorrowedToys = async (search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      let url = `${API_BASE_URL}/dashboard/borrowed-toys`;
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBorrowedToys(result.data);
      } else {
        console.error("Failed to fetch borrowed toys:", response.status);
      }
    } catch (error) {
      console.error("Error fetching borrowed toys:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send reminder notification
  const sendReminder = async (
    borrowingId: string,
    borrowerEmail: string,
    toyName: string
  ) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/dashboard/send-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ borrowingId }),
      });

      if (response.ok) {
        alert(`Reminder sent to ${borrowerEmail} for ${toyName}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to send reminder: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
  };

  // Process return
  const processReturn = async (borrowingId: string, toyName: string) => {
    const conditionOnReturn = prompt(
      "Enter the condition of the toy on return:",
      "Good"
    );
    if (!conditionOnReturn) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/dashboard/process-return/${borrowingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            conditionOnReturn,
            returnNotes: "",
          }),
        }
      );

      if (response.ok) {
        alert(`${toyName} returned successfully!`);
        // Refresh both stats and borrowed toys
        await Promise.all([
          fetchDashboardStats(),
          fetchBorrowedToys(searchQuery),
        ]);
      } else {
        const errorData = await response.json();
        alert(`Failed to process return: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error processing return:", error);
      alert("Failed to process return");
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchBorrowedToys(searchQuery)]);
    setRefreshing(false);
  };

  // Get status styling
  const getStatusStyling = (status: string) => {
    switch (status) {
      case "Overdue":
        return { color: "#F04438", backgroundColor: "#FDF1E8" };
      case "Due Soon":
        return { color: "#F79009", backgroundColor: "#FEF7E6" };
      case "Active":
        return { color: "#12B76A", backgroundColor: "#E7F7EF" };
      default:
        return { color: "#6B7280", backgroundColor: "#F3F4F6" };
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchBorrowedToys(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50 w-[81%] ml-[300px] mt-20 p-6 overflow-hidden">
      <TopNavigator refreshData={refreshData} refreshing={refreshing} />

      <SearchFiltersComponent
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
      />

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full p-4">
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🧸</span>
          </div>
          <p className="text-neutral-500 mt-5 text-md font-medium">
            Toys Available
          </p>
          <p className="text-black mt-5 text-xl font-semibold">
            {stats.toysAvailable}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-neutral-500 mt-5 text-md font-medium">
            Toys Borrowed
          </p>
          <p className="text-black mt-5 text-xl font-semibold">
            {stats.toysBorrowed}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">⏰</span>
          </div>
          <p className="text-neutral-500 mt-5 text-md font-medium">Due Soon</p>
          <p className="text-black mt-5 text-xl font-semibold">
            {stats.dueSoon}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-neutral-500 mt-5 text-md font-medium">Over Due</p>
          <p className="text-black mt-5 text-xl font-semibold">
            {stats.overdue}
          </p>
        </div>
      </div>

      {/* Toys Table */}
      <div className="max-h-[700px] overflow-y-auto mt-12">
        {loading ? (
          <div className="p-6 text-center">Loading borrowed toys...</div>
        ) : borrowedToys.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No borrowed toys found</p>
            <Link href="/toymanagement/dashboard/issuenewtoy">
              <button className="mt-4 px-4 py-2 bg-[#C83C92] text-white font-semibold rounded-md">
                Issue First Toy
              </button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-left bg-white rounded-lg shadow-sm">
            <thead className="bg-[#F9F9FC] text-[#1E437A] text-md font-semibold sticky top-0">
              <tr>
                <th className="p-3">Toy Name</th>
                <th className="p-3">Borrowed By</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrowedToys.map((borrowing) => {
                const statusStyling = getStatusStyling(borrowing.status);
                return (
                  <tr key={borrowing._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                        {borrowing.toyId?.image ? (
                          <img
                            src={borrowing.toyId.image || "/placeholder.svg"}
                            alt={borrowing.toyId.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🧸
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[#1E437A] font-semibold">
                          {borrowing.toyId?.name}
                        </span>
                        <div className="text-sm text-gray-500">
                          Unit #{borrowing.toyUnitId?.unitNumber} •{" "}
                          {borrowing.toyId?.category}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-[#1E437A] align-middle">
                      {borrowing.borrowerName}
                      <br />
                      <span className="font-medium text-[#7093c9] text-sm">
                        {borrowing.email}
                      </span>
                    </td>
                    <td className="p-3 text-[#1E437A]">
                      {new Date(borrowing.dueDate).toLocaleDateString()}
                      <div className="text-sm text-gray-500">
                        Issued:{" "}
                        {new Date(borrowing.issueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 text-[#456696]">
                      <span
                        style={{
                          color: statusStyling.color,
                          backgroundColor: statusStyling.backgroundColor,
                        }}
                        className="p-2 rounded-2xl text-sm font-semibold"
                      >
                        {borrowing.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#456696] flex gap-3">
                      <button
                        onClick={() =>
                          sendReminder(
                            borrowing._id,
                            borrowing.email,
                            borrowing.toyId?.name
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                        title="Send Reminder"
                      >
                        🔔
                      </button>
                      <button
                        onClick={() =>
                          processReturn(borrowing._id, borrowing.toyId?.name)
                        }
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                        title="Process Return"
                      >
                        ↩️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ToyManagementPage;

const TopNavigator = ({
  refreshData,
  refreshing,
}: {
  refreshData: () => void;
  refreshing: boolean;
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#333843] font-medium text-2xl leading-8 tracking-wide">
            Toy Management
          </h2>
          <p className="text-sm text-gray-500 flex items-center">
            <span className="text-[#245BA7] font-medium">Dashboard</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              className="mx-2"
              viewBox="0 0 18 18"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.59467 3.96967C6.30178 4.26256 6.30178 4.73744 6.59467 5.03033L10.5643 9L6.59467 12.9697C6.30178 13.2626 6.30178 13.7374 6.59467 14.0303C6.88756 14.3232 7.36244 14.3232 7.65533 14.0303L12.4205 9.26516C12.5669 9.11872 12.5669 8.88128 12.4205 8.73484L7.65533 3.96967C7.36244 3.67678 6.88756 3.67678 6.59467 3.96967Z"
                fill="#A3A9B6"
              />
            </svg>
            <span className="text-[#667085]">Overview</span>
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
        >
          <span className={refreshing ? "animate-spin" : ""}>🔄</span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
};

const SearchFiltersComponent = ({ setSearchQuery, searchQuery }: any) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center border border-gray-300 bg-white px-4 py-2 w-80 rounded-lg">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search for a toy or a member."
          className="ml-2 w-full bg-transparent focus:outline-none text-gray-600 placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex space-x-3">
        <div className="flex items-center gap-4">
          <Link href="/toymanagement/dashboard/process-return">
            <button className="flex items-center gap-2 bg-[#ffecf8] text-pink-400 px-4 font-semibold py-2 rounded-lg font-medium">
              <span>↩️</span>
              Process
            </button>
          </Link>
          <Link href="/toymanagement/dashboard/issuenewtoy">
            <button className="px-4 py-2 bg-[#C83C92] text-white font-semibold rounded-md">
              Issue a Toy
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
