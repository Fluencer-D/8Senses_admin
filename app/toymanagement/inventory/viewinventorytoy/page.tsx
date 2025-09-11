"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Filter, Eye, Edit, Trash2, Plus, Save, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getAdminToken } from "@/utils/storage"

interface Toy {
  _id: string
  name: string
  category: string
  description: string
  totalUnits: number
  availableUnits: number
  image: string
  createdBy: string
  createdAt: string
  updatedAt: string
  updatedBy?: string
}

interface ToyUnit {
  _id: string
  toyId: string
  unitNumber: number
  condition: string
  isAvailable: boolean
  notes?: string
  currentBorrower?: string
  createdAt: string
  updatedAt: string
}

interface BorrowingHistory {
  _id: string
  toyUnitId: {
    _id: string
    unitNumber: number
    id: string
  }
  borrowerName: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: string
}

interface ApiResponse {
  success: boolean
  data: {
    toy: Toy
    units: ToyUnit[]
    borrowingHistory: BorrowingHistory[]
  }
}

interface UnitFormData {
  condition: string
  notes: string
  unitNumber: string
}

export default function StackingRingsDetails() {
  const [apiData, setApiData] = useState<ApiResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingUnit, setDeletingUnit] = useState<string | null>(null)

  // Modal states
  const [viewUnitModal, setViewUnitModal] = useState<ToyUnit | null>(null)
  const [editUnitModal, setEditUnitModal] = useState<ToyUnit | null>(null)
  const [addUnitModal, setAddUnitModal] = useState(false)

  // Form states
  const [unitFormData, setUnitFormData] = useState<UnitFormData>({
    condition: "",
    notes: "",
    unitNumber: "",
  })
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const toyId = searchParams.get("id")

  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`
  const conditionOptions = ["Excellent", "Good", "Fair", "Needs Repair", "Damaged"]

  // Fetch toy details with units and history
  const fetchToyDetails = async () => {
    if (!toyId) {
      setError("No toy ID provided")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")
      const token = getAdminToken()

      const response = await fetch(`${API_BASE_URL}/toys/${toyId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch toy: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      console.log("API Response:", result)

      if (result.success && result.data) {
        setApiData(result.data)
      } else {
        setError("Failed to load toy details")
      }
    } catch (error) {
      console.error("Error fetching toy:", error)
      setError("Failed to load toy details")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      // ✅ If token is missing, redirect to login page
      router.replace("/admin");

    }
  }, [router]);

  
  // Delete toy
  const deleteToy = async () => {
    if (!apiData?.toy || !confirm("Are you sure you want to delete this toy? This action cannot be undone.")) {
      return
    }

    try {
      const token = getAdminToken()
      const response = await fetch(`${API_BASE_URL}/toys/${apiData.toy._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        alert("Toy deleted successfully!")
        router.push("/toymanagement/inventory")
      } else {
        const errorData = await response.json()
        alert(`Failed to delete toy: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting toy:", error)
      alert("Failed to delete toy")
    }
  }

  // Delete toy unit
  const deleteToyUnit = async (unitId: string, unitNumber: number) => {
    if (!confirm(`Are you sure you want to delete Unit #${unitNumber}?`)) {
      return
    }

    try {
      setDeletingUnit(unitId)
      const token = getAdminToken()
      const response = await fetch(`${API_BASE_URL}/toys/units/${unitId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        alert("Unit deleted successfully!")
        fetchToyDetails() // Refresh all data
      } else {
        const errorData = await response.json()
        alert(`Failed to delete unit: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting unit:", error)
      alert("Failed to delete unit")
    } finally {
      setDeletingUnit(null)
    }
  }

  // Open edit unit modal
  const openEditUnit = (unit: ToyUnit) => {
    setEditUnitModal(unit)
    setUnitFormData({
      condition: unit.condition,
      notes: unit.notes || "",
      unitNumber: unit.unitNumber.toString(),
    })
  }

  // Open add unit modal
  const openAddUnit = () => {
    setAddUnitModal(true)
    // Get the next available unit number
    const nextUnitNumber = getNextAvailableUnitNumber()
    setUnitFormData({
      condition: "",
      notes: "",
      unitNumber: nextUnitNumber.toString(),
    })
  }

  // Get next available unit number
  const getNextAvailableUnitNumber = (): number => {
    if (!apiData?.units || apiData.units.length === 0) {
      return 1
    }

    // Get all existing unit numbers and sort them
    const existingNumbers = apiData.units.map((unit) => unit.unitNumber).sort((a, b) => a - b)

    // Find the first gap in the sequence or return the next number
    for (let i = 1; i <= existingNumbers.length + 1; i++) {
      if (!existingNumbers.includes(i)) {
        return i
      }
    }

    return existingNumbers.length + 1
  }

  // Check if unit number is already taken
  const isUnitNumberTaken = (unitNumber: string): boolean => {
    if (!apiData?.units || !unitNumber) return false
    const num = Number.parseInt(unitNumber)
    return apiData.units.some((unit) => unit.unitNumber === num)
  }

  // Handle unit form submission (edit)
  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUnitModal) return

    // Validate unit number
    const unitNum = Number.parseInt(unitFormData.unitNumber)
    if (isNaN(unitNum) || unitNum < 1) {
      alert("Please enter a valid unit number (1 or greater)")
      return
    }

    // Check if unit number is taken by another unit
    if (unitNum !== editUnitModal.unitNumber && isUnitNumberTaken(unitFormData.unitNumber)) {
      alert(`Unit number ${unitNum} is already taken. Please choose a different number.`)
      return
    }

    try {
      setSaving(true)
      const token = getAdminToken()

      const payload = {
        condition: unitFormData.condition,
        notes: unitFormData.notes,
        unitNumber: unitNum,
      }

      const response = await fetch(`${API_BASE_URL}/toys/units/${editUnitModal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Unit updated successfully!")
        setEditUnitModal(null)
        fetchToyDetails() // Refresh data
      } else {
        const errorData = await response.json()
        alert(`Failed to update unit: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error updating unit:", error)
      alert("Failed to update unit")
    } finally {
      setSaving(false)
    }
  }

  // Handle add unit submission
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiData?.toy) return

    // Validate unit number
    const unitNum = Number.parseInt(unitFormData.unitNumber)
    if (isNaN(unitNum) || unitNum < 1) {
      alert("Please enter a valid unit number (1 or greater)")
      return
    }

    // Check if unit number is already taken
    if (isUnitNumberTaken(unitFormData.unitNumber)) {
      alert(`Unit number ${unitNum} is already taken. Please choose a different number.`)
      return
    }

    try {
      setSaving(true)
      const token = getAdminToken()

      const payload = {
        condition: unitFormData.condition,
        notes: unitFormData.notes,
        unitNumber: unitNum,
      }

      const response = await fetch(`${API_BASE_URL}/toys/${apiData.toy._id}/units`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Unit added successfully!")
        setAddUnitModal(false)
        fetchToyDetails() // Refresh data
      } else {
        const errorData = await response.json()
        alert(`Failed to add unit: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error adding unit:", error)
      alert("Failed to add unit")
    } finally {
      setSaving(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUnitFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Get borrower name for a unit
  const getBorrowerForUnit = (unitNumber: number): string => {
    const borrowing = apiData?.borrowingHistory.find(
      (b) => b.toyUnitId.unitNumber === unitNumber && b.status === "Borrowed",
    )
    return borrowing ? borrowing.borrowerName : "-"
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

  // Format date with time
  const formatDateTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  // Get status styling
  const getStatusStyling = (status: string): string => {
    switch (status.toLowerCase()) {
      case "borrowed":
      case "active":
        return "bg-red-100 text-red-800"
      case "available":
        return "bg-green-100 text-green-800"
      case "returned":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "due soon":
        return "bg-orange-100 text-orange-800"
      case "lost":
        return "bg-red-100 text-red-800"
      case "damaged":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get condition styling
  const getConditionStyling = (condition: string): string => {
    switch (condition.toLowerCase()) {
      case "excellent":
      case "new":
        return "bg-blue-100 text-blue-800"
      case "good":
        return "bg-green-100 text-green-800"
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "needs repair":
        return "bg-orange-100 text-orange-800"
      case "damaged":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate status for borrowing history
  const calculateHistoryStatus = (record: BorrowingHistory): string => {
    if (record.returnDate) {
      const returnDate = new Date(record.returnDate)
      const dueDate = new Date(record.dueDate)
      return returnDate <= dueDate ? "Returned" : "Returned Late"
    } else {
      const today = new Date()
      const dueDate = new Date(record.dueDate)
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

  // Filter borrowing history based on search
  const filteredHistory =
    apiData?.borrowingHistory.filter(
      (record) =>
        record.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  useEffect(() => {
    fetchToyDetails()
  }, [toyId])

  if (loading) {
    return (
      <div
        style={{ color: "#1E437A" }}
        className="min-h-screen text-brandblue font-sans w-[85%] ml-[300px] bg-gray-50 p-6"
      >
        <div className="w-[95%] mx-auto py-28">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading toy details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !apiData) {
    return (
      <div
        style={{ color: "#1E437A" }}
        className="min-h-screen text-brandblue font-sans w-[85%] ml-[300px] bg-gray-50 p-6"
      >
        <div className="w-[95%] mx-auto py-28">
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 text-lg font-medium mb-2">Error</div>
              <p className="text-red-700 mb-4">{error || "Toy not found"}</p>
              <button
                onClick={() => router.push("/toymanagement/inventory")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Inventory
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { toy, units, borrowingHistory } = apiData

  return (
    <div
      style={{ color: "#1E437A" }}
      className="min-h-screen text-brandblue font-sans w-[85%] ml-[300px] bg-gray-50 p-6"
    >
      <div className="w-[95%] mx-auto py-28">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5 cursor-pointer" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{toy.name} Details</h1>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Link href="/toymanagement/inventory" className="cursor-pointer hover:underline">
                  Inventory
                </Link>
                <span>›</span>
                <span>Toy Details</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/toymanagement/dashboard/issuenewtoy?toyId=${toy._id}`}>
              <button className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Issue a Toy
              </button>
            </Link>
            <Link href={`/toymanagement/inventory/edittoy?id=${toy._id}`}>
              <button
                style={{ backgroundColor: "#C83C92" }}
                className="flex items-center gap-2 bg-brandpink hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Toy Details
              </button>
            </Link>
          </div>
        </div>

        {/* Basic Toy Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Basic Toy Information</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <p className="text-base text-xl font-medium">{toy.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Units</label>
                <p className="text-base text-xl font-medium">{toy.totalUnits}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <p className="text-base font-medium">{toy.description}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Available Units</label>
                <p className="text-base text-xl font-medium">{toy.availableUnits}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Borrowed Units</label>
                <p className="text-base text-xl font-medium">{toy.totalUnits - toy.availableUnits}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Created Date</label>
                <p className="text-base font-medium">{formatDate(toy.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Units & Availability */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Units & Availability</h2>
            <button
              onClick={openAddUnit}
              style={{ backgroundColor: "#C83C92" }}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Unit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium">Unit No.</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Availability</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Condition</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Borrowed By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Notes</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No units found
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => (
                    <tr key={unit._id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-sm font-medium">{unit.unitNumber}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${unit.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {unit.isAvailable ? "Available" : "Borrowed"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionStyling(unit.condition)}`}
                        >
                          {unit.condition}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        {unit.isAvailable ? "-" : getBorrowerForUnit(unit.unitNumber)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{unit.notes || "-"}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewUnitModal(unit)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditUnit(unit)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteToyUnit(unit._id, unit.unitNumber)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            disabled={!unit.isAvailable || deletingUnit === unit._id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Borrowing History */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Borrowing History</h2>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search borrower..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="flex items-center gap-2 hover:bg-gray-50 text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-md">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium">Unit No.</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Borrower</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Borrowed Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {searchTerm ? "No matching records found" : "No borrowing history found"}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((record) => (
                    <tr key={record._id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-sm font-medium">{record.toyUnitId?.unitNumber || "N/A"}</td>
                      <td className="py-4 px-4 text-sm font-medium">{record.borrowerName}</td>
                      <td className="py-4 px-4 text-sm">{formatDate(record.issueDate)}</td>
                      <td className="py-4 px-4 text-sm">{formatDate(record.dueDate)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyling(calculateHistoryStatus(record))}`}
                        >
                          {calculateHistoryStatus(record)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/toymanagement/borrower/profile?borrowingId=${record._id}`}>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex justify-start">
          <button
            onClick={deleteToy}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Toy
          </button>
        </div>
      </div>

      {/* View Unit Modal */}
      {viewUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-brandblue">Unit #{viewUnitModal.unitNumber} Details</h2>
              <button onClick={() => setViewUnitModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Toy Name</label>
                  <p className="text-brandblue font-semibold">{toy.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <p className="text-brandblue font-medium">{toy.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Unit Number</label>
                  <p className="text-brandblue font-semibold">#{viewUnitModal.unitNumber}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Condition</label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionStyling(viewUnitModal.condition)}`}
                  >
                    {viewUnitModal.condition}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Availability Status</label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${viewUnitModal.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {viewUnitModal.isAvailable ? "Available" : "Currently Borrowed"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                  <p className="text-brandblue font-medium">{viewUnitModal.notes || "No notes available"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-brandblue mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                  <p className="text-brandblue font-medium">{formatDateTime(viewUnitModal.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-brandblue font-medium">{formatDateTime(viewUnitModal.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewUnitModal(null)
                  openEditUnit(viewUnitModal)
                }}
                style={{ backgroundColor: "#C83C92" }}
                className="flex items-center gap-2 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
              >
                <Edit className="w-4 h-4" />
                Edit Unit
              </button>
              <button
                onClick={() => setViewUnitModal(null)}
                className="px-4 py-2 border border-gray-300 text-brandblue rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {editUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-brandblue">Edit Unit #{editUnitModal.unitNumber}</h2>
              <button onClick={() => setEditUnitModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUnit} className="space-y-6">
              {/* Unit Info (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Toy Name</label>
                  <p className="text-brandblue font-semibold">{toy.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Unit Number</label>
                  <p className="text-brandblue font-semibold">#{editUnitModal.unitNumber}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-brandblue mb-2">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={unitFormData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select condition</option>
                    {conditionOptions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="unitNumber" className="block text-sm font-medium text-brandblue mb-2">
                    Unit Number *
                  </label>
                  <input
                    type="number"
                    id="unitNumber"
                    name="unitNumber"
                    value={unitFormData.unitNumber}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter unit number"
                  />
                  {unitFormData.unitNumber &&
                    Number.parseInt(unitFormData.unitNumber) !== editUnitModal.unitNumber &&
                    isUnitNumberTaken(unitFormData.unitNumber) && (
                      <p className="text-red-500 text-xs mt-1">This unit number is already taken</p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Availability Status</label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${editUnitModal.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                >
                  {editUnitModal.isAvailable ? "Available" : "Currently Borrowed"}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {editUnitModal.isAvailable ? "Unit can be borrowed" : "Cannot edit while unit is borrowed"}
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-brandblue mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={unitFormData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add any notes about this unit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    (unitFormData.unitNumber &&
                      Number.parseInt(unitFormData.unitNumber) !== editUnitModal.unitNumber &&
                      isUnitNumberTaken(unitFormData.unitNumber))
                  }
                  style={{ backgroundColor: "#C83C92" }}
                  className="flex items-center gap-2 text-white px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUnitModal(null)}
                  className="px-6 py-2 border border-gray-300 text-brandblue rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {addUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-brandblue">Add New Unit</h2>
              <button onClick={() => setAddUnitModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-6">
              {/* Toy Info (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Toy Name</label>
                  <p className="text-brandblue font-semibold">{toy.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <p className="text-brandblue font-medium">{toy.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Total Units</label>
                  <p className="text-brandblue font-semibold">{toy.totalUnits}</p>
                </div>
              </div>

              {/* New Unit Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-brandblue mb-2">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={unitFormData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select condition</option>
                    {conditionOptions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="unitNumber" className="block text-sm font-medium text-brandblue mb-2">
                    Unit Number *
                  </label>
                  <input
                    type="number"
                    id="unitNumber"
                    name="unitNumber"
                    value={unitFormData.unitNumber}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter unit number"
                  />
                  {unitFormData.unitNumber && isUnitNumberTaken(unitFormData.unitNumber) && (
                    <p className="text-red-500 text-xs mt-1">This unit number is already taken</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Suggested: #{getNextAvailableUnitNumber()} (next available)
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-brandblue mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={unitFormData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add any notes about this unit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving || (unitFormData.unitNumber && isUnitNumberTaken(unitFormData.unitNumber))}
                  style={{ backgroundColor: "#C83C92" }}
                  className="flex items-center gap-2 text-white px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {saving ? "Adding..." : "Add Unit"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddUnitModal(false)}
                  className="px-6 py-2 border border-gray-300 text-brandblue rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
