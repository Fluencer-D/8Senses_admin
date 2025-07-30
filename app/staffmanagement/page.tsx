"use client"

import { getAdminToken } from "@/utils/storage"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: "therapist" | "receptionist" | "staff"
  dateOfBirth?: string
  profilePicture?: string
  designation?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  role: "therapist" | "receptionist" | "staff"
  designation: string
  dateOfBirth: string
  profilePicture: string
  isActive: boolean
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

// Cloudinary Upload Component
interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void
  currentImage?: string
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ onUploadSuccess, currentImage }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentImage || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(currentImage || "")
  }, [currentImage])

  const uploadToCloudinary = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
          formData.append("file", file);
    formData.append("upload_preset", "my_unsigned_preset"); // Replace with your Cloudinary upload preset
    formData.append("cloud_name", "dlehbizfp");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dlehbizfp/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setPreview(data.secure_url)
      onUploadSuccess(data.secure_url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      uploadToCloudinary(file)
    }
  }

  const removeImage = () => {
    setPreview("")
    onUploadSuccess("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview || "/placeholder.svg"}
            alt="Profile preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No image</p>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </>
          )}
        </button>

        {preview && (
          <button type="button" onClick={removeImage} className="text-sm text-red-600 hover:text-red-800">
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
    </div>
  )
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function DoctorManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("All Roles")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "therapist",
    designation: "",
    dateOfBirth: "",
    profilePicture: "",
    isActive: true,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  })
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const createApiUrl = (endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
    return `${API_BASE_URL}/${cleanEndpoint}`
  }

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const url = createApiUrl(endpoint)
      const token = getAdminToken()
      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
      }
      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`
      }
      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      }
      const response = await fetch(url, config)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("API call error:", error)
      throw error
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await apiCall("api/users")
      if (data.success) {
        const filteredUsers = data.data.filter(
          (user: User) => user.role === "therapist" || user.role === "receptionist" || user.role === "staff",
        )
        setUsers(filteredUsers)
      } else {
        showNotification("error", data.error || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Fetch users error:", error)
      showNotification("error", "Failed to fetch users. Please check your connection.")
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchUsers()
      } catch (error) {
        console.error("Error loading data:", error)
        showNotification("error", "Failed to load data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterRole === "All Roles" || user.role === filterRole
    return matchesSearch && matchesFilter
  })

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      role: "therapist",
      designation: "",
      dateOfBirth: "",
      profilePicture: "",
      isActive: true,
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showNotification("error", "Please fill in all required fields")
      return
    }
    if (!selectedUser && !formData.password) {
      showNotification("error", "Password is required for new users")
      return
    }

    try {
      const submitData = { ...formData }
      if (selectedUser && !formData.password) {
        delete submitData.password
      }

      if (submitData.address) {
        const hasAddressData = Object.values(submitData.address).some((value) => value && value.trim() !== "")
        if (!hasAddressData) {
          delete submitData.address
        }
      }

      const endpoint = selectedUser ? `api/users/${selectedUser._id}` : "api/auth/register"
      const method = selectedUser ? "PUT" : "POST"

      const data = await apiCall(endpoint, {
        method,
        body: JSON.stringify(submitData),
      })

      if (data.success) {
        showNotification("success", `User ${selectedUser ? "updated" : "created"} successfully`)
        await fetchUsers()
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        resetForm()
        setSelectedUser(null)
      } else {
        showNotification("error", data.error || "Operation failed")
      }
    } catch (error) {
      console.error("Submit error:", error)
      showNotification("error", "Network error occurred")
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const data = await apiCall(`api/users/${userId}`, {
        method: "DELETE",
      })
      if (data.success) {
        showNotification("success", "User deleted successfully")
        await fetchUsers()
      } else {
        showNotification("error", data.error || "Delete failed")
      }
    } catch (error) {
      console.error("Delete error:", error)
      showNotification("error", "Network error occurred")
    }
    setShowDeleteConfirm(null)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      phone: user.phone || "",
      role: user.role,
      designation: user.designation || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
      profilePicture: user.profilePicture || "",
      isActive: user.isActive,
      address: {
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "",
      },
    })
    setIsEditDialogOpen(true)
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const endpoint = currentStatus ? `api/users/${userId}/deactivate` : `api/users/${userId}/activate`
      const data = await apiCall(endpoint, { method: "PUT" })
      if (data.success) {
        showNotification("success", `User ${currentStatus ? "deactivated" : "activated"} successfully`)
        await fetchUsers()
      } else {
        showNotification("error", data.error || "Status update failed")
      }
    } catch (error) {
      console.error("Status toggle error:", error)
      showNotification("error", "Network error occurred")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ml-[300px] mt-32 bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage therapists, receptionists, and staff</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setIsAddDialogOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Staff
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Therapists</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.role === "therapist").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receptionists</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === "receptionist").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  style={{ color: "black" }}
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                style={{ color: "black" }}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Roles">All Roles</option>
                <option value="therapist">Therapist</option>
                <option value="receptionist">Receptionist</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Staff Members ({filteredUsers.length})</h3>
            <p className="text-sm text-gray-500">Manage all staff accounts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePicture ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                              src={user.profilePicture || "/placeholder.svg"}
                              alt={`${user.firstName} ${user.lastName}`}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                if (nextElement) nextElement.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${user.profilePicture ? "hidden" : "flex"}`}
                          >
                            <span className="text-sm font-semibold text-white">
                              {user.firstName[0]?.toUpperCase()}
                              {user.lastName[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "therapist"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "receptionist"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.designation || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No staff members found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddDialogOpen || isEditDialogOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md transition-opacity" />

          <div className="relative w-full max-w-4xl max-h-[85vh] transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">
                {selectedUser ? "Edit Staff Member" : "Add New Staff Member"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {selectedUser ? "Update staff member information" : "Create a new staff account"}
              </p>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-160px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <CloudinaryUpload
                  onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, profilePicture: url }))}
                  currentImage={formData.profilePicture}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      style={{ color: "black" }}
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      style={{ color: "black" }}
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    style={{ color: "black" }}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {!selectedUser && "*"}
                  </label>
                  <input
                    style={{ color: "black" }}
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                    required={!selectedUser}
                    placeholder={selectedUser ? "Leave blank to keep current password" : ""}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      style={{ color: "black" }}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      style={{ color: "black" }}
                      value={formData.role}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          role: e.target.value as "therapist" | "receptionist" | "staff",
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      required
                    >
                      <option value="therapist">Therapist</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      style={{ color: "black" }}
                      type="text"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          designation: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      placeholder="e.g., Senior Therapist, Head Receptionist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      style={{ color: "black" }}
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                      <input
                        style={{ color: "black" }}
                        type="text"
                        value={formData.address?.street || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        style={{ color: "black" }}
                        type="text"
                        value={formData.address?.city || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        style={{ color: "black" }}
                        type="text"
                        value={formData.address?.state || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: { ...prev.address, state: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                      <input
                        style={{ color: "black" }}
                        type="text"
                        value={formData.address?.zipCode || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: { ...prev.address, zipCode: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        style={{ color: "black" }}
                        type="text"
                        value={formData.address?.country || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: { ...prev.address, country: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Account
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setIsEditDialogOpen(false)
                      resetForm()
                      setSelectedUser(null)
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    {selectedUser ? "Update Staff" : "Create Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gradient-to-br from-red-900/60 via-gray-800/50 to-red-900/60 backdrop-blur-md transition-opacity" />

          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Staff Member</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete this staff member? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
