"use client"
import { getAdminToken } from "@/utils/storage"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ShippingOrder {
  _id: string
  orderId: string
  customerName: string
  trackingId: string
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled" | "Refunded" // Expanded status types
  dateShipped: string
}

const ShippingDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [shippingOrders, setShippingOrders] = useState<ShippingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        customerName: `${order.customerInfo?.firstName || ""} ${order.customerInfo?.lastName || ""}`.trim(),
        trackingId: order.trackingNumber || "N/A", // Use actual trackingNumber
        status: normalizeStatus(order.status),
        dateShipped: order.shippingDate ? new Date(order.shippingDate).toLocaleDateString() : "N/A",
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

  // Normalise order status for display
  const normalizeStatus = (status: string): ShippingOrder["status"] => {
    const lower = status?.toLowerCase()
    if (lower === "shipped") return "Shipped"
    if (lower === "delivered") return "Delivered"
    if (lower === "cancelled") return "Cancelled"
    if (lower === "refunded" || lower === "partially_refunded") return "Refunded"
    return "Pending" // pending, processing, etc.
  }

  const filteredData = shippingOrders.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.includes(searchQuery) ||
      item.trackingId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

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
          <h1 className="text-[#333843] text-3xl">Shipping</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-blue-600 cursor-pointer">E-commerce</span> &gt;{" "}
            <span className="text-gray-800">Shipping</span>
          </div>
        </div>
        {/* Action Buttons - Added Create button */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-pink-50 text-[#C83C92] px-4 py-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
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
      </div>
      {/* Search and Filters - Matched with Discounts style */}
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
            placeholder="Search shipments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Date and Filter Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center gap-x-2 p-3 rounded-lg border-2 h-10 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 20 15" fill="none">
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
            <h2 className="text-[#333843] text-lg">Filters</h2>
          </button>
        </div>
      </div>
      {/* Shipping Table - Matched with Discounts styling */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 p-4 border-b border-gray-200 bg-gray-50 text-[#1E437A] font-medium">
          <div className="col-span-1">Order ID</div>
          <div className="col-span-1">Customer Name</div>
          <div className="col-span-1">Tracking ID</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Date Shipped</div>
          <div className="col-span-1">Action</div>
        </div>
        {/* Table Content */}
        {currentItems.map((order) => {
          const statusClass = getStatusBadgeClass(order.status)
          return (
            <div key={order._id} className="grid grid-cols-6 p-4 border-b border-gray-200 items-center">
              <div className="col-span-1 text-[#1E437A] font-medium">#{order.orderId}</div>
              <div className="col-span-1 text-[#1E437A]">{order.customerName}</div>
              <div className="col-span-1 text-[#1E437A] font-medium truncate max-w-[180px]">{order.trackingId}</div>
              <div className="col-span-1">
                <span className={`px-3 py-1 rounded-full text-sm ${statusClass}`}>{order.status}</span>
              </div>
              <div className="col-span-1 text-[#1E437A]">{order.dateShipped}</div>
              <div className="col-span-1">
                {order.status === "Delivered" || order.status === "Cancelled" || order.status === "Refunded" ? (
                  <Link
                    href={`/ecommerce/shipping/${order._id}`} // Link to view details
                    className="flex items-center gap-1 text-[#C83C92]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.99996 4.16699C15.1083 4.16699 17.5256 7.59196 18.3765 9.19314C18.6475 9.70299 18.6475 10.2977 18.3765 10.8075C17.5256 12.4087 15.1083 15.8337 9.99996 15.8337C4.89164 15.8337 2.47436 12.4087 1.62339 10.8075C1.35242 10.2977 1.35242 9.70299 1.62339 9.19314C2.47436 7.59196 4.89164 4.16699 9.99996 4.16699ZM5.69692 7.06507C4.31336 7.98178 3.50548 9.20318 3.09512 9.97531C3.09054 9.98393 3.08865 9.98991 3.08783 9.9932C3.08699 9.99654 3.08683 10.0003 3.08683 10.0003C3.08683 10.0003 3.08699 10.0041 3.08783 10.0075C3.08865 10.0107 3.09054 10.0167 3.09512 10.0253C3.50548 10.7975 4.31336 12.0189 5.69692 12.9356C5.1257 12.0998 4.79163 11.0891 4.79163 10.0003C4.79163 8.91158 5.1257 7.90086 5.69692 7.06507ZM14.303 12.9356C15.6866 12.0189 16.4944 10.7975 16.9048 10.0253C16.9094 10.0167 16.9113 10.0107 16.9121 10.0075C16.9126 10.0053 16.913 10.0022 16.913 10.0022L16.9131 10.0003L16.9128 9.99666L16.9121 9.9932C16.9113 9.98991 16.9094 9.98393 16.9048 9.97531C16.4944 9.20318 15.6866 7.98179 14.303 7.06508C14.8742 7.90086 15.2083 8.91158 15.2083 10.0003C15.2083 11.0891 14.8742 12.0998 14.303 12.9356ZM6.4583 10.0003C6.4583 8.04432 8.04396 6.45866 9.99997 6.45866C11.956 6.45866 13.5416 8.04432 13.5416 10.0003C13.5416 11.9563 11.956 13.542 9.99997 13.542C8.04396 13.542 6.4583 11.9563 6.4583 10.0003Z"
                        fill="#C83C92"
                      />
                    </svg>
                    View Details
                  </Link>
                ) : (
                  <Link
                    href={`/ecommerce/shipping/${order._id}`} // Link to update status
                    className="flex items-center gap-1 text-[#C83C92]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M17.3047 6.81991C18.281 5.8436 18.281 4.26069 17.3047 3.28438L16.7155 2.69512C15.7391 1.71881 14.1562 1.71881 13.1799 2.69512L3.69097 12.1841C3.34624 12.5288 3.10982 12.9668 3.01082 13.4442L2.34111 16.6735C2.21932 17.2607 2.73906 17.7805 3.32629 17.6587L6.55565 16.989C7.03302 16.89 7.47103 16.6536 7.81577 16.3089L17.3047 6.81991ZM16.1262 4.46289L15.5369 3.87363C15.2115 3.5482 14.6839 3.5482 14.3584 3.87363L13.4745 4.75755L15.2423 6.52531L16.1262 5.6414C16.4516 5.31596 16.4516 4.78833 16.1262 4.46289ZM14.0638 7.70382L12.296 5.93606L4.86948 13.3626C4.75457 13.4775 4.67577 13.6235 4.64277 13.7826L4.23082 15.769L6.21721 15.3571C6.37634 15.3241 6.52234 15.2453 6.63726 15.1303L14.0638 7.70382Z"
                        fill="#C83C92"
                      />
                    </svg>
                    Update Status
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {/* Pagination - Matched with Discounts style */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        {/* Showing results */}
        <div>
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} from {totalItems}
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                currentPage === page ? "bg-[#C83C92] text-white" : "border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => goToPage(page)}
            >
              {page}
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
    </div>
  )
}

export default ShippingDashboard
