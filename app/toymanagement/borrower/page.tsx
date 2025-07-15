"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getAdminToken } from "@/utils/storage"

interface Borrower {
  _id: string
  name: string
  email: string
  phone: string
  relationship: string
  activeBorrowings: number
  overdueBorrowings: number
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  count: number
  pagination: {
    page: number
    limit: number
    totalPages: number
  }
  data: Borrower[]
}

const ToyManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [error, setError] = useState("")

  const API_BASE_URL =  `${process.env.NEXT_PUBLIC_API_URL}/api`
  const router = useRouter()

  // Fetch borrowers data
  const fetchBorrowers = async (search = "") => {
    try {
      setLoading(true)
      setError("")
      const token = getAdminToken()

      let url = `${API_BASE_URL}/borrowers`
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const result: ApiResponse = await response.json()
        setBorrowers(result.data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch borrowers")
      }
    } catch (error) {
      console.error("Error fetching borrowers:", error)
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  // Send reminder to borrower
  const sendReminder = async (borrowerEmail: string, borrowerName: string) => {
    try {
      const token = getAdminToken()
      const response = await fetch(`${API_BASE_URL}/borrowers/${encodeURIComponent(borrowerEmail)}/send-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        alert(`Reminder sent to ${borrowerName} (${borrowerEmail})`)
      } else {
        const errorData = await response.json()
        alert(`Failed to send reminder: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Failed to send reminder")
    }
  }

  // Get status based on borrowing counts
  const getBorrowerStatus = (activeBorrowings: number, overdueBorrowings: number) => {
    if (overdueBorrowings > 0) {
      return {
        status: "Overdue",
        color: "#F04438",
        backgroundColor: "#FDF1E8",
      }
    } else if (activeBorrowings > 0) {
      return {
        status: "Active",
        color: "#0D894F",
        backgroundColor: "#E7F4EE",
      }
    } else {
      return {
        status: "No Active Borrowings",
        color: "#6B7280",
        backgroundColor: "#F3F4F6",
      }
    }
  }

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBorrowers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Initial load
  useEffect(() => {
    fetchBorrowers()
  }, [])

  return (
    <div className="min-h-screen font-sans bg-gray-50 w-[81%] ml-[300px] mt-20 p-6 overflow-hidden">
      <TopNavigator />

      <SearchFiltersComponent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Borrowers Table */}
      <div className="max-h-[700px] overflow-y-auto mt-12">
        {loading ? (
          <div className="p-6 text-center">Loading borrowers...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>Error: {error}</p>
            <button
              onClick={() => fetchBorrowers(searchQuery)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : borrowers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No borrowers found</p>
            <Link href="/toymanagement/dashboard/issuenewtoy">
              <button className="mt-4 px-4 py-2 bg-[#C83C92] text-white font-semibold rounded-md">
                Issue First Toy
              </button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-left bg-white rounded-lg shadow-sm">
            <thead style={{ backgroundColor: "#F9F9FC" }} className="text-[#1E437A] text-md font-semibold sticky top-0">
              <tr>
                <th className="p-3">Borrower Name</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Email</th>
                <th className="p-3">Active Borrowings</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.map((borrower) => {
                const statusInfo = getBorrowerStatus(borrower.activeBorrowings, borrower.overdueBorrowings)

                return (
                  <tr key={borrower._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 py-8 text-[#1E437A] align-middle">
                      <div>
                        <div className="font-semibold">{borrower.name}</div>
                        <div className="text-sm text-gray-500">{borrower.relationship}</div>
                        {borrower.overdueBorrowings > 0 && (
                          <div className="text-xs text-red-600 mt-1">{borrower.overdueBorrowings} overdue items</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-[#1E437A] align-middle">{borrower.phone}</td>
                    <td className="p-3 text-[#1E437A]">{borrower.email}</td>
                    <td className="p-3 text-[#1E437A]">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{borrower.activeBorrowings}</span>
                        <span className="text-sm text-gray-500">active</span>
                        {borrower.overdueBorrowings > 0 && (
                          <>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-red-600 font-medium">
                              {borrower.overdueBorrowings} overdue
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-[#456696]">
                      <span
                        style={{ color: statusInfo.color, backgroundColor: statusInfo.backgroundColor }}
                        className="p-2 rounded-2xl text-sm font-semibold"
                      >
                        {statusInfo.status}
                      </span>
                    </td>
                    <td className="p-3 items-center text-[#456696] flex gap-5 align-middle py-10 h-full">
                      <button
                        onClick={() => sendReminder(borrower.email, borrower.name)}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded"
                        title="Send Reminder"
                        disabled={borrower.activeBorrowings === 0}
                      >
                        🔔
                      </button>
                      <Link href={`/toymanagement/borrower/viewtoy?borrowingId=${borrower._id}`}>
                        <button
                          className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          👁️
                        </button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ToyManagementPage

const TopNavigator = () => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#333843] font-medium text-2xl leading-8 tracking-wide">Borrowers</h2>
          <p className="text-sm text-gray-500 flex items-center">
            <span className="text-[#245BA7] font-medium">Toy Management</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              className="mx-2"
              viewBox="0 0 18 18"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.59467 3.96967C6.30178 4.26256 6.30178 4.73744 6.59467 5.03033L10.5643 9L6.59467 12.9697C6.30178 13.2626 6.30178 13.7374 6.59467 14.0303C6.88756 14.3232 7.36244 14.3232 7.65533 14.0303L12.4205 9.26516C12.5669 9.11872 12.5669 8.88128 12.4205 8.73484L7.65533 3.96967C7.36244 3.67678 6.88756 3.67678 6.59467 3.96967Z"
                fill="#A3A9B6"
              />
            </svg>
            <span className="text-[#667085]">Borrowers</span>
          </p>
        </div>
      </div>
    </div>
  )
}

const SearchFiltersComponent = ({ setSearchQuery, searchQuery }: any) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center border border-gray-300 bg-white px-4 py-2 w-80 rounded-lg">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search for a toy or a member."
          className="ml-2 w-full bg-transparent focus:outline-none text-gray-600 placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex space-x-3">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#ffecf8] text-pink-400 px-4 font-semibold py-2 rounded-lg font-medium">
            <span>↩️</span>
            Process
          </button>
          <Link href="/toymanagement/dashboard/issuenewtoy">
            <button className="px-4 py-2 bg-[#C83C92] text-white font-semibold rounded-md">Issue a Toy</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
