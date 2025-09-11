"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getAdminToken } from "@/utils/storage"
import { Search, Filter, X, Calendar, Users, Eye, Edit, Trash2 } from "lucide-react" // Import new icons
import { Dialog } from "@headlessui/react" // Import Dialog from headlessui
import { useRouter } from "next/navigation"



interface Webinar {
  _id: string
  title: string
  speaker: string
  date: string // Original date string from API (e.g., "2023-10-26T00:00:00.000Z")
  startTime: string // Original time string from API (e.g., "14:00")
  duration: number // in minutes
  maxRegistrations: number
  status: "Live" | "Upcoming" | "Completed" | "Cancelled" // Capitalized for UI
  url: string
  thumbnail: string
  description: string
  tags: string[]
  participantsCount: number
  displayDateTime: string // Formatted for table display
}

interface Filters {
  status: string
  dateRange: string
}

const WebinarsManagement = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [webinarsPerPage] = useState(5) // Adjust this number as needed
  const [totalPages, setTotalPages] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [webinarsData, setWebinarsData] = useState<Webinar[]>([])
  const [filteredWebinars, setFilteredWebinars] = useState<Webinar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false) // State to toggle filter panel
  const [filters, setFilters] = useState<Filters>({ status: "", dateRange: "" }) // Declare filters state

  // Modal states
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const router = useRouter()


  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const token = getAdminToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webinars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch webinars")
        const data = await res.json()

        interface WebinarApiResponse {
          _id: string
          title: string
          speaker: string
          date: string
          startTime: string
          duration: number
          maxRegistrations: number
          status: string
          url: string
          thumbnail: string
          description: string
          tags: string[]
          participantsCount: number
          [key: string]: any // for any other properties
        }

        const formattedData: Webinar[] = data.data.map((webinar: WebinarApiResponse) => ({
          _id: webinar._id,
          title: webinar.title,
          speaker: webinar.speaker,
          date: webinar.date, // Store original date string
          startTime: webinar.startTime, // Store original time string
          duration: webinar.duration,
          maxRegistrations: webinar.maxRegistrations,
          status: capitalizeFirstLetter(webinar.status),
          url: webinar.url,
          thumbnail: webinar.thumbnail,
          description: webinar.description,
          tags: webinar.tags || [], // Ensure tags is an array
          participantsCount: webinar.participantsCount || 0,
          displayDateTime: `${new Date(webinar.date).toLocaleDateString()} ${webinar.startTime}`,
        }))
        setWebinarsData(formattedData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    const capitalizeFirstLetter = (string: string): Webinar["status"] => {
      if (!string) return "Upcoming" // Default status if string is empty
      const capitalized = string.charAt(0).toUpperCase() + string.slice(1)
      // Ensure it matches one of the defined statuses
      if (["Live", "Upcoming", "Completed", "Cancelled"].includes(capitalized)) {
        return capitalized as Webinar["status"]
      }
      return "Upcoming" // Fallback for unknown statuses
    }
    fetchWebinars()
  }, []);

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

  useEffect(() => {
    let currentFiltered = [...webinarsData]

    // Apply search term filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase()
      currentFiltered = currentFiltered.filter(
        (webinar) =>
          webinar.title.toLowerCase().includes(query) ||
          webinar.speaker.toLowerCase().includes(query) ||
          webinar.status.toLowerCase().includes(query) ||
          webinar.displayDateTime.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filters.status) {
      currentFiltered = currentFiltered.filter((webinar) => webinar.status === filters.status)
    }

    // Apply date range filter
    if (filters.dateRange) {
      const startDate = getDateRange(filters.dateRange)
      if (startDate) {
        currentFiltered = currentFiltered.filter((webinar) => {
          const webinarDate = new Date(webinar.date) // Use the ISO string for accurate comparison
          return !isNaN(webinarDate.getTime()) && webinarDate >= startDate
        })
      }
    }

    // Calculate total pages based on filtered results
    const calculatedTotalPages = Math.ceil(currentFiltered.length / webinarsPerPage)
    setTotalPages(calculatedTotalPages)

    // Adjust current page if it's out of bounds after filtering
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(calculatedTotalPages)
    } else if (calculatedTotalPages === 0) {
      setCurrentPage(1) // Reset to page 1 if no results
    }

    // Get current page webinars
    const indexOfLastWebinar = currentPage * webinarsPerPage
    const indexOfFirstWebinar = indexOfLastWebinar - webinarsPerPage
    const paginatedWebinars = currentFiltered.slice(indexOfFirstWebinar, indexOfLastWebinar)
    setFilteredWebinars(paginatedWebinars)
  }, [searchTerm, webinarsData, currentPage, webinarsPerPage, filters]) // Add filters to dependencies

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-[#FDF1E8] text-[#E46A11]"
      case "Upcoming":
        return "bg-[#FEEDEC] text-[#F04438]"
      case "Completed":
        return "bg-[#E7F4EE] text-[#0D894F]"
      case "Cancelled":
        return "bg-gray-200 text-gray-700"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const deleteWebinar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webinar?")) return
    try {
      const token = getAdminToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webinars/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to delete webinar")
      // Remove the deleted webinar from state
      setWebinarsData(webinarsData.filter((webinar) => webinar._id !== id))
      setSaveSuccess("Webinar deleted successfully!")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      dateRange: "",
    })
    setSearchTerm("")
    setCurrentPage(1) // Reset to first page
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(webinarsData.map((webinar) => webinar.status))].filter(Boolean)

  // For initial server render, show a minimal loading state
  useEffect(() => {
    setIsClient(true)
  }, []);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      // ✅ If token is missing, redirect to login page
      router.replace("/admin");

    }
  }, [router]);

  // Handle opening view/edit modal
  const openWebinarModal = async (webinarId: string, editMode: boolean) => {
    setSaveSuccess(null) // Clear previous messages
    setIsSaving(false) // Reset saving state
    try {
      const token = getAdminToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webinars/${webinarId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch webinar details")
      const data = await res.json()
      const fetchedWebinar = data.data

      // Format date for input type="date" (YYYY-MM-DD)
      const formattedDate = new Date(fetchedWebinar.date).toISOString().split("T")[0]

      setSelectedWebinar({
        ...fetchedWebinar,
        date: formattedDate, // Use formatted date for input
        displayDateTime: `${new Date(fetchedWebinar.date).toLocaleDateString()} ${fetchedWebinar.startTime}`,
        status: capitalizeFirstLetter(fetchedWebinar.status), // Ensure status is capitalized for UI
        tags: fetchedWebinar.tags || [],
      })
      setIsEditMode(editMode)
      setIsModalOpen(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Handle saving changes from edit modal
  const handleSaveWebinar = async () => {
    if (!selectedWebinar) return

    setIsSaving(true)
    setSaveSuccess(null)
    setError(null)

    try {
      const token = getAdminToken()
      const payload = {
        ...selectedWebinar,
        // Ensure date is sent as a valid Date string or ISO string
        date: new Date(selectedWebinar.date).toISOString(),
        // Tags need to be an array of strings
        tags: Array.isArray(selectedWebinar.tags)
          ? selectedWebinar.tags
          : selectedWebinar.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        status: selectedWebinar.status.toLowerCase(), // Convert back to lowercase for API
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webinars/${selectedWebinar._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update webinar")

      setSaveSuccess("Webinar updated successfully!")
      // Update the webinar in the main data array
      setWebinarsData((prev) =>
        prev.map((webinar) =>
          webinar._id === selectedWebinar._id
            ? {
              ...selectedWebinar,
              displayDateTime: `${new Date(selectedWebinar.date).toLocaleDateString()} ${selectedWebinar.startTime}`,
              status: capitalizeFirstLetter(selectedWebinar.status),
            }
            : webinar,
        ),
      )
      setIsModalOpen(false) // Close modal on success
    } catch (err: any) {
      setError(err.message)
      setSaveSuccess(null) // Clear success message on error
    } finally {
      setIsSaving(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedWebinar(null)
    setIsEditMode(false)
    setSaveSuccess(null)
    setError(null)
  }

  const capitalizeFirstLetter = (string: string): Webinar["status"] => {
    if (!string) return "Upcoming"
    const capitalized = string.charAt(0).toUpperCase() + string.slice(1)
    if (["Live", "Upcoming", "Completed", "Cancelled"].includes(capitalized)) {
      return capitalized as Webinar["status"]
    }
    return "Upcoming"
  }

  if (!isClient || loading)
    return (
      <div className="p-6 w-[81%] ml-71 mt-20 overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C83C92]"></div>
        </div>
      </div>
    )

  if (error && !isModalOpen)
    return (
      <div className="p-6 w-[81%] ml-71 mt-20 overflow-hidden">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()} // Simple reload to re-fetch
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )

  const totalFilteredItems = webinarsData.filter(
    (webinar) =>
      (searchTerm.trim() === "" ||
        webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        webinar.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        webinar.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        webinar.displayDateTime.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.status === "" || webinar.status === filters.status) &&
      (filters.dateRange === "" ||
        (getDateRange(filters.dateRange) && new Date(webinar.date) >= getDateRange(filters.dateRange)!)),
  ).length

  return (
    <div className="p-6 w-[81%] ml-71 mt-20 overflow-hidden">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[#333843] font-inter font-medium text-2xl leading-8 tracking-[0.12px]">Webinars</h2>
          <p className="text-sm text-gray-500 flex items-center">
            <span className="text-[#245BA7] font-inter font-medium text-sm leading-5 tracking-[0.07px]">
              Courses & Webinars
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
            <span className="text-[#667085]">Webinars</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={"/coursesWeb/webinars/addWebinar"}>
            <button className="px-4 py-2 bg-[#C83C92] text-white font-semibold rounded-md">
              + Schedule New Webinar
            </button>
          </Link>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center border border-gray-300 bg-white px-4 py-2 w-80 rounded-lg shadow-sm">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            style={{ color: 'black' }}
            type="text"
            placeholder="Search webinar..."
            className="ml-2 w-full bg-transparent focus:outline-none text-[#858D9D] placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${showFilters
              ? "border-[#C83C92] bg-[#C83C92] text-white"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
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
                <Users className="w-4 h-4" />
                Webinar Status
              </label>
              <select
                style={{ color: "black" }}
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
                Webinar Date
              </label>
              <select
                style={{ color: "black" }}
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
              Showing <span className="text-[#C83C92] font-bold">{totalFilteredItems}</span> of{" "}
              <span className="text-gray-900 font-bold">{webinarsData.length}</span> webinars
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

      {/* Webinars Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-5 py-4 px-6 font-medium text-[#1E437A] bg-[#F9F9FC]">
          <div className="col-span-2">Webinar Title</div>
          <div className="col-span-1">Speaker</div>
          <div className="col-span-1 ">Date & Time</div>
          <div className="col-span-1 flex justify-between">
            <span>Status</span>
            <span>Action</span>
          </div>
        </div>
        {/* Table Body */}
        {filteredWebinars.length > 0 ? (
          filteredWebinars.map((webinar, index) => (
            <div
              key={webinar._id}
              className={`grid grid-cols-5 py-4 px-6 border-t border-gray-200 items-center hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
            >
              <div className="col-span-2 flex items-center">
                <div className="h-12 w-12 bg-gray-100 rounded-md mr-3 flex-shrink-0 overflow-hidden">
                  <img
                    src={webinar.thumbnail || "/placeholder.svg?height=48&width=48&text=Webinar"}
                    alt={webinar.title}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-[#1E437A] font-medium">{webinar.title}</span>
              </div>
              <div className="col-span-1 flex items-center text-[#1E437A]">{webinar.speaker}</div>
              <div className="col-span-1 flex items-center text-[#1E437A]">{webinar.displayDateTime}</div>
              <div className="col-span-1 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(webinar.status)}`}>
                  {webinar.status}
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg p-1 transition-colors"
                    onClick={() => openWebinarModal(webinar._id, false)}
                    title="View Webinar"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg p-1 transition-colors"
                    onClick={() => openWebinarModal(webinar._id, true)}
                    title="Edit Webinar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg p-1 transition-colors"
                    onClick={() => deleteWebinar(webinar._id)}
                    title="Delete Webinar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {searchTerm || filters.status || filters.dateRange
                ? "No webinars match your current filters"
                : "No webinars found"}
            </p>
            {(searchTerm || filters.status || filters.dateRange) && (
              <button onClick={clearFilters} className="text-[#C83C92] hover:text-[#B8358A] font-medium">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center mt-4 py-4 bg-white rounded-lg shadow-sm px-6">
          <div className="text-sm text-gray-600">
            Showing {filteredWebinars.length} of {totalFilteredItems} webinars
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              Previous
            </button>
            {/* Page Number Buttons */}
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => goToPage(index + 1)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${currentPage === index + 1
                  ? "bg-[#C83C92] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View/Edit Webinar Modal */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <Dialog.Panel className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            {/* <div className="w-12 h-12 bg-[#C83C92] bg-opacity-10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#C83C92]" />
            </div> */}
            <div>
              <Dialog.Title className="text-xl font-bold text-[#1E437A]">
                {isEditMode ? "Edit Webinar" : "Webinar Details"}
              </Dialog.Title>
              <p className="text-sm text-gray-500">{selectedWebinar?.title}</p>
            </div>
            <button onClick={closeModal} className="ml-auto p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedWebinar ? (
            <div className="space-y-6">
              {isEditMode ? (
                // Edit Form
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      style={{ color: 'black' }}
                      type="text"
                      value={selectedWebinar.title}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, title: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
                    <input
                      style={{ color: 'black' }}
                      type="text"
                      value={selectedWebinar.speaker}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, speaker: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      style={{ color: 'black' }}
                      type="date"
                      value={selectedWebinar.date}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, date: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      style={{ color: 'black' }}
                      type="time"
                      value={selectedWebinar.startTime}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, startTime: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      style={{ color: 'black' }}
                      type="number"
                      value={selectedWebinar.duration}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, duration: Number(e.target.value) })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Registrations</label>
                    <input
                      style={{ color: 'black' }}
                      type="number"
                      value={selectedWebinar.maxRegistrations}
                      onChange={(e) =>
                        setSelectedWebinar({ ...selectedWebinar, maxRegistrations: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      style={{ color: "black" }}
                      value={selectedWebinar.status}
                      onChange={(e) =>
                        setSelectedWebinar({ ...selectedWebinar, status: e.target.value as Webinar["status"] })
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Live">Live</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                      style={{ color: 'black' }}
                      type="url"
                      value={selectedWebinar.url}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, url: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                    <input
                      style={{ color: 'black' }}
                      type="url"
                      value={selectedWebinar.thumbnail}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, thumbnail: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      style={{ color: "black" }}
                      value={selectedWebinar.description}
                      onChange={(e) => setSelectedWebinar({ ...selectedWebinar, description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      style={{ color: 'black' }}
                      type="text"
                      value={selectedWebinar.tags.join(", ")}
                      onChange={(e) =>
                        setSelectedWebinar({
                          ...selectedWebinar,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C83C92]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Participants Count</label>
                    <input
                      style={{ color: 'black' }}
                      type="number"
                      value={selectedWebinar.participantsCount}
                      onChange={(e) =>
                        setSelectedWebinar({ ...selectedWebinar, participantsCount: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
                      disabled // Usually not directly editable
                    />
                  </div>
                </form>
              ) : (
                // View Details
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{selectedWebinar.title}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Speaker</p>
                    <p className="font-medium">{selectedWebinar.speaker}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">{selectedWebinar.displayDateTime}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedWebinar.duration} minutes</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Max Registrations</p>
                    <p className="font-medium">{selectedWebinar.maxRegistrations}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Current Participants</p>
                    <p className="font-medium">{selectedWebinar.participantsCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedWebinar.status)}`}
                    >
                      {selectedWebinar.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500">URL</p>
                    <a
                      href={selectedWebinar.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium truncate block"
                    >
                      {selectedWebinar.url}
                    </a>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500">Thumbnail</p>
                    <img
                      src={selectedWebinar.thumbnail || "/placeholder.svg?height=100&width=150&text=Thumbnail"}
                      alt="Thumbnail"
                      className="w-36 h-24 object-cover rounded-md mt-2"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium whitespace-pre-wrap">{selectedWebinar.description}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500">Tags</p>
                    <p className="font-medium">{selectedWebinar.tags.join(", ")}</p>
                  </div>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                  {saveSuccess}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                {isEditMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveWebinar}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#C83C92] text-white rounded-lg hover:bg-[#B8358A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="px-6 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                    >
                      Edit Webinar
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 border-4 border-[#C83C92] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading webinar details...</p>
            </div>
          )}
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}

export default WebinarsManagement
