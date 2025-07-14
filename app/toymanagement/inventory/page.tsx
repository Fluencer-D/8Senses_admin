"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Toy {
  _id: string;
  name: string;
  category: string;
  description: string;
  totalUnits: number;
  availableUnits: number;
  image: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: Toy[];
}

export default function InventoryComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toys, setToys] = useState<Toy[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only runs on client
    setApiBaseUrl(`${process.env.NEXT_PUBLIC_API_URL}/api`);
  }, []);

  // Fetch toys from API
  const fetchToys = async (search = "", page = 1) => {
    if (!apiBaseUrl) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      let url = `${apiBaseUrl}/toys?page=${page}&limit=10`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      setToys(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error("Error fetching toys:", error);
      alert("Failed to fetch toys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete toy
  const deleteToy = async (toyId: string) => {
    if (!confirm("Are you sure you want to delete this toy?")) return;
    if (!apiBaseUrl) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiBaseUrl}/toys/${toyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }

      alert("Toy deleted successfully!");
      fetchToys(searchTerm, currentPage); // Refresh the list
    } catch (error) {
      console.error("Error deleting toy:", error);
      alert(
        `Failed to delete toy: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Export toys data
  const exportToys = async () => {
    if (!apiBaseUrl) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiBaseUrl}/toys?export=true`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const data = await response.json();

      // Create CSV content
      const csvContent = [
        [
          "Name",
          "Category",
          "Total Units",
          "Available Units",
          "Description",
        ].join(","),
        ...data.data.map((toy: Toy) =>
          [
            `"${toy.name}"`,
            `"${toy.category}"`,
            toy.totalUnits,
            toy.availableUnits,
            `"${toy.description || ""}"`,
          ].join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toys-inventory-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting toys:", error);
      alert("Failed to export toys data.");
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchToys(value, 1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchToys(searchTerm, page);
  };

  // Load toys on component mount
  useEffect(() => {
    if (apiBaseUrl) {
      fetchToys();
    }
  }, [apiBaseUrl]);

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div
      style={{ color: "#1E437A" }}
      className="min-h-screen w-[85%] ml-[300px] font-sans text-brandblue bg-gray-50 p-6"
    >
      <div className="max-w-7xl pt-28 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 text-brandblue cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </div>
            <br />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToys}
              className="flex items-center gap-2 border border-gray-300 bg-white text-brandblue hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link href={"/toymanagement/inventory/addtoy"}>
              <button
                style={{ backgroundColor: "#C83C92" }}
                className="flex items-center gap-2 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add New Toy
              </button>
            </Link>
          </div>
        </div>
        <h1
          style={{ color: "#1E437A" }}
          className="text-2xl block font-semibold text-brandblue -mt-5 mb-5"
        >
          Inventory
        </h1>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brandblue w-4 h-4" />
            <input
              type="text"
              placeholder="Search by toy name or category..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-300 bg-white text-brandblue hover:bg-gray-50 px-4 py-2.5 rounded-md text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">
                    Toy Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">
                    Total Units
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">
                    Available Units
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Loading toys...
                    </td>
                  </tr>
                ) : toys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No toys found
                    </td>
                  </tr>
                ) : (
                  toys.map((toy) => (
                    <tr key={toy._id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-lg overflow-hidden">
                            {toy.image &&
                            toy.image !==
                              "/placeholder.svg?height=200&width=200" ? (
                              <img
                                src={toy.image || "/placeholder.svg"}
                                alt={toy.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "🧸"
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brandblue">
                              {toy.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {toy.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-brandblue font-medium">
                          {toy.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-brandblue font-medium">
                          {toy.totalUnits}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-brandblue font-medium">
                          {toy.availableUnits}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/toymanagement/inventory/viewinventorytoy?id=${toy._id}`}
                          >
                            <button className="p-1.5 text-brandblue hover:text-brandblue hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link
                            href={`/toymanagement/inventory/edittoy?id=${toy._id}`}
                          >
                            <button className="p-1.5 text-brandblue hover:text-green-600 hover:bg-green-50 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => deleteToy(toy._id)}
                            className="p-1.5 text-brandblue hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-brandblue">
              Showing {Math.min((currentPage - 1) * 10 + 1, totalCount)}-
              {Math.min(currentPage * 10, totalCount)} from {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-brandblue hover:text-brandblue disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 text-sm font-medium rounded ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-brandblue hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <span className="text-brandblue px-2">...</span>
              )}

              <button
                className="p-2 text-brandblue hover:text-brandblue disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
