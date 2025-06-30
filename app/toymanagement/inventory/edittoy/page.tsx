"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface ToyUnit {
  _id: string
  unitNumber: number
  condition: string
  isAvailable: boolean
  currentBorrower?: string
  notes?: string
}

interface Toy {
  _id: string
  name: string
  category: string
  description: string
  totalUnits: number
  availableUnits: number
  image: string
}

interface BorrowingInfo {
  borrowerName: string
  email: string
  phone: string
}

export default function EditToyDetails() {
  const [toyName, setToyName] = useState("")
  const [category, setCategory] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [description, setDescription] = useState("")
  const [units, setUnits] = useState<ToyUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [borrowingInfo, setBorrowingInfo] = useState<{ [key: string]: BorrowingInfo }>({})

  const router = useRouter()
  const searchParams = useSearchParams()
  const toyId = searchParams.get("id")

  const API_BASE_URL =  "http://localhost:5000/api"

  // Fetch toy details and units
  const fetchToyDetails = async () => {
    if (!toyId) {
      alert("No toy ID provided")
      router.back()
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`${API_BASE_URL}/toys/${toyId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      const toy: Toy = result.data.toy
      const toyUnits: ToyUnit[] = result.data.units || []

      setToyName(toy.name)
      setCategory(toy.category)
      setDescription(toy.description || "")
      setUnits(toyUnits)

      // Fetch borrowing info for borrowed units
      const borrowedUnits = toyUnits.filter((unit) => !unit.isAvailable)
      for (const unit of borrowedUnits) {
        if (unit.currentBorrower) {
          await fetchBorrowingInfo(unit.currentBorrower, unit._id)
        }
      }
    } catch (error) {
      console.error("Error fetching toy details:", error)
      alert("Failed to fetch toy details. Please try again.")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  // Fetch borrowing information
  const fetchBorrowingInfo = async (borrowingId: string, unitId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${API_BASE_URL}/toys/borrowings/${borrowingId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const result = await response.json()
        setBorrowingInfo((prev) => ({
          ...prev,
          [unitId]: {
            borrowerName: result.data.borrowerName,
            email: result.data.email,
            phone: result.data.phone,
          },
        }))
      }
    } catch (error) {
      console.error("Error fetching borrowing info:", error)
    }
  }

  // Update toy details
  const updateToyDetails = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("adminToken")

      const toyData = {
        name: toyName.trim(),
        category,
        description: description.trim(),
        // Note: ageGroup might need to be added to your backend schema
      }

      const response = await fetch(`${API_BASE_URL}/toys/${toyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(toyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Update failed: ${response.status}`)
      }

      alert("Toy details updated successfully!")
    } catch (error) {
      console.error("Error updating toy:", error)
      alert(`Failed to update toy: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  // Update toy unit
  const updateUnit = async (unitId: string, field: string, value: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const updateData = { [field]: field === "isAvailable" ? value === "true" : value }

      const response = await fetch(`${API_BASE_URL}/toys/units/${unitId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Update failed: ${response.status}`)
      }

      // Update local state
      setUnits((prev) =>
        prev.map((unit) =>
          unit._id === unitId
            ? {
                ...unit,
                [field]: field === "isAvailable" ? value === "true" : value,
              }
            : unit,
        ),
      )

      console.log("Unit updated successfully!")
    } catch (error) {
      console.error("Error updating unit:", error)
      alert(`Failed to update unit: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Delete toy unit
  const deleteUnit = async (unitId: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) {
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`${API_BASE_URL}/toys/units/${unitId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Delete failed: ${response.status}`)
      }

      // Remove from local state
      setUnits((prev) => prev.filter((unit) => unit._id !== unitId))
      alert("Unit deleted successfully!")
    } catch (error) {
      console.error("Error deleting unit:", error)
      alert(`Failed to delete unit: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Add new toy unit
  const addNewUnit = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const maxUnitNumber = Math.max(...units.map((u) => u.unitNumber), 0)

      const newUnitData = {
        unitNumber: maxUnitNumber + 1,
        condition: "Good",
      }

      const response = await fetch(`${API_BASE_URL}/toys/${toyId}/units`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(newUnitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Add failed: ${response.status}`)
      }

      const result = await response.json()
      setUnits((prev) => [...prev, result.data])
      alert("New unit added successfully!")
    } catch (error) {
      console.error("Error adding unit:", error)
      alert(`Failed to add unit: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    fetchToyDetails()
  }, [toyId])

  if (loading) {
    return (
      <div className="min-h-screen w-[85%] ml-[300px] font-sans bg-gray-50 p-6">
        <div className="max-w-5xl pt-24 mx-auto">
          <div className="text-center py-8">Loading toy details...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ color: "#1E437A" }} className="min-h-screen w-[85%] ml-[300px] font-sans bg-gray-50 p-6">
      <div className="max-w-5xl pt-24 mx-auto">
        {/* Header */}
        <div className="flex mb-5 items-center gap-2 text-blue-600 cursor-pointer" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Edit Toy Details - {toyName}</h1>
          </div>
          <button
            onClick={updateToyDetails}
            disabled={saving}
            style={{ backgroundColor: "#C83C92" }}
            className="flex items-center gap-2 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Details"}
          </button>
        </div>

        {/* Basic Toy Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold mb-5">Basic Toy Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="toy-name" className="block text-sm font-medium mb-2">
                Toy Name
              </label>
              <input
                id="toy-name"
                type="text"
                value={toyName}
                style={{ backgroundColor: "#F9F9FC" }}
                onChange={(e) => setToyName(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  style={{ backgroundColor: "#F9F9FC" }}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="Building Blocks">Building Blocks</option>
                  <option value="Puzzles">Puzzles</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Arts & Crafts">Arts & Crafts</option>
                  <option value="Games">Games</option>
                  <option value="Music">Music</option>
                  <option value="Educational">Educational</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Dolls & Figures">Dolls & Figures</option>
                  <option value="Sports">Sports</option>
                  <option value="Gross Motor">Gross Motor</option>
                  <option value="Cognitive">Cognitive</option>
                  <option value="Sensory & Grip">Sensory & Grip</option>
                  <option value="STEM & Problem-Solving">STEM & Problem-Solving</option>
                  <option value="Hand Strength">Hand Strength</option>
                  <option value="Balance & Coordination">Balance & Coordination</option>
                  <option value="Calming & Sensory">Calming & Sensory</option>
                  <option value="Tactile & Sensory">Tactile & Sensory</option>
                </select>
              </div>
              <div>
                <label htmlFor="age-group" className="block text-sm font-medium mb-2">
                  Age Group
                </label>
                <select
                  id="age-group"
                  value={ageGroup}
                  style={{ backgroundColor: "#F9F9FC" }}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="">Select age group</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="2-4 years">2-4 years</option>
                  <option value="4-6 years">4-6 years</option>
                  <option value="6-8 years">6-8 years</option>
                  <option value="8-12 years">8-12 years</option>
                  <option value="12+ years">12+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                style={{ backgroundColor: "#F9F9FC" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Manage Toy Units */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold">Manage Toy Units</h2>
            <button
              onClick={addNewUnit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Unit
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-sm font-medium w-20">Unit No.</th>
                  <th className="text-left py-3 px-3 text-sm font-medium">Availability</th>
                  <th className="text-left py-3 px-3 text-sm font-medium">Condition</th>
                  <th className="text-left py-3 px-3 text-sm font-medium">Borrowed By</th>
                  <th className="text-left py-3 px-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit._id} className="border-b border-gray-100">
                    <td className="py-4 px-3 text-sm font-medium">{unit.unitNumber}</td>
                    <td className="py-4 px-3">
                      <select
                        style={{ backgroundColor: "#F9F9FC" }}
                        value={
                          unit.isAvailable
                            ? "Available"
                            : unit.notes?.includes("Maintenance")
                              ? "Maintenance"
                              : "Borrowed"
                        }
                        onChange={(e) => {
                          const newStatus = e.target.value
                          if (newStatus === "Available") {
                            updateUnit(unit._id, "isAvailable", "true")
                          } else if (newStatus === "Maintenance") {
                            updateUnit(unit._id, "isAvailable", "false")
                            updateUnit(unit._id, "notes", "Under Maintenance")
                          } else {
                            // Borrowed
                            updateUnit(unit._id, "isAvailable", "false")
                          }
                        }}
                        className="w-full h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Available">Available</option>
                        <option value="Borrowed">Borrowed</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="py-4 px-3">
                      <select
                        style={{ backgroundColor: "#F9F9FC" }}
                        value={unit.condition}
                        onChange={(e) => updateUnit(unit._id, "condition", e.target.value)}
                        className="w-full h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Needs Repair">Needs Repair</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </td>
                    <td style={{ color: "#1E437A" }} className="py-4 px-3 text-sm">
                      {unit.isAvailable ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <span className="font-medium">{borrowingInfo[unit._id]?.borrowerName || "Loading..."}</span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <button
                        onClick={() => deleteUnit(unit._id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete Unit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
