"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, X, Search, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface Toy {
  _id: string
  name: string
  category: string
  availableUnits: number
  image?: string
}

interface ToyUnit {
  _id: string
  unitNumber: number
  condition: string
}

export default function IssueToyForm() {
  const [borrowerName, setBorrowerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [relationship, setRelationship] = useState("")
  const [toySearch, setToySearch] = useState("")
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null)
  const [availableUnits, setAvailableUnits] = useState<ToyUnit[]>([])
  const [selectedUnit, setSelectedUnit] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [returnDate, setReturnDate] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [searchResults, setSearchResults] = useState<Toy[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  const router = useRouter()
  const API_BASE_URL =  "http://localhost:5000/api"

  // Search for available toys
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
        setSearchResults(result.data)
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error("Error searching toys:", error)
    }
  }

  // Get available units for selected toy
  const getAvailableUnits = async (toyId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${API_BASE_URL}/toys/${toyId}/available-units`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log("working")
        setAvailableUnits(result.data)
      }
    } catch (error) {
      console.error("Error fetching available units:", error)
    }
  }

  // Handle toy selection
  const handleToySelect = (toy: Toy) => {
    setSelectedToy(toy)
    setToySearch(toy.name)
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedUnit("") // Reset unit selection
    getAvailableUnits(toy._id)
  }

  // Submit the form
  const handleSubmit = async () => {
    if (!selectedToy || !selectedUnit || !borrowerName || !email || !phoneNumber || !issueDate || !returnDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("adminToken")

      const borrowingData = {
        toyId: selectedToy._id,
        toyUnitId: selectedUnit,
        borrowerName: borrowerName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim(),
        relationship: relationship || "Other",
        issueDate: issueDate,
        dueDate: returnDate,
        notes: additionalNotes.trim(),
        conditionOnIssue: "Good", // Default condition
      }

      const response = await fetch(`${API_BASE_URL}/toys/borrowings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(borrowingData),
      })

      if (response.ok) {
        const result = await response.json()
        alert("Toy issued successfully!")
        router.push("/toymanagement/dashboard")
      } else {
        const errorData = await response.json()
        alert(`Failed to issue toy: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error issuing toy:", error)
      alert("Failed to issue toy. Please try again.")
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

  return (
    <div className="min-h-screen ml-[300px] max-w-[85%] bg-gray-50 p-6">
      <div className="w-[80%] mt-28 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-blue-600 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            <span style={{ color: "#456696" }} className="text-sm font-medium font-semibold">
              Back
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <h1 style={{ color: "#1E437A" }} className="text-2xl font-semibold mb-4 -mt-5">
          Issue a Toy
        </h1>

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
                className="w-1/2 h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for a toy..."
                value={toySearch}
                style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                onChange={(e) => setToySearch(e.target.value)}
                onFocus={() => toySearch && setShowSearchResults(true)}
                className="w-1/2 h-11 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 w-1/2 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((toy) => (
                    <div
                      key={toy._id}
                      onClick={() => handleToySelect(toy)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{toy.name}</div>
                      <div className="text-sm text-gray-500">
                        {toy.category} • {toy.availableUnits} available
                      </div>
                    </div>
                  ))}
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
                    Select Toy Unit *
                  </label>
                  <select
                    id="toy-unit"
                    value={selectedUnit}
                    style={{ color: "#858D9D", backgroundColor: "#F9F9FC" }}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-1/2 h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select a unit</option>
                    {availableUnits.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        Unit #{unit.unitNumber} - {unit.condition}
                      </option>
                    ))}
                  </select>
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
                    className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !selectedToy ||
                !selectedUnit ||
                !issueDate ||
                !returnDate ||
                !borrowerName ||
                !email ||
                !phoneNumber
              }
              style={{ backgroundColor: "#C83C92" }}
              className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Issuing Toy..." : "Issue Toy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
