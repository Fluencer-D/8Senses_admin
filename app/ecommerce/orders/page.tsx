"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getAdminToken } from "@/utils/storage"
import { Search, Filter, X, Calendar, DollarSign, Package } from "lucide-react"

type OrderStatus = "Completed" | "Pending" | "Processing" | "Refunded" | string

interface Order {
  _id: string
  customerName: string
  amount: number
  status: OrderStatus
  dateTime: string
}

interface Filters {
  status: string
  minAmount: string
  maxAmount: string
  dateRange: string
}

const Orders = () => {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    status: "",
    minAmount: "",
    maxAmount: "",
    dateRange: "",
  })

  const itemsPerPage = 10

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getAdminToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch orders")
        const data = await res.json()
        console.log(data) //debug
        const formatted = data.data.map((order: any) => ({
          _id: order._id,
          customerName: `${order.customerInfo?.firstName || ""} ${order.customerInfo?.lastName || ""}`.trim() || "N/A",
          amount: order.total || 0,
          status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Pending", // capitalizing
          dateTime: new Date(order.createdAt).toLocaleString(),
        }))
        setOrders(formatted)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Get date range for filtering
  const getDateRange = (range: string) => {
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "30days":
        startDate.setDate(now.getDate() - 30)
        break
      case "90days":
        startDate.setDate(now.getDate() - 90)
        break
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return null
    }
    return startDate
  }

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) => order.customerName?.toLowerCase().includes(query) || order._id.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status)
    }

    // Amount range filters
    if (filters.minAmount) {
      const minAmount = Number.parseFloat(filters.minAmount)
      filtered = filtered.filter((order) => order.amount >= minAmount)
    }

    if (filters.maxAmount) {
      const maxAmount = Number.parseFloat(filters.maxAmount)
      filtered = filtered.filter((order) => order.amount <= maxAmount)
    }

    // Date range filter
    if (filters.dateRange) {
      const startDate = getDateRange(filters.dateRange)
      if (startDate) {
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.dateTime)
          return orderDate >= startDate
        })
      }
    }

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Apply filters whenever search query or filters change
  useEffect(() => {
    applyFilters()
  }, [orders, searchQuery, filters])

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      minAmount: "",
      maxAmount: "",
      dateRange: "",
    })
    setSearchQuery("")
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(orders.map((order) => order.status))].filter(Boolean)

  const totalItems = filteredOrders.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)

  const getStatusBadgeStyle = (status: OrderStatus): string => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-orange-100 text-orange-600"
      case "Processing":
        return "bg-blue-100 text-blue-600"
      case "Refunded":
        return "bg-red-100 text-red-500"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#333843] text-3xl font-bold">Orders</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-blue-600 cursor-pointer font-medium">E-commerce</span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800 font-semibold">Orders</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between mb-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent placeholder-gray-500"
            placeholder="Search by customer name or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showFilters
                ? "border-[#C83C92] bg-[#C83C92] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {(filters.status || filters.minAmount || filters.maxAmount || filters.dateRange) && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 bg-white"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="" className="text-gray-900">
                  All Statuses
                </option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status} className="text-gray-900">
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Amount Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Min Amount ($)
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                value={filters.minAmount}
                onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
              />
            </div>

            {/* Max Amount Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Max Amount ($)</label>
              <input
                type="number"
                placeholder="1000.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                value={filters.maxAmount}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 bg-white"
                value={filters.dateRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="" className="text-gray-900">
                  All Time
                </option>
                <option value="today" className="text-gray-900">
                  Today
                </option>
                <option value="7days" className="text-gray-900">
                  Last 7 Days
                </option>
                <option value="30days" className="text-gray-900">
                  Last 30 Days
                </option>
                <option value="90days" className="text-gray-900">
                  Last 90 Days
                </option>
                <option value="1year" className="text-gray-900">
                  Last Year
                </option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700">
              Showing <span className="text-[#C83C92] font-bold">{filteredOrders.length}</span> of{" "}
              <span className="text-gray-900 font-bold">{orders.length}</span> orders
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery || Object.values(filters).some((filter) => filter)
                ? "No orders match your current filters"
                : "No orders found"}
            </p>
            {(searchQuery || Object.values(filters).some((filter) => filter)) && (
              <button onClick={clearFilters} className="text-[#C83C92] hover:text-[#B8358A] font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-6 p-4 border-b border-gray-200 bg-[#F9F9FC] text-[#1E437A] font-semibold">
              <div className="col-span-1">Order ID</div>
              <div className="col-span-1 ml-10">Customer Name</div>
              <div className="col-span-1 ml-8">Amount</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date & Time</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Table Content */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#C83C92] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : (
              currentItems.map((order, index) => (
                <div
                  key={order._id}
                  className={`grid grid-cols-6 p-4 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <div className="col-span-1 text-[#1E437A] font-medium">#{order._id.slice(-8)}</div>
                  <div className="col-span-1 text-[#1E437A] ml-22">{order.customerName}</div>
                  <div className="col-span-1 text-[#1E437A] ml-10 font-semibold">
                    {typeof order.amount === "number" ? `$${order.amount.toFixed(2)}` : "N/A"}
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeStyle(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-[#1E437A] text-sm">{order.dateTime}</div>
                  <Link href={`/ecommerce/orders/orderDetails?id=${order._id}`} className="col-span-1">
                    <button className="flex items-center gap-2 text-[#C83C92] hover:text-[#B8358A] font-medium transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.99996 4.1665C15.1083 4.1665 17.5256 7.59147 18.3765 9.19265C18.6475 9.7025 18.6475 10.2972 18.3765 10.807C17.5256 12.4082 15.1083 15.8332 9.99996 15.8332C4.89164 15.8332 2.47436 12.4082 1.62339 10.807C1.35242 10.2972 1.35242 9.7025 1.62339 9.19265C2.47436 7.59147 4.89164 4.1665 9.99996 4.1665ZM5.69692 7.06458C4.31336 7.98129 3.50548 9.20269 3.09512 9.97482C3.09054 9.98345 3.08865 9.98943 3.08783 9.99271C3.08699 9.99605 3.08683 9.99984 3.08683 9.99984C3.08683 9.99984 3.08699 10.0036 3.08783 10.007C3.08865 10.0102 3.09054 10.0162 3.09512 10.0249C3.50548 10.797 4.31336 12.0184 5.69692 12.9351C5.1257 12.0993 4.79163 11.0886 4.79163 9.99984C4.79163 8.91109 5.1257 7.90037 5.69692 7.06458ZM14.303 12.9351C15.6866 12.0184 16.4944 10.797 16.9048 10.0249C16.9094 10.0162 16.9113 10.0103 16.9121 10.007C16.9126 10.0048 16.913 10.0017 16.913 10.0017L16.9131 9.99984L16.9128 9.99617L16.9121 9.99271C16.9113 9.98942 16.9094 9.98344 16.9048 9.97482C16.4944 9.20269 15.6866 7.9813 14.303 7.06459C14.8742 7.90038 15.2083 8.91109 15.2083 9.99984C15.2083 11.0886 14.8742 12.0993 14.303 12.9351ZM6.4583 9.99984C6.4583 8.04383 8.04396 6.45817 9.99997 6.45817C11.956 6.45817 13.5416 8.04383 13.5416 9.99984C13.5416 11.9558 11.956 13.5415 9.99997 13.5415C8.04396 13.5415 6.4583 11.9558 6.4583 9.99984Z"
                          fill="currentColor"
                        />
                      </svg>
                      View Details
                    </button>
                  </Link>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Enhanced Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm">
          <span className="text-sm text-[#456696]">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}{" "}
            orders
          </span>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 rounded-lg bg-[rgba(200,60,146,0.1)] text-[#C83C92] hover:bg-[rgba(200,60,146,0.2)] transition-colors font-medium disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#C83C92] text-white"
                    : "bg-[rgba(200,60,146,0.1)] text-[#C83C92] hover:bg-[rgba(200,60,146,0.2)]"
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-4 py-2 rounded-lg bg-[rgba(200,60,146,0.1)] text-[#C83C92] hover:bg-[rgba(200,60,146,0.2)] transition-colors font-medium disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
