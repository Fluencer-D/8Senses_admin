"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronDown,
  ClipboardList,
  ShoppingCart,
  Users,
  Search,
  X,
  Calendar,
  User,
  Package,
  CreditCard,
  MapPin,
  Phone,
} from "lucide-react"
import { Dialog } from "@headlessui/react"
import { getAdminToken } from "@/utils/storage"
import { useRouter } from "next/navigation"

interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Address {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "partially_refunded"

type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded"

interface Order {
  _id: string
  orderNumber: string
  user: {
    _id: string
    email: string
    firstName: string
    lastName: string
  } | null
  items: OrderItem[]
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: string
  paymentStatus: PaymentStatus
  shippingMethod: string
  subtotal: number
  tax: number
  shippingCost: number
  discount?: {
    code: string
    amount: number
  }
  total: number
  status: OrderStatus
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

interface StatCard {
  id: number
  title: string
  value: string
  icon: React.ReactNode
  bgColor: string
}

interface DashboardProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

interface Filters {
  status: string
  paymentMethod: string
  search: string
  dateRange: string
  minAmount: string
  maxAmount: string
}

const Dashboard: React.FC<DashboardProps> = ({ isOpen, setIsOpen }) => {
  const [activeTab, setActiveTab] = useState("All Time")
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatCard[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ORDERS_PER_PAGE = 10

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    status: "",
    paymentMethod: "",
    search: "",
    dateRange: "All Time",
    minAmount: "",
    maxAmount: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const tabs = ["All Time", "12 Months", "30 Days", "7 Days", "24 Hour"]

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [quote, setQuote] = useState("")
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const router = useRouter()
  //added here
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Get date range for filtering
  const getDateRange = (range: string) => {
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case "24 Hour":
        startDate.setHours(now.getHours() - 24)
        break
      case "7 Days":
        startDate.setDate(now.getDate() - 7)
        break
      case "30 Days":
        startDate.setDate(now.getDate() - 30)
        break
      case "12 Months":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return null
    }
    return startDate
  }

  // Apply filters to orders
  const applyFilters = (ordersToFilter: Order[]) => {
    let filtered = [...ordersToFilter]

    // Date range filter - use activeTab for date filtering
    if (activeTab !== "All Time") {
      const startDate = getDateRange(activeTab)
      if (startDate) {
        filtered = filtered.filter((order) => new Date(order.createdAt) >= startDate)
      }
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status)
    }

    // Payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter((order) =>
        order.paymentMethod.toLowerCase().includes(filters.paymentMethod.toLowerCase()),
      )
    }

    // Search filter (Order ID, Customer name, Email)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm) ||
          order.user?.firstName?.toLowerCase().includes(searchTerm) ||
          order.user?.lastName?.toLowerCase().includes(searchTerm) ||
          order.user?.email?.toLowerCase().includes(searchTerm),
      )
    }

    // Amount range filter
    if (filters.minAmount) {
      const minAmount = Number.parseFloat(filters.minAmount)
      filtered = filtered.filter((order) => order.total >= minAmount)
    }

    if (filters.maxAmount) {
      const maxAmount = Number.parseFloat(filters.maxAmount)
      filtered = filtered.filter((order) => order.total <= maxAmount)
    }

    return filtered
  }

  // Update filtered orders when filters or orders change
  useEffect(() => {
    const filtered = applyFilters(orders)
    setFilteredOrders(filtered)
  }, [orders, filters, activeTab])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch orders from your backend API
        const token = getAdminToken() // Get auth token
        if (!token) throw new Error("Login first")

        const ordersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders?page=${currentPage}&limit=${ORDERS_PER_PAGE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        // if (!ordersResponse.ok) {
        //   throw new Error("Failed to fetch orders")
        // }

        const responseData = await ordersResponse.json()
        console.log(responseData) //debug

        // Check if ordersData is an array or if it's nested inside a property
        const ordersData = Array.isArray(responseData) ? responseData : responseData.orders || responseData.data || []

        // Ensure orders is always an array
        if (!Array.isArray(ordersData)) {
          throw new Error("API response format is not as expected")
        }

        // Ensure all order objects have the expected structure
        const validatedOrders = ordersData.map((order) => ({
          ...order,
          // Ensure user object exists
          user: order.user || {
            _id: order.customerInfo?.email || "guest", // using email as fallback ID
            email: order.customerInfo?.email || "unknown",
            firstName: order.customerInfo?.firstName || "Anonymous",
            lastName: order.customerInfo?.lastName || "User",
          },
          // Ensure items is an array
          items: Array.isArray(order.items) ? order.items : [],
          // Ensure other required fields have defaults
          total: order.total || 0,
          status: order.status || "pending",
        }))

        setOrders(validatedOrders)
        setTotalPages(responseData.totalPages || 1)

        // Calculate stats from filtered orders
        const filtered = applyFilters(validatedOrders)
        const totalSales = filtered.reduce((sum, order) => sum + (order.total || 0), 0)

        // Count active orders safely
        const activeOrders = filtered.filter(
          (order) => order.status && ["pending", "processing", "shipped"].includes(order.status),
        ).length

        // Get unique users safely
        const uniqueUserIds = new Set()
        filtered.forEach((order) => {
          if (order.user && order.user._id) {
            uniqueUserIds.add(order.user._id)
          }
        })
        const activeUsers = uniqueUserIds.size

        setStats([
          {
            id: 1,
            title: "Total Sales",
            value: `₹${totalSales.toLocaleString()}`,
            icon: <ShoppingCart className="text-green-500 w-6 h-6" />,
            bgColor: "bg-green-100",
          },
          {
            id: 2,
            title: "Active Orders",
            value: activeOrders.toString(),
            icon: <ClipboardList className="text-red-500 w-6 h-6" />,
            bgColor: "bg-red-100",
          },
          {
            id: 3,
            title: "Active Users",
            value: activeUsers.toString(),
            icon: <Users className="text-blue-500 w-6 h-6" />,
            bgColor: "bg-blue-100",
          },
        ])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage])

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      // ✅ If token is missing, redirect to login page
      router.replace("/admin");

    }
  }, [router]);

  useEffect(() => {
    if (modalOpen) {
      setSubject("");
      setQuote("");
      setSendSuccess(null);
    }
  }, [modalOpen]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      // ✅ If token is missing, redirect to login page
      router.replace("/admin");

    }
  }, [router]);


  //Motivational Email
  const handleSendMotivation = async () => {
    console.log("subject:", subject);
    console.log("quote:", quote);
    if (!subject.trim() || !quote.trim()) {
      setSendSuccess("All fields are required 33333.");
      return;
    }

    try {
      setSending(true)
      const token = getAdminToken()
      console.log(token) //debug

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/motivation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, content: quote }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send")

      setSendSuccess("Motivational email sent!")
      setSubject("")
      setQuote("")
      setModalOpen(false)
    } catch (err: any) {
      setSendSuccess(err.message)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"

      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return `${diffInSeconds} sec ago`
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
      return `${Math.floor(diffInSeconds / 86400)} days ago`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Date error"
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return { bg: "bg-orange-100", text: "text-orange-600" }
      case "shipped":
        return { bg: "bg-blue-100", text: "text-blue-600" }
      case "delivered":
        return { bg: "bg-green-100", text: "text-green-600" }
      case "cancelled":
      case "refunded":
        return { bg: "bg-red-100", text: "text-red-600" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" }
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      paymentMethod: "",
      search: "",
      dateRange: "All Time",
      minAmount: "",
      maxAmount: "",
    })
    setActiveTab("All Time")
  }

  // Get unique payment methods for filter dropdown
  const uniquePaymentMethods = [...new Set(orders.map((order) => order.paymentMethod))]

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      {/* Enhanced Modal for Motivational Email */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <Dialog.Panel className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✉️</span>
            </div>
            <div>
              <Dialog.Title className="text-xl font-bold text-gray-900">Send Motivational Email</Dialog.Title>
              <p className="text-sm text-gray-500">Send inspiration to your team</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                placeholder="Enter email subject..."
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                placeholder="Write your motivational message..."
                rows={4}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
              />
            </div>

            {sendSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">{sendSuccess}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMotivation}
                disabled={sending || !subject.trim() || !quote.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Enhanced View and Edit Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
          setIsEditMode(false)
        }}
        className="fixed inset-0 z-50 flex items-center  justify-center bg-black/50 backdrop-blur-sm"
      >
        <Dialog.Panel className="bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    {isEditMode ? "Edit Order" : "Order Details"}
                  </Dialog.Title>
                  <p className="text-sm text-gray-500">{selectedOrder?.orderNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    Edit Order
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    setSelectedOrder(null)
                    setIsEditMode(false)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {selectedOrder ? (
            <div className="p-8 space-y-8">
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Order Date</h3>
                  </div>
                  <p className="text-gray-700">{formatDate(selectedOrder.createdAt)}</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Total Amount</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${selectedOrder.total.toFixed(2)}</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Status</h3>
                  </div>
                  {isEditMode ? (
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        setSelectedOrder((prev) => (prev ? { ...prev, status: e.target.value as OrderStatus } : prev))
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[
                        "pending",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                        "refunded",
                        "partially_refunded",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status).bg} ${getStatusColor(selectedOrder.status).text}`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tracking Number Field */}
              {isEditMode && selectedOrder.status === "shipped" && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <label className="block text-sm font-medium text-blue-900 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={selectedOrder.trackingNumber || ""}
                    onChange={(e) =>
                      setSelectedOrder((prev) => (prev ? { ...prev, trackingNumber: e.target.value } : prev))
                    }
                    className="w-full border border-blue-300 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tracking number"
                  />
                </div>
              )}

              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedOrder.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    <p className="font-medium">
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                    </p>
                    <p>{selectedOrder.shippingAddress.address1}</p>
                    {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phone && (
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p>{selectedOrder.shippingAddress.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Image
                        src={item.image || "/placeholder.svg?height=60&width=60"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">${selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({selectedOrder.discount.code})</span>
                      <span>-${selectedOrder.discount.amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditMode && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const token = getAdminToken()
                      const updateBody: any = { status: selectedOrder.status }
                      if (selectedOrder.status === "shipped") {
                        updateBody.trackingNumber = selectedOrder.trackingNumber || ""
                      }
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedOrder._id}/status`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify(updateBody),
                        },
                      )
                      if (res.ok) {
                        alert("Order updated successfully!")
                        setIsViewModalOpen(false)
                        setSelectedOrder(null)
                        setIsEditMode(false)
                        // Refresh the orders list
                        window.location.reload()
                      } else {
                        alert("Failed to update order")
                      }
                    }}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading order details...</p>
            </div>
          )}
        </Dialog.Panel>
      </Dialog>

      <div className="flex flex-col h-screen">
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 bg-gray-100 rounded-xl mt-10 ml-68">
            {/* Filter Bar with Motivational Email Button */}
            <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gray-100 w-full">
              <div className="flex items-center space-x-2 bg-white text-gray-700 text-sm border border-[#E0E2E7] w-fit px-4 py-2 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === tab
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Button next to tabs */}
              <button
                onClick={() => setModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md font-medium flex items-center gap-2"
              >
                <span className="text-lg">✉️</span>
                Motivational Email
              </button>
            </div>

            {/* Stats Cards */}
            <div className="flex space-x-4 -mb-10">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-white rounded-xl p-6 w-full flex flex-col space-y-2 border shadow-sm">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-[#667085] text-sm">{stat.title}</h3>
                  <p className="text-2xl text-[#333843] font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="mt-15 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#333843]">Recent Orders</h1>
                <div className="ml-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-x-2 px-4 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                  >
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
                        d="M12.5 13.3333C12.5 12.8731 12.8731 12.5 13.3333 12.5C13.7936 12.5 14.1667 12.8731 14.1667 13.3333V14.1667H16.6667C17.1269 14.1667 17.5 14.5398 17.5 15C17.5 15.4602 17.1269 15.8333 16.6667 15.8333H14.1667V16.6667C14.1667 16.6667 14.1667 17.5 13.3333 17.5C12.8731 17.5 12.5 17.1269 12.5 16.6667V13.3333Z"
                        fill="#667085"
                      />
                      <path
                        d="M2.5 15C2.5 14.5398 2.8731 14.1667 3.33333 14.1667H10.4167C10.6468 14.1667 10.8333 14.3532 10.8333 14.5833V15.4167C10.8333 15.6468 10.6468 15.8333 10.4167 15.8333H3.33333C2.8731 15.8333 2.5 15.4602 2.5 15Z"
                        fill="#667085"
                      />
                    </svg>
                    <h2 className="text-[#333843] text-lg font-medium">Filters</h2>
                  </button>
                </div>
              </div>

              {/* Enhanced Filter Panel */}
              {showFilters && (
                <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Search Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Search Orders</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Order ID, Customer name..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                          value={filters.search}
                          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Order Status</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="" className="text-gray-900">
                          All Statuses
                        </option>
                        <option value="pending" className="text-gray-900">
                          Pending
                        </option>
                        <option value="processing" className="text-gray-900">
                          Processing
                        </option>
                        <option value="shipped" className="text-gray-900">
                          Shipped
                        </option>
                        <option value="delivered" className="text-gray-900">
                          Delivered
                        </option>
                        <option value="cancelled" className="text-gray-900">
                          Cancelled
                        </option>
                        <option value="refunded" className="text-gray-900">
                          Refunded
                        </option>
                      </select>
                    </div>

                    {/* Payment Method Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Method</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        value={filters.paymentMethod}
                        onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      >
                        <option value="" className="text-gray-900">
                          All Methods
                        </option>
                        {uniquePaymentMethods.map((method) => (
                          <option key={method} value={method} className="text-gray-900">
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min Amount Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Min Amount ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
                      />
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium w-full justify-center"
                      >
                        <X className="w-5 h-5" />
                        Clear All Filters
                      </button>
                    </div>
                  </div>

                  {/* Filter Results Summary */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">
                      Showing <span className="text-blue-600 font-bold">{filteredOrders.length}</span> of{" "}
                      <span className="text-gray-900 font-bold">{orders.length}</span> orders
                      {activeTab !== "All Time" && <span className="text-gray-500"> • Filtered by: {activeTab}</span>}
                    </p>
                  </div>
                </div>
              )}

              {/* Orders Table - No Fixed Height, Shows All Orders */}
              <div className="w-full">
                <table className="w-full border-collapse">
                  <colgroup>
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "8%" }} />
                  </colgroup>
                  <thead className="bg-gray-50 h-12 text-gray-600 text-left text-sm font-semibold">
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-200">Order ID</th>
                      <th className="px-6 py-4 border-b border-gray-200">Product</th>
                      <th className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-1">
                          <span>Date</span>
                          <Calendar className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 border-b border-gray-200">Customer</th>
                      <th className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-1">
                          <span>Total</span>
                          <CreditCard className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 border-b border-gray-200">Payment</th>
                      <th className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 border-b border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order, index) => {
                        // Safeguard: Make sure items array exists and has elements
                        const items = Array.isArray(order.items) ? order.items : []
                        const mainItem = items.length > 0 ? items[0] : null
                        const additionalItems = items.length > 1 ? items.length - 1 : 0
                        const statusColors = getStatusColor(order.status)

                        return (
                          <tr
                            key={order._id}
                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber || "N/A"}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <Image
                                  src={mainItem?.image || "/placeholder.svg?height=40&width=40"}
                                  alt={mainItem?.name || "Product"}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                />
                                <div>
                                  <span className="block font-medium text-gray-900">
                                    {mainItem?.name || "Unnamed Product"}
                                  </span>
                                  {additionalItems > 0 && (
                                    <span className="text-gray-500 text-sm">
                                      +{additionalItems} other product{additionalItems > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{formatDate(order.createdAt)}</td>
                            <td className="px-6 py-4">
                              <div>
                                <span className="block font-medium text-gray-900">
                                  {order.user?.firstName || "Anonymous"} {order.user?.lastName || ""}
                                </span>
                                <span className="text-gray-500 text-sm">{order.user?.email || "No email"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">${(order.total || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-gray-700">{order.paymentMethod || "N/A"}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${statusColors.bg} ${statusColors.text}`}
                              >
                                {order.status
                                  ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                  : "Unknown"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                {/* View Button */}
                                <button
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsEditMode(false)
                                    setIsViewModalOpen(true)
                                  }}
                                  title="View Order"
                                >
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
                                      d="M9.99996 4.16663C15.1083 4.16663 17.5256 7.5916 18.3765 9.19278C18.6475 9.70262 18.6475 10.2973 18.3765 10.8071C17.5256 12.4083 15.1083 15.8333 9.99996 15.8333C4.89164 15.8333 2.47436 12.4083 1.62339 10.8071C1.35242 10.2973 1.35242 9.70262 1.62339 9.19277C2.47436 7.59159 4.89164 4.16663 9.99996 4.16663ZM5.69692 7.0647C4.31336 7.98141 3.50548 9.20281 3.09512 9.97494C3.09054 9.98357 3.08865 9.98955 3.08783 9.99283C3.08699 9.99617 3.08683 9.99996 3.08683 9.99996C3.08683 9.99996 3.08699 10.0037 3.08783 10.0071C3.08865 10.0104 3.09054 10.0164 3.09512 10.025C3.50548 10.7971 4.31336 12.0185 5.69692 12.9352C5.1257 12.0994 4.79163 11.0887 4.79163 9.99996C4.79163 8.91121 5.1257 7.90049 5.69692 7.0647ZM14.303 12.9352C15.6866 12.0185 16.4944 10.7971 16.9048 10.025C16.9094 10.0164 16.9113 10.0104 16.9121 10.0071C16.9126 10.0049 16.913 10.0019 16.913 10.0019L16.9131 9.99996L16.9128 9.99629L16.9121 9.99283C16.9113 9.98955 16.9094 9.98357 16.9048 9.97494C16.4944 9.20282 15.6866 7.98142 14.303 7.06471C14.8742 7.9005 15.2083 8.91122 15.2083 9.99996C15.2083 11.0887 14.8742 12.0994 14.303 12.9352ZM6.4583 9.99996C6.4583 8.04395 8.04396 6.45829 9.99997 6.45829C11.956 6.45829 13.5416 8.04395 13.5416 9.99996C13.5416 11.956 11.956 13.5416 9.99997 13.5416C8.04396 13.5416 6.4583 11.956 6.4583 9.99996Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                                {/* Edit Button */}
                                <button
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsEditMode(true)
                                    setIsViewModalOpen(true)
                                  }}
                                  title="Edit Order"
                                >
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
                                      d="M17.3047 6.82016C18.281 5.84385 18.281 4.26093 17.3047 3.28462L16.7155 2.69537C15.7391 1.71906 14.1562 1.71906 13.1799 2.69537L3.69097 12.1843C3.34624 12.529 3.10982 12.967 3.01082 13.4444L2.34111 16.6738C2.21932 17.261 2.73906 17.7807 3.32629 17.6589L6.55565 16.9892C7.03302 16.8902 7.47103 16.6538 7.81577 16.3091L17.3047 6.82016ZM16.1262 4.46313L15.5369 3.87388C15.2115 3.54844 14.6839 3.54844 14.3584 3.87388L13.4745 4.75779L15.2423 6.52556L16.1262 5.64165C16.4516 5.31621 16.4516 4.78857 16.1262 4.46313ZM14.0638 7.70407L12.296 5.9363L4.86948 13.3628C4.75457 13.4777 4.67577 13.6237 4.64277 13.7829L4.23082 15.7692L6.21721 15.3573C6.37634 15.3243 6.52234 15.2455 6.63726 15.1306L14.0638 7.70407Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <Package className="w-12 h-12 text-gray-400" />
                            <p className="text-gray-500 font-medium">
                              {filters.search ||
                                filters.status ||
                                filters.paymentMethod ||
                                filters.minAmount ||
                                filters.maxAmount ||
                                activeTab !== "All Time"
                                ? "No orders match your current filters"
                                : "No orders found"}
                            </p>
                            {(filters.search ||
                              filters.status ||
                              filters.paymentMethod ||
                              filters.minAmount ||
                              filters.maxAmount ||
                              activeTab !== "All Time") && (
                                <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 font-medium">
                                  Clear all filters
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
