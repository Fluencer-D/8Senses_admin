"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Search, X, Filter, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Borrower {
  _id: string
  borrowerName: string
  phone: string
  email: string
  relationship: string
}

interface ToyUnit {
  _id: string
  unitNumber: number
  condition: string
}

interface Toy {
  _id: string
  name: string
  category: string
  image?: string
}

interface BorrowingRecord {
  _id: string
  borrowerName: string
  phone: string
  email: string
  relationship: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: string
  conditionOnIssue: string
  notes?: string
  toyId: Toy
  toyUnitId: ToyUnit
}

interface SearchResult {
  type: "borrower" | "toy"
  data: {
    borrowerInfo?: {
      borrowerName: string
      email: string
      phone: string
      relationship: string
    }
    toyInfo?: {
      _id: string
      name: string
      category: string
      image?: string
    }
    activeBorrowings: BorrowingRecord[]
  }
}

interface ReturnFormData {
  conditionOnReturn: string
  notes: string
  returnDate: string
}

export default function ProcessReturn() {
  const [searchTerm, setSearchTerm] = useState("")
  const [allBorrowings, setAllBorrowings] = useState<BorrowingRecord[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [selectedBorrowings, setSelectedBorrowings] = useState<string[]>([])
  const [returnFormData, setReturnFormData] = useState<ReturnFormData>({
    conditionOnReturn: "",
    notes: "",
    returnDate: new Date().toISOString().split("T")[0],
  })
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState<"search" | "select" | "confirm">("search")

  const router = useRouter()
  const conditionOptions = ["Excellent", "Good", "Fair", "Needs Repair", "Damaged"]

  // Get auth token (you might need to adjust this based on your auth implementation)
  const getAuthToken = () => {
    // Replace this with your actual token retrieval method
    return localStorage.getItem("adminToken") || ""
  }

  // Load all borrowings on component mount
  useEffect(() => {
    loadAllBorrowings()
  }, [])

  const loadAllBorrowings = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hi`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAllBorrowings(result.data)
        }
      } else {
        console.error("Failed to load borrowings:", response.status)
      }
    } catch (error) {
      console.error("Error loading borrowings:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  // Smart search for borrowers or toys
  const handleSearch = async (value: string) => {
    setSearchTerm(value)

    if (value.length < 2) {
      setSearchResults(null)
      setStep("search")
      return
    }

    try {
      setLoading(true)

      // Use the new smart search API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process-return/smart-search?search=${encodeURIComponent(value)}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSearchResults({
            type: result.type,
            data: result.data,
          })
          setStep("select")
          return
        }
      }

      // If smart search fails, fallback to regular borrowing search
      const borrowingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/toys/borrowings?search=${encodeURIComponent(value)}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      })

      if (borrowingResponse.ok) {
        const borrowingResult = await borrowingResponse.json()
        if (borrowingResult.success && borrowingResult.data.length > 0) {
          // Check if search matches a borrower name more closely
          const exactBorrowerMatch = borrowingResult.data.find((b: BorrowingRecord) =>
            b.borrowerName.toLowerCase().includes(value.toLowerCase()),
          )

          if (exactBorrowerMatch) {
            // Group by borrower
            const borrowingsByBorrower = borrowingResult.data.reduce((acc: any, borrowing: BorrowingRecord) => {
              const key = borrowing.email
              if (!acc[key]) {
                acc[key] = {
                  borrowerInfo: {
                    borrowerName: borrowing.borrowerName,
                    phone: borrowing.phone,
                    email: borrowing.email,
                    relationship: borrowing.relationship,
                  },
                  activeBorrowings: [],
                }
              }
              acc[key].activeBorrowings.push(borrowing)
              return acc
            }, {})

            const borrowers = Object.values(borrowingsByBorrower)
            if (borrowers.length > 0) {
              setSearchResults({
                type: "borrower",
                data: borrowers[0] as any,
              })
              setStep("select")
              return
            }
          }

          // Check if search matches a toy name
          const toyMatch = borrowingResult.data.find((b: BorrowingRecord) =>
            b.toyId.name.toLowerCase().includes(value.toLowerCase()),
          )

          if (toyMatch) {
            // Group by toy
            const borrowingsByToy = borrowingResult.data.reduce((acc: any, borrowing: BorrowingRecord) => {
              const key = borrowing.toyId._id
              if (!acc[key]) {
                acc[key] = {
                  toyInfo: borrowing.toyId,
                  activeBorrowings: [],
                }
              }
              acc[key].activeBorrowings.push(borrowing)
              return acc
            }, {})

            const toys = Object.values(borrowingsByToy)
            if (toys.length > 0) {
              setSearchResults({
                type: "toy",
                data: toys[0] as any,
              })
              setStep("select")
              return
            }
          }
        }
      }

      // If no results found
      setSearchResults(null)
      setStep("search")
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults(null)
      setStep("search")
    } finally {
      setLoading(false)
    }
  }

  // Handle borrowing selection
  const handleBorrowingSelection = (borrowingId: string) => {
    setSelectedBorrowings((prev) =>
      prev.includes(borrowingId) ? prev.filter((id) => id !== borrowingId) : [...prev, borrowingId],
    )
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReturnFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Process return using bulk processing API
  const processReturn = async () => {
    if (selectedBorrowings.length === 0) {
      alert("Please select at least one borrowing to return")
      return
    }

    if (!returnFormData.conditionOnReturn) {
      alert("Please select the condition of the returned toy")
      return
    }

    try {
      setProcessing(true)

      // Use bulk processing API if available, otherwise process individually
      const bulkResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process-return/process-multiple`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowingIds: selectedBorrowings,
          conditionOnReturn: returnFormData.conditionOnReturn,
          notes: returnFormData.notes,
          returnDate: returnFormData.returnDate,
        }),
      })

      if (bulkResponse.ok) {
        const result = await bulkResponse.json()
        if (result.success) {
          alert(`Successfully processed return for ${result.processedCount} item(s)!`)
          if (result.errors && result.errors.length > 0) {
            console.warn("Some errors occurred:", result.errors)
          }
        } else {
          throw new Error(result.error || "Bulk processing failed")
        }
      } else {
        // Fallback to individual processing
        const returnPromises = selectedBorrowings.map(async (borrowingId) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/toys/borrowings/${borrowingId}/return`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(returnFormData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to return borrowing ${borrowingId}: ${errorData.error}`)
          }

          return response.json()
        })

        await Promise.all(returnPromises)
        alert(`Successfully processed return for ${selectedBorrowings.length} item(s)!`)
      }

      // Reset form
      setSearchTerm("")
      setSearchResults(null)
      setSelectedBorrowings([])
      setReturnFormData({
        conditionOnReturn: "",
        notes: "",
        returnDate: new Date().toISOString().split("T")[0],
      })
      setStep("search")

      // Reload borrowings
      loadAllBorrowings()
    } catch (error) {
      console.error("Return processing error:", error)
      alert(`Failed to process return: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setProcessing(false)
    }
  }

  // Continue to confirmation step
  const continueToConfirmation = () => {
    if (selectedBorrowings.length === 0) {
      alert("Please select at least one borrowing to return")
      return
    }
    setStep("confirm")
  }

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  // Calculate status and get styling
  const getStatusInfo = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return {
        status: "Overdue",
        styling: "bg-red-100 text-red-800",
      }
    } else if (diffDays <= 3) {
      return {
        status: "Due Soon",
        styling: "bg-orange-100 text-orange-800",
      }
    } else {
      return {
        status: "Active",
        styling: "bg-green-100 text-green-800",
      }
    }
  }

  // Get selected borrowings for confirmation
  const getSelectedBorrowingsData = () => {
    if (!searchResults) return []

    const allBorrowings = searchResults.data.activeBorrowings || []
    return allBorrowings.filter((b) => selectedBorrowings.includes(b._id))
  }

  if (initialLoading) {
    return (
      <div style={{ color: "#1E437A" }} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50">
        <div className="max-w-7xl mx-auto p-6 pt-32">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading borrowings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ color: "#1E437A" }} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b pt-24 w-[95%] border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-600 cursor-pointer" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-5">Process Return</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by borrower name (e.g., 'Bob Smith') or toy name (e.g., 'Wooden Puzzle')..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        {searchResults && (
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step === "search" ? "text-blue-600" : "text-green-600"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === "search" ? "bg-blue-100" : "bg-green-100"
                  }`}
                >
                  {step === "search" ? "1" : <CheckCircle className="w-5 h-5" />}
                </div>
                <span className="ml-2 text-sm font-medium">Search</span>
              </div>
              <div className={`w-8 h-0.5 ${step !== "search" ? "bg-green-200" : "bg-gray-200"}`}></div>
              <div
                className={`flex items-center ${
                  step === "select" ? "text-blue-600" : step === "confirm" ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === "select" ? "bg-blue-100" : step === "confirm" ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {step === "confirm" ? <CheckCircle className="w-5 h-5" /> : "2"}
                </div>
                <span className="ml-2 text-sm font-medium">Select Items</span>
              </div>
              <div className={`w-8 h-0.5 ${step === "confirm" ? "bg-green-200" : "bg-gray-200"}`}></div>
              <div className={`flex items-center ${step === "confirm" ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === "confirm" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Confirm Return</span>
              </div>
            </div>
          </div>
        )}

        {searchResults ? (
          <div className="space-y-6">
            {/* Results Display */}
            {step === "select" && (
              <>
                {searchResults.type === "borrower" ? (
                  /* Borrower Search Results */
                  <>
                    {/* Borrower Details */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <h2 className="text-base font-semibold mb-5">Borrower Details</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Borrower Name</label>
                          <input
                            type="text"
                            value={searchResults.data.borrowerInfo?.borrowerName || ""}
                            readOnly
                            className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                            <input
                              type="text"
                              value={searchResults.data.borrowerInfo?.phone || ""}
                              readOnly
                              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                              type="text"
                              value={searchResults.data.borrowerInfo?.email || ""}
                              readOnly
                              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Relationship to Child</label>
                          <input
                            type="text"
                            value={searchResults.data.borrowerInfo?.relationship || ""}
                            readOnly
                            className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Select a Toy to Process Return */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <h2 className="text-base font-semibold mb-5">Select Toys to Process Return</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-3 text-sm font-medium">Select</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Toy Name</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Unit</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Issue Date</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Due Date</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchResults.data.activeBorrowings.map((borrowing) => {
                              const statusInfo = getStatusInfo(borrowing.dueDate)
                              return (
                                <tr key={borrowing._id} className="border-b border-gray-100">
                                  <td className="py-4 px-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedBorrowings.includes(borrowing._id)}
                                      onChange={() => handleBorrowingSelection(borrowing._id)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="py-4 px-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                                        🧸
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">{borrowing.toyId.name}</p>
                                        <p className="text-xs text-gray-500">{borrowing.toyId.category}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-3 text-sm font-medium">#{borrowing.toyUnitId.unitNumber}</td>
                                  <td className="py-4 px-3 text-sm">{formatDate(borrowing.issueDate)}</td>
                                  <td className="py-4 px-3 text-sm">{formatDate(borrowing.dueDate)}</td>
                                  <td className="py-4 px-3">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.styling}`}
                                    >
                                      {statusInfo.status}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={continueToConfirmation}
                          style={{ backgroundColor: "#C83C92" }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium text-sm"
                        >
                          Confirm & Continue
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Toy Search Results */
                  <>
                    {/* Toy Details */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <h2 className="text-base font-semibold mb-5">Toy Details</h2>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Toy Name</label>
                          <input
                            type="text"
                            value={searchResults.data.toyInfo?.name || ""}
                            readOnly
                            className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Category</label>
                          <input
                            type="text"
                            value={searchResults.data.toyInfo?.category || ""}
                            readOnly
                            className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Select a Borrower to Return From */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold">Select Borrowers to Return From</h2>
                        <button className="flex items-center gap-2 hover:bg-gray-50 text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-md">
                          <Filter className="w-4 h-4" />
                          Filters
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-3 text-sm font-medium">Select</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Borrowed By</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Unit No.</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Issue Date</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Due Date</th>
                              <th className="text-left py-3 px-3 text-sm font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchResults.data.activeBorrowings.map((borrowing) => {
                              const statusInfo = getStatusInfo(borrowing.dueDate)
                              return (
                                <tr key={borrowing._id} className="border-b border-gray-100">
                                  <td className="py-4 px-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedBorrowings.includes(borrowing._id)}
                                      onChange={() => handleBorrowingSelection(borrowing._id)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="py-4 px-3">
                                    <div>
                                      <p className="text-sm font-medium">{borrowing.borrowerName}</p>
                                      <p className="text-xs text-gray-500">{borrowing.phone}</p>
                                    </div>
                                  </td>
                                  <td className="py-4 px-3 text-sm font-medium">#{borrowing.toyUnitId.unitNumber}</td>
                                  <td className="py-4 px-3 text-sm">{formatDate(borrowing.issueDate)}</td>
                                  <td className="py-4 px-3 text-sm">{formatDate(borrowing.dueDate)}</td>
                                  <td className="py-4 px-3">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.styling}`}
                                    >
                                      {statusInfo.status}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={continueToConfirmation}
                          style={{ backgroundColor: "#C83C92" }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium text-sm"
                        >
                          Confirm & Continue
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Confirmation Step */}
            {step === "confirm" && (
              <>
                {/* Selected Items Summary */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-base font-semibold mb-5">Selected Items for Return</h2>
                  <div className="space-y-3">
                    {getSelectedBorrowingsData().map((borrowing) => {
                      const statusInfo = getStatusInfo(borrowing.dueDate)
                      return (
                        <div
                          key={borrowing._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
                              🧸
                            </div>
                            <div>
                              <p className="text-sm font-medium">{borrowing.toyId.name}</p>
                              <p className="text-xs text-gray-500">
                                Unit #{borrowing.toyUnitId.unitNumber} • {borrowing.borrowerName}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.styling}`}
                          >
                            {statusInfo.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Review & Update Toy Condition */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-base font-semibold mb-5">Review & Update Toy Condition</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Return Date</label>
                      <input
                        type="date"
                        name="returnDate"
                        value={returnFormData.returnDate}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Update Toy Condition *</label>
                      <select
                        name="conditionOnReturn"
                        value={returnFormData.conditionOnReturn}
                        onChange={handleInputChange}
                        required
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      >
                        <option value="">Select toy condition</option>
                        {conditionOptions.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={returnFormData.notes}
                        onChange={handleInputChange}
                        placeholder="Write any additional notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={processReturn}
                    disabled={processing || !returnFormData.conditionOnReturn}
                    style={{ backgroundColor: "#C83C92" }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Processing..." : "Confirm & Mark as Returned"}
                  </button>
                  <button
                    onClick={() => setStep("select")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-50"
                  >
                    Back to Selection
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Show All Active Borrowings */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Active Borrowings</h2>
                <p className="text-sm text-gray-500">
                  {allBorrowings.length} active borrowing{allBorrowings.length !== 1 ? "s" : ""}
                </p>
              </div>

              {allBorrowings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  {/* Document Icon */}
                  <div className="mb-6">
                    <div className="relative">
                      {/* Main document */}
                      <div className="w-16 h-20 bg-white border-2 border-gray-300 rounded-lg relative">
                        {/* Document lines */}
                        <div className="absolute top-3 left-2 right-2 space-y-1">
                          <div className="h-0.5 bg-gray-300 rounded"></div>
                          <div className="h-0.5 bg-gray-300 rounded"></div>
                          <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      </div>
                      {/* Background document */}
                      <div className="absolute -top-1 -right-1 w-16 h-20 bg-gray-100 border-2 border-gray-300 rounded-lg -z-10"></div>
                    </div>
                  </div>
                  {/* Empty State Text */}
                  <p className="text-base font-medium">No Active Borrowings Found!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    All toys have been returned or no toys are currently borrowed.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 text-sm font-medium">Borrower</th>
                        <th className="text-left py-3 px-3 text-sm font-medium">Toy Name</th>
                        <th className="text-left py-3 px-3 text-sm font-medium">Unit</th>
                        <th className="text-left py-3 px-3 text-sm font-medium">Issue Date</th>
                        <th className="text-left py-3 px-3 text-sm font-medium">Due Date</th>
                        <th className="text-left py-3 px-3 text-sm font-medium">Status</th>
                        <th className="text-left py-3 px-3 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBorrowings.map((borrowing) => {
                        const statusInfo = getStatusInfo(borrowing.dueDate)
                        return (
                          <tr key={borrowing._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-3">
                              <div>
                                <p className="text-sm font-medium">{borrowing.borrowerName}</p>
                                <p className="text-xs text-gray-500">{borrowing.phone}</p>
                              </div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
                                  🧸
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{borrowing.toyId.name}</p>
                                  <p className="text-xs text-gray-500">{borrowing.toyId.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-sm font-medium">#{borrowing.toyUnitId.unitNumber}</td>
                            <td className="py-4 px-3 text-sm">{formatDate(borrowing.issueDate)}</td>
                            <td className="py-4 px-3 text-sm">{formatDate(borrowing.dueDate)}</td>
                            <td className="py-4 px-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.styling}`}
                              >
                                {statusInfo.status}
                              </span>
                            </td>
                            <td className="py-4 px-3">
                              <button
                                onClick={() => {
                                  setSearchTerm(borrowing.borrowerName)
                                  handleSearch(borrowing.borrowerName)
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Process Return
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Blue Line */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
    </div>
  )
}
