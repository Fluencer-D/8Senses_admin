"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getAdminToken } from "@/utils/storage"
import { Search, Filter, X, Package, Tag, BarChart3 } from "lucide-react"

interface InventoryItem {
  _id: string
  image?: string
  name: string // Changed from productName to match API
  category: string
  quantity: number // Changed from stockLevel to match API
  stockStatus: string // Changed from status to match API
}

interface Filters {
  category: string
  stockStatus: string
  minQuantity: string
  maxQuantity: string
}

const Inventory = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [filteredData, setFilteredData] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    category: "",
    stockStatus: "",
    minQuantity: "",
    maxQuantity: "",
  })

  const itemsPerPage = 5

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = getAdminToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/all-inventory`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch inventory")
        const data = await res.json()
        console.log(data) //debug
        console.log(data)
        setInventoryData(data.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...inventoryData]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((item) => item.name?.toLowerCase().includes(query))
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((item) => item.category.toLowerCase().includes(filters.category.toLowerCase()))
    }

    // Stock status filter
    if (filters.stockStatus) {
      filtered = filtered.filter((item) => item.stockStatus === filters.stockStatus)
    }

    // Quantity range filters
    if (filters.minQuantity) {
      const minQty = Number.parseInt(filters.minQuantity)
      filtered = filtered.filter((item) => item.quantity >= minQty)
    }

    if (filters.maxQuantity) {
      const maxQty = Number.parseInt(filters.maxQuantity)
      filtered = filtered.filter((item) => item.quantity <= maxQty)
    }

    setFilteredData(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Apply filters whenever search query or filters change
  useEffect(() => {
    applyFilters()
  }, [inventoryData, searchQuery, filters])

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "",
      stockStatus: "",
      minQuantity: "",
      maxQuantity: "",
    })
    setSearchQuery("")
  }

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(inventoryData.map((item) => item.category))].filter(Boolean)

  // Get unique stock statuses for filter dropdown
  const uniqueStockStatuses = [...new Set(inventoryData.map((item) => item.stockStatus))].filter(Boolean)

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-700"
      case "Low Stock":
        return "bg-red-100 text-red-500"
      case "Out of Stock":
        return "bg-orange-100 text-orange-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const goToPage = (page: number) => setCurrentPage(page)

  if (loading) return <div className="p-6">Loading inventory...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      <h1 className="text-[#333843] text-3xl font-bold mb-2">Inventory</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer font-medium">E-commerce</span>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">Inventory</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-white border border-[#E0E2E7] text-gray-900 text-sm rounded-lg block w-full pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent placeholder-gray-500"
            placeholder="Search inventory by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Button */}
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
            {(filters.category || filters.stockStatus || filters.minQuantity || filters.maxQuantity) && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 bg-white"
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="" className="text-gray-900">
                  All Categories
                </option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category} className="text-gray-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Stock Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 bg-white"
                value={filters.stockStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, stockStatus: e.target.value }))}
              >
                <option value="" className="text-gray-900">
                  All Stock Levels
                </option>
                {uniqueStockStatuses.map((status) => (
                  <option key={status} value={status} className="text-gray-900">
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Quantity Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Min Quantity
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                value={filters.minQuantity}
                onChange={(e) => setFilters((prev) => ({ ...prev, minQuantity: e.target.value }))}
              />
            </div>

            {/* Max Quantity Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Max Quantity</label>
              <input
                type="number"
                placeholder="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                value={filters.maxQuantity}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxQuantity: e.target.value }))}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700">
              Showing <span className="text-[#C83C92] font-bold">{filteredData.length}</span> of{" "}
              <span className="text-gray-900 font-bold">{inventoryData.length}</span> items
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

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery || Object.values(filters).some((filter) => filter)
                ? "No inventory items match your current filters"
                : "No inventory items found"}
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
            <div className="grid grid-cols-5 p-4 border-b border-[#E0E2E7] bg-[#F9F9FC] text-[#1E437A] font-semibold">
              <div className="col-span-1">Product Name</div>
              <div className="col-span-1">Category</div>
              <div className="col-span-1">Stock Level</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Table Body */}
            {currentItems.map((item, index) => (
              <div
                key={item._id}
                className={`grid grid-cols-5 p-4 border-b border-[#E0E2E7] items-center hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <div className="col-span-1 text-[#1E437A] font-medium">{item.name}</div>
                <div className="col-span-1 text-[#1E437A]">{item.category}</div>
                <div className="col-span-1 text-[#1E437A] font-semibold">{item.quantity}</div>
                <div className="col-span-1">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusBadgeStyle(item.stockStatus)}`}
                  >
                    {item.stockStatus}
                  </span>
                </div>
                <Link href={`/ecommerce/inventory/updateStock?id=${item._id}`} className="col-span-1">
                  <button className="text-[#C83C92] hover:text-[#B8358A] flex items-center gap-2 cursor-pointer font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M17.3047 6.81991C18.281 5.8436 18.281 4.26069 17.3047 3.28438L16.7155 2.69512C15.7391 1.71881 14.1562 1.71881 13.1799 2.69512L3.69097 12.1841C3.34624 12.5288 3.10982 12.9668 3.01082 13.4442L2.34111 16.6735C2.21932 17.2607 2.73906 17.7805 3.32629 17.6587L6.55565 16.989C7.03302 16.89 7.47103 16.6536 7.81577 16.3089L17.3047 6.81991ZM16.1262 4.46289L15.5369 3.87363C15.2115 3.5482 14.6839 3.5482 14.3584 3.87363L13.4745 4.75755L15.2423 6.52531L16.1262 5.6414C16.4516 5.31596 16.4516 4.78833 16.1262 4.46289ZM14.0638 7.70382L12.296 5.93606L4.86948 13.3626C4.75457 13.4775 4.67577 13.6235 4.64277 13.7826L4.23082 15.769L6.21721 15.3571C6.37634 15.3241 6.52234 15.2453 6.63726 15.1303L14.0638 7.70382Z"
                        fill="currentColor"
                      />
                    </svg>
                    Update Stock
                  </button>
                </Link>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Enhanced Pagination */}
      {filteredData.length > 0 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
            {totalItems} items
          </div>
          <div className="flex gap-2">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E0E2E7] disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  currentPage === index + 1
                    ? "bg-[#C83C92] text-white"
                    : "border border-[#E0E2E7] hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E0E2E7] disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium"
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

export default Inventory
