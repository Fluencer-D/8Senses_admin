"use client"

import { getAdminToken } from "@/utils/storage"
import { Suspense } from "react"

// Loading component for Suspense fallback
function BorrowerProfileLoading() {
  return (
    <div style={{ color: "#1E437A" }} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50 p-6">
      <div className="pt-24 mx-auto w-[95%]">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading borrower details...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Move your existing component code here
function BorrowerProfileContent() {
  // All your existing imports and code goes here
  const { useState, useEffect } = require("react")
  const { ArrowLeft, Filter, X } = require("lucide-react")
  const { useRouter, useSearchParams } = require("next/navigation")
  const Link = require("next/link").default

  // All your existing interfaces
  interface Borrower {
    _id: string
    name: string
    email: string
    phone: string
    relationship: string
    createdAt: string
    updatedAt: string
  }

  interface PastBorrowing {
    _id: string
    borrowerName: string
    email: string
    phone: string
    relationship: string
    issueDate: string
    dueDate: string
    returnDate?: string
    status: string
    conditionOnIssue: string
    conditionOnReturn?: string
    notes?: string
    toyId: any
    toyUnitId: any
    createdAt: string
    updatedAt: string
  }

  interface ApiResponse {
    borrower: Borrower
    activeBorrowings: PastBorrowing[]
    pastBorrowings: PastBorrowing[]
  }

  // All your existing state and logic
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const borrowingId = searchParams.get("borrowingId") || "6859156f885a0c087ce10b49"
  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`

  // All your existing functions (calculateStatus, getStatusStyling, formatDate, etc.)
  const calculateStatus = (borrowing: PastBorrowing): string => {
    if (borrowing.returnDate) {
      const returnDate = new Date(borrowing.returnDate)
      const dueDate = new Date(borrowing.dueDate)
      if (returnDate <= dueDate) {
        return "Returned On Time"
      } else {
        const daysLate = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        return `Return Late (${daysLate} Days)`
      }
    } else {
      const today = new Date()
      const dueDate = new Date(borrowing.dueDate)
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < 0) {
        return "Overdue"
      } else if (diffDays <= 3) {
        return "Due Soon"
      } else {
        return "Active"
      }
    }
  }

  const getStatusStyling = (status: string): string => {
    switch (status) {
      case "Overdue":
        return "bg-red-100 text-red-800"
      case "Due Soon":
        return "bg-orange-100 text-orange-800"
      case "Active":
        return "bg-green-100 text-green-800"
      case "Returned On Time":
        return "bg-green-100 text-green-800"
      case "Return Late":
      case status.includes("Return Late"):
        return "bg-orange-100 text-orange-800"
      case "Lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  const getToyName = (borrowing: PastBorrowing): string => {
    if (borrowing.toyId && borrowing.toyId.name) {
      return borrowing.toyId.name
    }
    return "Toy Item"
  }

  const getUnitNumber = (borrowing: PastBorrowing): string => {
    if (borrowing.toyUnitId && borrowing.toyUnitId.unitNumber) {
      return borrowing.toyUnitId.unitNumber.toString()
    }
    return "N/A"
  }

  const fetchBorrowerDetails = async () => {
    try {
      setLoading(true)
      setError("")
      const token = getAdminToken()
      const response = await fetch(`${API_BASE_URL}/borrowers/${borrowingId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      if (response.ok) {
        const result = await response.json()
        console.log("API Response:", result)
        if (result.success && result.data) {
          setApiData(result.data)
        } else {
          setError("Invalid response format")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch borrower details")
      }
    } catch (error) {
      console.error("Error fetching borrower details:", error)
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  const sendReminder = async (borrowingId: string, toyName: string) => {
    try {
      setSendingReminder(borrowingId)
      const token = getAdminToken()
      const response = await fetch(`${API_BASE_URL}/borrowers/${borrowingId}/send-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ borrowingId }),
      })
      if (response.ok) {
        alert(`Reminder sent for ${toyName}`)
      } else {
        alert("Failed to send reminder")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Failed to send reminder")
    } finally {
      setSendingReminder(null)
    }
  }

  useEffect(() => {
    fetchBorrowerDetails()
  }, [borrowingId])

  if (loading) {
    return <BorrowerProfileLoading />
  }

  if (error) {
    return (
      <div style={{ color: "#1E437A" }} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50 p-6">
        <div className="pt-24 mx-auto w-[95%]">
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 text-lg font-medium mb-2">Error</div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!apiData) {
    return (
      <div style={{ color: "#1E437A" }} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50 p-6">
        <div className="pt-24 mx-auto w-[95%]">
          <div className="text-center py-8">
            <p>No borrower data found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ color: "#1E437A" }} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50 p-6">
      <div className="pt-24 mx-auto w-[95%]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            <span style={{ color: "#456696" }} className="text-sm font-medium font-semibold">
              Back
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-brandblue border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-brandblue">
                {apiData.borrower?.name || "Unknown Borrower"} - Profile
              </h1>
              <div className="flex items-center gap-2 text-sm text-brandblue mt-1">
                <Link href="/toymanagement/borrower" className="text-blue-600 cursor-pointer hover:underline">
                  Borrowers
                </Link>
                <span>›</span>
                <span>Borrower Details</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/toymanagement/dashboard/issuenewtoy">
              <button
                style={{ backgroundColor: "#C83C92" }}
                className="flex items-center gap-2 text-white px-4 py-2 rounded-md text-sm font-medium bg-brandpink hover:opacity-90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Issue a Toy
              </button>
            </Link>
            <button
              style={{ backgroundColor: "#C83C92" }}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-md text-sm font-medium bg-brandpink hover:opacity-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Toy Details
            </button>
          </div>
        </div>

        {/* Borrower Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-brandblue mb-6">Borrower Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brandblue mb-1">Full Name</label>
              <p className="text-base text-brandblue font-semibold text-xl font-sans">
                {apiData.borrower?.name || "Unknown"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-brandblue mb-1">Phone Number</label>
                <p className="text-base font-semibold text-xl font-sans text-brandblue">
                  {apiData.borrower?.phone || "Unknown"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brandblue mb-1">Email</label>
                <p className="text-base font-semibold text-xl font-sans text-brandblue">
                  {apiData.borrower?.email || "Unknown"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brandblue mb-1">Relationship to Child</label>
              <p className="text-base text-brandblue font-semibold text-xl font-sans">
                {apiData.borrower?.relationship || "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Current Borrowed Toys */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-brandblue mb-6">Currently Borrowed Toys</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Toy Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Borrowed Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiData.activeBorrowings && apiData.activeBorrowings.length > 0 ? (
                  apiData.activeBorrowings.map((borrowing) => (
                    <tr key={borrowing._id} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brandblue">{getToyName(borrowing)}</p>
                            <p className="text-xs text-gray-500">Unit {getUnitNumber(borrowing)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-brandblue">{formatDate(borrowing.issueDate)}</td>
                      <td className="py-4 px-4 text-sm text-brandblue">{formatDate(borrowing.dueDate)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyling(calculateStatus(borrowing))}`}
                        >
                          {calculateStatus(borrowing)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => sendReminder(borrowing._id, getToyName(borrowing))}
                          disabled={sendingReminder === borrowing._id}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z"
                            />
                          </svg>
                          {sendingReminder === borrowing._id ? "Sending..." : "Send Reminder"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No current borrowings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Borrowing History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-brandblue">Borrowing History</h2>
            <button className="flex items-center gap-2 text-brandblue hover:text-gray-700 text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-md">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Toy Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Borrowed Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Returned Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Status</th>
                </tr>
              </thead>
              <tbody>
                {apiData.pastBorrowings && apiData.pastBorrowings.length > 0 ? (
                  apiData.pastBorrowings.map((borrowing) => (
                    <tr key={borrowing._id} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brandblue">{getToyName(borrowing)}</p>
                            <p className="text-xs text-gray-500">Unit {getUnitNumber(borrowing)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-brandblue">{formatDate(borrowing.issueDate)}</td>
                      <td className="py-4 px-4 text-sm text-brandblue">
                        {borrowing.returnDate ? formatDate(borrowing.returnDate) : "-"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyling(borrowing.status)}`}
                        >
                          {borrowing.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No borrowing history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense wrapper
export default function BorrowerProfile() {
  return (
    <Suspense fallback={<BorrowerProfileLoading />}>
      <BorrowerProfileContent />
    </Suspense>
  )
}
