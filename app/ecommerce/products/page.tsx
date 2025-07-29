"use client"
import { getAdminToken } from "@/utils/storage"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, Filter, X, Package, DollarSign, Calendar, Tag } from "lucide-react"

interface Product {
  _id: string
  name: string
  sku?: string
  category: string | { name: string }
  quantity: number
  price: number
  discountType?: string
  discountedPrice?: number
  status: "active" | "draft" | "inactive" | "discontinued"
  createdAt: string
  images?: Array<{
    url: string
    isMain?: boolean
  }>
}

interface StockStatus {
  status: string
  color: string
}

interface Filters {
  category: string
  status: string
  stockStatus: string
  minPrice: string
  maxPrice: string
  dateRange: string
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    category: "",
    status: "",
    stockStatus: "",
    minPrice: "",
    maxPrice: "",
    dateRange: "",
  })

  const itemsPerPage = 5

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const responseData = await response.json()
        console.log("Fetched API Response:", responseData) // Debugging
        // Extract products from the `data` key
        if (responseData && Array.isArray(responseData.data)) {
          setProducts(responseData.data)
        } else {
          throw new Error("Unexpected API response format")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([]) // Prevents errors when filtering
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Get date range for filtering
  const getDateRange = (range: string) => {
    const now = new Date()
    const startDate = new Date()

    switch (range) {
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

  // Get stock status for filtering
  const getProductStockStatus = (quantity: number): string => {
    if (quantity <= 0) return "outofstock"
    if (quantity < 10) return "lowstock"
    return "instock"
  }

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) || (product.sku && product.sku.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((product) => {
        const categoryName = typeof product.category === "object" ? product.category.name : product.category
        return categoryName.toLowerCase().includes(filters.category.toLowerCase())
      })
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((product) => product.status === filters.status)
    }

    // Stock status filter
    if (filters.stockStatus) {
      filtered = filtered.filter((product) => {
        const stockStatus = getProductStockStatus(product.quantity)
        return stockStatus === filters.stockStatus
      })
    }

    // Price range filter
    if (filters.minPrice) {
      const minPrice = Number.parseFloat(filters.minPrice)
      filtered = filtered.filter((product) => product.price >= minPrice)
    }

    if (filters.maxPrice) {
      const maxPrice = Number.parseFloat(filters.maxPrice)
      filtered = filtered.filter((product) => product.price <= maxPrice)
    }

    // Date range filter
    if (filters.dateRange) {
      const startDate = getDateRange(filters.dateRange)
      if (startDate) {
        filtered = filtered.filter((product) => new Date(product.createdAt) >= startDate)
      }
    }

    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Apply filters whenever search query or filters change
  useEffect(() => {
    applyFilters()
  }, [products, searchQuery, filters])

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = getAdminToken() // if your backend is protected
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || "Failed to delete product")
        }
        // Remove from local state
        setProducts((prev) => prev.filter((p) => p._id !== productId))
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Failed to delete product. Check console for more info.")
      }
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "",
      status: "",
      stockStatus: "",
      minPrice: "",
      maxPrice: "",
      dateRange: "",
    })
    setSearchQuery("")
  }

  // Get unique categories for filter dropdown
  const uniqueCategories = [
    ...new Set(
      products.map((product) => (typeof product.category === "object" ? product.category.name : product.category)),
    ),
  ].filter(Boolean)

  // Helper function to get status color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-[#E7F4EE] text-[#0D894F]"
      case "draft":
        return "bg-[#F0F1F3] text-[#456696]"
      case "inactive":
        return "bg-[#FDF1E8] text-[#E46A11]"
      case "discontinued":
        return "bg-red-200 text-red-700"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Helper function to get stock status
  const getStockStatus = (quantity: number): StockStatus => {
    if (quantity <= 0) {
      return { status: "Out of Stock", color: "bg-red-200 text-red-700" }
    } else if (quantity < 10) {
      return { status: "Low Stock", color: "bg-[#FDF1E8] text-[#E46A11]" }
    } else {
      return { status: quantity.toString(), color: "" }
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-6 w-[81%] ml-71 mt-20 overflow-hidden">
      {/* Breadcrumb and Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[#333843] font-inter font-medium text-2xl leading-8 tracking-[0.12px]">Products</h2>
          <p className="text-sm text-gray-500 flex items-center">
            <span className="text-[#245BA7] font-inter font-medium text-sm leading-5 tracking-[0.07px]">
              E-commerce
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="mx-2"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.59467 3.96967C6.30178 4.26256 6.30178 4.73744 6.59467 5.03033L10.5643 9L6.59467 12.9697C6.30178 13.2626 6.30178 13.7374 6.59467 14.0303C6.88756 14.3232 7.36244 14.3232 7.65533 14.0303L12.4205 9.26516C12.5669 9.11872 12.5669 8.88128 12.4205 8.73484L7.65533 3.96967C7.36244 3.67678 6.88756 3.67678 6.59467 3.96967Z"
                fill="#A3A9B6"
              />
            </svg>
            <span className="text-[#667085]">Products</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={"/ecommerce/products/addProduct"}>
            <button className="px-6 py-2.5 bg-[#C83C92] text-white font-semibold rounded-lg hover:bg-[#B8358A] transition-colors">
              + Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center border border-gray-300 bg-white px-4 py-3 w-80 rounded-lg shadow-sm">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="ml-3 w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-3">
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
            {(filters.category ||
              filters.status ||
              filters.stockStatus ||
              filters.minPrice ||
              filters.maxPrice ||
              filters.dateRange) && <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>}
          </button>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 bg-white"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="" className="text-gray-900">
                  All Statuses
                </option>
                <option value="active" className="text-gray-900">
                  Active
                </option>
                <option value="draft" className="text-gray-900">
                  Draft
                </option>
                <option value="inactive" className="text-gray-900">
                  Inactive
                </option>
                <option value="discontinued" className="text-gray-900">
                  Discontinued
                </option>
              </select>
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Stock Status</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 bg-white"
                value={filters.stockStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, stockStatus: e.target.value }))}
              >
                <option value="" className="text-gray-900">
                  All Stock Levels
                </option>
                <option value="instock" className="text-gray-900">
                  In Stock
                </option>
                <option value="lowstock" className="text-gray-900">
                  Low Stock
                </option>
                <option value="outofstock" className="text-gray-900">
                  Out of Stock
                </option>
              </select>
            </div>

            {/* Min Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Min Price ($)
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                value={filters.minPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
              />
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Max Price ($)</label>
              <input
                type="number"
                placeholder="1000.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Added Date
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92] focus:border-transparent text-gray-900 bg-white"
                value={filters.dateRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="" className="text-gray-900">
                  All Time
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
              Showing <span className="text-[#C83C92] font-bold">{filteredProducts.length}</span> of{" "}
              <span className="text-gray-900 font-bold">{products.length}</span> products
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

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-[#C83C92] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery || Object.values(filters).some((filter) => filter)
                ? "No products match your current filters"
                : "No products found"}
            </p>
            {(searchQuery || Object.values(filters).some((filter) => filter)) && (
              <button onClick={clearFilters} className="text-[#C83C92] hover:text-[#B8358A] font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9F9FC] text-[#1E437A] text-sm">
                <tr>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Added</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((product, index) => {
                  const stockInfo = getStockStatus(product.quantity)
                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 && (
                              <img
                                src={product.images.find((img) => img.isMain)?.url || product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <Link href={`/ecommerce/products/viewProduct?id=${product._id}`}>
                            <span className="text-[#1E437A] font-medium hover:text-[#C83C92] transition-colors cursor-pointer">
                              {product.name}
                            </span>
                          </Link>
                        </div>
                      </td>
                      <td className="p-4 text-[#1E437A] font-semibold">{product.sku || "N/A"}</td>
                      <td className="p-4 text-[#1E437A]">
                        {product.category
                          ? typeof product.category === "object"
                            ? product.category.name
                            : product.category
                          : "Uncategorized"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-sm font-medium ${stockInfo.color || "text-[#456696]"}`}
                        >
                          {stockInfo.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#456696] font-semibold">
                        ${product.price.toFixed(2)}
                        {product.discountType !== "none" &&
                          product.discountedPrice &&
                          product.discountedPrice < product.price && (
                            <span className="ml-2 text-sm line-through text-gray-400">${product.price.toFixed(2)}</span>
                          )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(product.status)}`}
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-[#456696]">{formatDate(product.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link href={`/ecommerce/products/viewProduct?id=${product._id}`}>
                            <button
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Product"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
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
                          </Link>
                          <Link href={`/ecommerce/products/viewProduct?id=${product._id}`}>
                            <button
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
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
                          </Link>
                          <button
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteProduct(product._id)}
                            title="Delete Product"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M8.33329 8.12496C8.79353 8.12496 9.16663 8.49806 9.16663 8.95829V13.9583C9.16663 14.4185 8.79353 14.7916 8.33329 14.7916C7.87306 14.7916 7.49996 14.4185 7.49996 13.9583V8.95829C7.49996 8.49806 7.87306 8.12496 8.33329 8.12496Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12.5 8.95829C12.5 8.49806 12.1269 8.12496 11.6666 8.12496C11.2064 8.12496 10.8333 8.49806 10.8333 8.95829V13.9583C10.8333 14.4185 11.2064 14.7916 11.6666 14.7916C12.1269 14.7916 12.5 14.4185 12.5 13.9583V8.95829Z"
                                fill="currentColor"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15 4.99996V4.16663C15 2.78591 13.8807 1.66663 12.5 1.66663H7.49996C6.11925 1.66663 4.99996 2.78591 4.99996 4.16663V4.99996H3.74996C3.28972 4.99996 2.91663 5.37306 2.91663 5.83329C2.91663 6.29353 3.28972 6.66663 3.74996 6.66663H4.16663V15.8333C4.16663 17.214 5.28591 18.3333 6.66663 18.3333H13.3333C14.714 18.3333 15.8333 17.214 15.8333 15.8333V6.66663H16.25C16.7102 6.66663 17.0833 6.29353 17.0833 5.83329C17.0833 5.37306 16.7102 4.99996 16.25 4.99996H15ZM12.5 3.33329H7.49996C7.03972 3.33329 6.66663 3.70639 6.66663 4.16663V4.99996H13.3333V4.16663C13.3333 3.70639 12.9602 3.33329 12.5 3.33329ZM14.1666 6.66663H5.83329V15.8333C5.83329 16.2935 6.20639 16.6666 6.66663 16.6666H13.3333C13.7935 16.6666 14.1666 16.2935 14.1666 15.8333V6.66663Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
            {filteredProducts.length} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#C83C92] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
