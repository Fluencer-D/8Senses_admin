"use client"
import { getAdminToken } from "@/utils/storage"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Search, Filter, X, Calendar, Truck } from "lucide-react"

interface ShippingOrder {
  _id: string
  orderId: string
  customerName: string
  trackingId: string
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled" | "Refunded"
  dateShipped: string
}

interface Filters {
  status: string
  dateRange: string
}

const ShippingDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [shippingOrders, setShippingOrders] = useState<ShippingOrder[]>([])
  const [filteredShippingOrders, setFilteredShippingOrders] = useState<ShippingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    status: "",
    dateRange: "",
  })

  const itemsPerPage = 10

  const fetchShippingOrders = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`, // Assuming /api/orders fetches all orders
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (!response.ok) throw new Error("Failed to fetch shipping orders")
      const result = await response.json()
      console.log("Fetched orders:", result) //debug

      // Filter for relevant statuses for shipping dashboard
      const relevantOrders = result.data.filter((order: any) =>
        ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].includes(order.status),
      )

      const normalizedData: ShippingOrder[] = relevantOrders.map((order: any) => ({
        _id: order._id,
        orderId: order.orderNumber || order._id.substring(0, 8).toUpperCase(), // Use orderNumber or part of ID
        customerName: `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || "N/A", // Use order.user
        trackingId: order.trackingNumber || "N/A", // Use actual trackingNumber
        status: normalizeStatus(order.status),
        dateShipped: order.shippingDate || order.createdAt || "N/A", // Store original date string or fallback to createdAt
      }))
      setShippingOrders(normalizedData)
    } catch (err: any) {
      console.error("Error fetching shipping orders:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShippingOrders()
  }, [])

  // Normalize order status for display
  const normalizeStatus = (status: string): ShippingOrder["status"] => {
    const lower = status?.toLowerCase()
    if (lower === "shipped") return "Shipped"
    if (lower === "delivered") return "Delivered"
    if (lower === "cancelled") return "Cancelled"
    if (lower === "refunded" || lower === "partially_refunded") return "Refunded"
    return "Pending" // pending, processing, etc.
  }

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
    let filtered = [...shippingOrders]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.customerName.toLowerCase().includes(query) ||
          item.orderId.toLowerCase().includes(query) ||
          item.trackingId.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status)
    }

    // Date range filter
    if (filters.dateRange) {
      const startDate = getDateRange(filters.dateRange)
      if (startDate) {
        filtered = filtered.filter((order) => {
          if (order.dateShipped === "N/A" || !order.dateShipped) return false // Skip if date is not available
          const orderDate = new Date(order.dateShipped)
          return !isNaN(orderDate.getTime()) && orderDate >= startDate
        })
      }
    }

    setFilteredShippingOrders(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Apply filters whenever search query or filters change
  useEffect(() => {
    applyFilters()
  }, [shippingOrders, searchQuery, filters])

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      dateRange: "",
    })
    setSearchQuery("")
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(shippingOrders.map((order) => order.status))].filter(Boolean)

  const totalItems = filteredShippingOrders.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredShippingOrders.slice(indexOfFirstItem, indexOfLastItem)

  const getStatusBadgeClass = (status: ShippingOrder["status"]): string => {
    switch (status) {
      case "Shipped":
        return "bg-[#E8F8FD] text-[#13B2E4]"
      case "Pending":
        return "bg-[#FDF1E8] text-[#E46A11]"
      case "Delivered":
        return "bg-[#E7F4EE] text-[#0D894F]"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Refunded":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  if (loading)
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C83C92]"></div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchShippingOrders}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header - Updated to match Discounts style */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#333843] text-3xl font-bold">Shipping</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-blue-600 cursor-pointer font-medium">E-commerce</span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800 font-semibold">Shipping</span>
          </div>
        </div>
        {/* Action Buttons - Added Create button */}
        <div className="flex gap-3">{/* Export Button placeholder */}</div>
      </div>

      {/* Search and Filters - Matched with Discounts style */}
      <div className="flex justify-between mb-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent placeholder-gray-500"
            placeholder="Search shipments by customer, order ID, or tracking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Date and Filter Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showFilters
                ? "border-[#C83C92] bg-[#C83C92] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {(filters.status || filters.dateRange) && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping Status
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

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Shipped
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
              Showing <span className="text-[#C83C92] font-bold">{filteredShippingOrders.length}</span> of{" "}
              <span className="text-gray-900 font-bold">{shippingOrders.length}</span> shipments
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

      {/* Shipping Table - Matched with Discounts styling */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredShippingOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery || Object.values(filters).some((filter) => filter)
                ? "No shipments match your current filters"
                : "No shipments found"}
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
              <div className="col-span-1">Customer Name</div>
              <div className="col-span-1">Tracking ID</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date Shipped</div>
              <div className="col-span-1">Action</div>
            </div>
            {/* Table Content */}
            {currentItems.map((order, index) => {
              const statusClass = getStatusBadgeClass(order.status)
              return (
                <div
                  key={order._id}
                  className={`grid grid-cols-6 p-4 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <div className="col-span-1 text-[#1E437A] font-medium">#{order.orderId}</div>
                  <div className="col-span-1 text-[#1E437A]">{order.customerName}</div>
                  <div className="col-span-1 text-[#1E437A] font-medium truncate max-w-[180px]">{order.trackingId}</div>
                  <div className="col-span-1">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-[#1E437A]">
                    {order.dateShipped !== "N/A" ? new Date(order.dateShipped).toLocaleDateString() : "N/A"}
                  </div>
                  <div className="col-span-1">
                    {order.status === "Delivered" || order.status === "Cancelled" || order.status === "Refunded" ? (
                      <Link
                        href={`/ecommerce/shipping/${order._id}`} // Link to view details
                        className="flex items-center gap-2 text-[#C83C92] hover:text-[#B8358A] font-medium transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.99996 4.16699C15.1083 4.16699 17.5256 7.59196 18.3765 9.19314C18.6475 9.70299 18.6475 10.2977 18.3765 10.8075C17.5256 12.4087 15.1083 15.8337 9.99996 15.8337C4.89164 15.8337 2.47436 12.4087 1.62339 10.8075C1.35242 10.2977 1.35242 9.70299 1.62339 9.19314C2.47436 7.59196 4.89164 4.16699 9.99996 4.16699ZM5.69692 7.06507C4.31336 7.98178 3.50548 9.20318 3.09512 9.97531C3.09054 9.98393 3.08865 9.98991 3.08783 9.9932C3.08699 9.99654 3.08683 10.0003 3.08683 10.0003C3.08683 10.0003 3.08699 10.0041 3.08783 10.0075C3.08865 10.0107 3.09054 10.0167 3.09512 10.0253C3.50548 10.7975 4.31336 12.0189 5.69692 12.9356C5.1257 12.0998 4.79163 11.0891 4.79163 10.0003C4.79163 8.91158 5.1257 7.90086 5.69692 7.06507ZM14.303 12.9356C15.6866 12.0189 16.4944 10.7975 16.9048 10.0253C16.9094 10.0167 16.9113 10.0107 16.9121 10.0075C16.9126 10.0053 16.913 10.0022 16.913 10.0022L16.9131 10.0003L16.9128 9.99666L16.9121 9.9932C16.9113 9.98991 16.9094 9.98393 16.9048 9.97531C16.4944 9.20318 15.6866 7.98179 14.303 7.06508C14.8742 7.90086 15.2083 8.91158 15.2083 10.0003C15.2083 11.0891 14.8742 12.0998 14.303 12.9356ZM6.4583 10.0003C6.4583 8.04432 8.04396 6.45866 9.99997 6.45866C11.956 6.45866 13.5416 8.04432 13.5416 10.0003C13.5416 11.9563 11.956 13.542 9.99997 13.542C8.04396 13.542 6.4583 11.9563 6.4583 10.0003Z"
                            fill="currentColor"
                          />
                        </svg>
                        View Details
                      </Link>
                    ) : (
                      <Link
                        href={`/ecommerce/shipping/${order._id}`} // Link to update status
                        className="flex items-center gap-2 text-[#C83C92] hover:text-[#B8358A] font-medium transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.3047 6.81991C18.281 5.8436 18.281 4.26069 17.3047 3.28438L16.7155 2.69512C15.7391 1.71881 14.1562 1.71881 13.1799 2.69512L3.69097 12.1841C3.34624 12.5288 3.10982 12.9668 3.01082 13.4442L2.34111 16.6735C2.21932 17.2607 2.73906 17.7805 3.32629 17.6587L6.55565 16.989C7.03302 16.89 7.47103 16.6536 7.81577 16.3089L17.3047 6.81991ZM16.1262 4.46289L15.5369 3.87363C15.2115 3.5482 14.6839 3.5482 14.3584 3.87363L13.4745 4.75755L15.2423 6.52531L16.1262 5.6414C16.4516 5.31596 16.4516 4.78833 16.1262 4.46289ZM14.0638 7.70382L12.296 5.93606L4.86948 13.3626C4.75457 13.4775 4.67577 13.6235 4.64277 13.7826L4.23082 15.769L6.21721 15.3571C6.37634 15.3241 6.52234 15.2453 6.63726 15.1303L14.0638 7.70382Z"
                            fill="currentColor"
                          />
                        </svg>
                        Update Status
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
      {/* Pagination - Matched with Discounts style */}
      {totalItems > 0 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm">
          {/* Showing results */}
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} from {totalItems}
          </div>
          {/* Pagination Buttons */}
          <div className="flex gap-2">
            {/* Previous Button */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#C83C92] text-white"
                    : "bg-[rgba(200,60,146,0.1)] text-[#C83C92] border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            {/* Next Button */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              onClick={() => goToPage(currentPage + 1)}
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

export default ShippingDashboard
