"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, X, Search, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface Toy {
  _id: string
  name: string
  category: string
  // availableUnits from search-available API doesn't have _id for units,
  // so we'll use a separate type for the units we fetch with _id
  image?: string
}

interface ToyUnitFromSearch {
  unitNumber: number
  condition: string
}

interface RealToyUnit {
  _id: string // This is the actual ObjectId from the ToyUnit collection
  unitNumber: number
  condition: string
  isAvailable: boolean // Assuming this comes from the /toys/:toyId/units endpoint
}

export default function IssueToyForm() {
  const [borrowerName, setBorrowerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [relationship, setRelationship] = useState("")
  const [toySearch, setToySearch] = useState("")
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null)
  const [availableUnits, setAvailableUnits] = useState<RealToyUnit[]>([]) // Store real ToyUnit objects
  const [selectedUnitId, setSelectedUnitId] = useState("") // This will store the real ToyUnit _id
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [returnDate, setReturnDate] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [searchResults, setSearchResults] = useState<Toy[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadingUnits, setLoadingUnits] = useState(false)

  const router = useRouter()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Search for available toys (this API returns units without _id)
  const searchToys = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${API_BASE_URL}/search-available?search=${encodeURIComponent(query)}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // The search-available API returns availableUnits as an array of objects
          // but these objects don't have _id. We need to fetch the real units later.
          setSearchResults(result.data)
          setShowSearchResults(true)
        } else {
          console.error("Search failed:", result.error)
          setSearchResults([])
        }
      } else {
        console.error("Search request failed:", response.status)
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching toys:", error)
      setSearchResults([])
    }
  }

  // Get real ToyUnit documents with their ObjectIds from the /toys/:toyId/units endpoint
  const getRealToyUnits = async (toyId: string) => {
    setLoadingUnits(true)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${API_BASE_URL}/toys/${toyId}/units`, {
        // This is the endpoint you provided
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Filter only available units if the endpoint returns all units
          const availableUnitsOnly = result.data.filter((unit: RealToyUnit) => unit.isAvailable)
          setAvailableUnits(availableUnitsOnly)
          console.log("Real available toy units loaded:", availableUnitsOnly)
        } else {
          console.error("Failed to fetch real units:", result.error)
          setAvailableUnits([])
        }
      } else {
        console.error("Units request failed:", response.status)
        setAvailableUnits([])
      }
    } catch (error) {
      console.error("Error fetching real toy units:", error)
      setAvailableUnits([])
    } finally {
      setLoadingUnits(false)
    }
  }

  // Handle toy selection
  const handleToySelect = (toy: Toy) => {
    setSelectedToy(toy)
    setToySearch(toy.name)
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedUnitId("") // Reset unit selection

    // Now, fetch the real ToyUnit documents with their _id from the dedicated endpoint
    getRealToyUnits(toy._id)
  }

  // Validate form
  const validateForm = () => {
    if (!borrowerName.trim()) {
      setError("Borrower name is required")
      return false
    }
    if (!phoneNumber.trim()) {
      setError("Phone number is required")
      return false
    }
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!selectedToy) {
      setError("Please select a toy")
      return false
    }
    if (!selectedUnitId) {
      setError("Please select a toy unit")
      return false
    }
    if (!issueDate) {
      setError("Issue date is required")
      return false
    }
    if (!returnDate) {
      setError("Return date is required")
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    // Validate dates
    const issueDateTime = new Date(issueDate).getTime()
    const returnDateTime = new Date(returnDate).getTime()
    const today = new Date().setHours(0, 0, 0, 0)

    if (issueDateTime < today) {
      setError("Issue date cannot be in the past")
      return false
    }

    if (returnDateTime <= issueDateTime) {
      setError("Return date must be after issue date")
      return false
    }

    return true
  }

  // Submit the form
  const handleSubmit = async () => {
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("adminToken")

      // Find the selected unit data using the real _id
      const selectedUnitData = availableUnits.find((unit) => unit._id === selectedUnitId)
      if (!selectedUnitData) {
        setError("Selected unit not found or not available. Please try again.")
        return
      }

      // Send the real ToyUnit ObjectId to the backend
      const borrowingData = {
        toyId: selectedToy!._id,
        toyUnitId: selectedUnitId, // This is now the actual MongoDB ObjectId of the ToyUnit
        borrowerName: borrowerName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim(),
        relationship: relationship || "Other",
        issueDate: issueDate,
        dueDate: returnDate,
        notes: additionalNotes.trim(),
        conditionOnIssue: selectedUnitData.condition, // Use the condition from the fetched unit
      }

      console.log("Submitting borrowing data:", borrowingData)

      const response = await fetch(`${API_BASE_URL}/toys/borrowings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(borrowingData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess("Toy issued successfully!")

        // Reset form after successful submission
        setTimeout(() => {
          router.push("/toymanagement/dashboard")
        }, 2000)
      } else {
        setError(result.error || result.errors?.[0]?.msg || "Failed to issue toy. Please try again.")
        console.error("Submission failed:", result)
      }
    } catch (error) {
      console.error("Error issuing toy:", error)
      setError("Failed to issue toy. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set default return date (14 days from issue date)
  useEffect(() => {
    if (issueDate) {
      const issue = new Date(issueDate)
      const returnDue = new Date(issue.getTime() + 14 * 24 * 60 * 60 * 1000)
      setReturnDate(returnDue.toISOString().split("T")[0])
    }
  }, [issueDate])

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchToys(toySearch)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [toySearch])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".search-container")) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen ml-[300px] max-w-[85%] bg-gray-50 p-6">
      <div className="w-[80%] mt-28 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div
            className="flex items-center gap-3 text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            <span style={{ color: "#456696" }} className="text-sm font-medium font-semibold">
              Back
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <h1 style={{ color: "#1E437A" }} className="text-2xl font-semibold mb-4 -mt-5">
          Issue a Toy
        </h1>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Borrower Details Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6" style={{ color: "#1E437A" }}>
            Borrower Details
          </h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="borrower-name" className="block text-sm font-medium text-gray-700 mb-2">
                Borrower Name *
              </label>
              <input
                id="borrower-name"
                type="text"
                placeholder="Enter borrower's full name"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                className="w-1/2 h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  placeholder="Enter borrower's phone number"
                  value={phoneNumber}
                  style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter borrower's email address"
                  value={email}
                  style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                Relationship to Child
              </label>
              <select
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value="">Select relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Toy Details Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h2 style={{ color: "#1E437A" }} className="text-base font-semibold text-gray-900 mb-6">
            Toy Details
          </h2>
          <div className="space-y-5">
            <div className="relative search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for a toy..."
                value={toySearch}
                style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                onChange={(e) => setToySearch(e.target.value)}
                onFocus={() => toySearch && setShowSearchResults(true)}
                className="w-1/2 h-11 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 w-1/2 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((toy) => (
                    <div
                      key={toy._id}
                      onClick={() => handleToySelect(toy)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{toy.name}</div>
                      <div className="text-sm text-gray-500">
                        {toy.category} • {toy.availableUnits.length} available
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSearchResults && searchResults.length === 0 && toySearch && (
                <div className="absolute top-12 left-0 w-1/2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="p-3 text-gray-500 text-sm">No toys found matching "{toySearch}"</div>
                </div>
              )}
            </div>

            {selectedToy && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="toy-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Toy Name
                    </label>
                    <input
                      id="toy-name"
                      type="text"
                      style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                      value={selectedToy.name}
                      readOnly
                      className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      id="category"
                      type="text"
                      style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                      value={selectedToy.category}
                      readOnly
                      className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="toy-unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Toy Unit *{loadingUnits ? " (Loading...)" : ` (${availableUnits.length} available)`}
                  </label>
                  <select
                    id="toy-unit"
                    value={selectedUnitId}
                    style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-1/2 h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                    required
                    disabled={loadingUnits}
                  >
                    <option value="">Select a unit</option>
                    {availableUnits.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        Unit #{unit.unitNumber} - {unit.condition}
                      </option>
                    ))}
                  </select>
                  {loadingUnits && <p className="text-sm text-blue-500 mt-1">Loading available units...</p>}
                  {!loadingUnits && availableUnits.length === 0 && selectedToy && (
                    <p className="text-sm text-red-500 mt-1">No available units found for this toy.</p>
                  )}
                  {!loadingUnits && availableUnits.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {availableUnits.length} unit{availableUnits.length > 1 ? "s" : ""} available for selection
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Borrowing Details & Confirmation Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6" style={{ color: "#1E437A" }}>
            Borrowing Details & Confirmation
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <div className="relative">
                  <input
                    id="issue-date"
                    type="date"
                    style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="return-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Return Due Date *
                </label>
                <div className="relative">
                  <input
                    id="return-date"
                    type="date"
                    style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="additional-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additional-notes"
                placeholder="Write any additional notes..."
                value={additionalNotes}
                style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                loadingUnits ||
                !selectedToy ||
                !selectedUnitId ||
                !issueDate ||
                !returnDate ||
                !borrowerName ||
                !email ||
                !phoneNumber ||
                availableUnits.length === 0
              }
              style={{ backgroundColor: "#C83C92" }}
              className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Issuing Toy..." : "Issue Toy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
