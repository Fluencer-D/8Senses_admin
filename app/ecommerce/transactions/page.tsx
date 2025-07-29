"use client"
import { getAdminToken } from "@/utils/storage"
import { useEffect, useState } from "react"
import { Search, Filter, X, Calendar, DollarSign, CreditCard } from "lucide-react"

interface Transaction {
  _id: string
  orderNumber: string
  customerName: string
  amount: number
  status: "Pending" | "Successful" | "Failed"
  createdAt: string
}

interface Filters {
  status: string
  minAmount: string
  maxAmount: string
  dateRange: string
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    status: "",
    minAmount: "",
    maxAmount: "",
    dateRange: "",
  })

  //transaction
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    // Only attempt to fetch after component is mounted on client
    if (typeof window === "undefined") return

    try {
      const token = getAdminToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch transactions")
      const data = await res.json()
      console.log(data)
      const transactionsArray = data.data
      const formatted: Transaction[] = transactionsArray.map((txn: any) => ({
        _id: txn?._id,
        orderNumber: txn?.orderNumber ?? txn?.transactionId, // fallback if orderNumber is null
        customerName: txn?.customerName || "Unknown",
        amount: txn?.amount ?? txn?.total,
        status: txn?.status === "successful" ? "Successful" : txn?.status === "failed" ? "Failed" : "Pending",
        createdAt: new Date(txn?.createdAt).toLocaleString(),
      }))
      setTransactions(formatted)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
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
    let filtered = [...transactions]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.customerName.toLowerCase().includes(query) ||
          item._id.toLowerCase().includes(query) ||
          item.orderNumber.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((transaction) => transaction.status === filters.status)
    }

    // Amount range filters
    if (filters.minAmount) {
      const minAmount = Number.parseFloat(filters.minAmount)
      filtered = filtered.filter((transaction) => transaction.amount >= minAmount)
    }

    if (filters.maxAmount) {
      const maxAmount = Number.parseFloat(filters.maxAmount)
      filtered = filtered.filter((transaction) => transaction.amount <= maxAmount)
    }

    // Date range filter
    if (filters.dateRange) {
      const startDate = getDateRange(filters.dateRange)
      if (startDate) {
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.createdAt)
          return transactionDate >= startDate
        })
      }
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Apply filters whenever search query or filters change
  useEffect(() => {
    applyFilters()
  }, [transactions, searchQuery, filters])

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
  const uniqueStatuses = [...new Set(transactions.map((transaction) => transaction.status))].filter(Boolean)

  const totalItems = filteredTransactions.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)

  const getStatusBadgeStyle = (status: Transaction["status"]): string => {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-orange-100 text-orange-600"
      case "Failed":
        return "bg-red-100 text-red-500"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  //open-modal to view details
  const openModal = (txn: Transaction) => {
    setSelectedTransaction(txn)
    setShowModal(true)
  }

  //close-modal
  const closeModal = () => {
    setSelectedTransaction(null)
    setShowModal(false)
  }

  // For initial server render, show a minimal loading state
  if (!isClient) {
    return <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">Loading...</div>
  }

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#333843] text-3xl font-bold">Transactions</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-blue-600 cursor-pointer font-medium">E-commerce</span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800 font-semibold">Transactions</span>
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
            placeholder="Search by customer, transaction ID, or order ID..."
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
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
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
                <CreditCard className="w-4 h-4" />
                Transaction Status
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
                Min Amount (₹)
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
              <label className="block text-sm font-semibold text-gray-800 mb-2">Max Amount (₹)</label>
              <input
                type="number"
                placeholder="10000.00"
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
              Showing <span className="text-[#C83C92] font-bold">{filteredTransactions.length}</span> of{" "}
              <span className="text-gray-900 font-bold">{transactions.length}</span> transactions
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

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery || Object.values(filters).some((filter) => filter)
                ? "No transactions match your current filters"
                : "No transactions found"}
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
            <div
              className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_2fr_1fr] p-4 border-b border-gray-200 bg-[#F9F9FC] text-[#1E437A] font-semibold"
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
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#C83C92] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : (
              currentItems.map((txn, index) => (
                <div
                  key={txn?._id}
                  className={`grid grid-cols-[2fr_1fr_2fr_1fr_1fr_2fr_1fr] p-4 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                  style={{ minWidth: "900px" }}
                >
                  <div className="text-[#1E437A] truncate font-medium" title={txn?._id}>
                    {txn?._id.slice(-8)}
                  </div>
                  <div className="text-[#1E437A] truncate font-medium" title={`#${txn?.orderNumber}`}>
                    #{txn?.orderNumber.slice(-6)}
                  </div>
                  <div className="text-[#1E437A] truncate" title={txn?.customerName}>
                    {txn?.customerName}
                  </div>
                  <div className="text-[#1E437A] font-semibold">₹{txn?.amount.toFixed(2)}</div>
                  <div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeStyle(txn?.status)}`}
                    >
                      {txn?.status}
                    </span>
                  </div>
                  <div className="text-[#1E437A] whitespace-nowrap truncate text-sm" title={txn?.createdAt}>
                    {txn?.createdAt}
                  </div>
                  <div>
                    <button
                      className="flex items-center gap-2 text-[#C83C92] hover:text-[#B8358A] whitespace-nowrap font-medium transition-colors"
                      onClick={() => openModal(txn)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
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
          </>
        )}

        {/* Enhanced Modal */}
        {showModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#C83C92] bg-opacity-10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#C83C92]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E437A]">Transaction Details</h2>
                  <p className="text-sm text-gray-500">Complete transaction information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-semibold text-gray-900">{selectedTransaction._id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-semibold text-gray-900">#{selectedTransaction.orderNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="font-semibold text-gray-900 text-lg">₹{selectedTransaction.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="font-semibold text-gray-900">{selectedTransaction.customerName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyle(
                        selectedTransaction.status,
                      )}`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Created At</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedTransaction.createdAt}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-[#C83C92] text-white rounded-lg hover:bg-[#b12d80] transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalItems > 0 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} transactions
          </div>
          <div className="flex gap-2">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#C83C92] text-white"
                    : "bg-[rgba(200,60,146,0.1)] text-[#C83C92] border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
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

export default Transactions
