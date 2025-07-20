"use client"

import { getAdminToken } from "@/utils/storage"
import type React from "react"
import { useState, useEffect } from "react"

// Types
interface Service {
  _id: string
  name: string
  description: string
  detailedContent: string
  category: string
  duration: number
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ServiceFormData {
  name: string
  description: string
  detailedContent: string
  category: string
  duration: number | string
  price: number | string
  isActive: boolean
}

const CATEGORIES = ["Occupational Therapy", "Speech Therapy", "Physical Therapy", "Assessment", "Consultation", "Other"]

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/services` // Adjust this to your API base URL

export default function ServicesAdminPanel() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    detailedContent: "",
    category: "",
    duration: "",
    price: "",
    isActive: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Show notification
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true)
      let url = API_BASE_URL
      const params = new URLSearchParams()

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter)
      }
      if (activeFilter !== "all") {
        params.append("isActive", activeFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url,{
        method:"GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          'Authorization': `Bearer ${getAdminToken()}`
        },
      })
      const data = await response.json()

      if (data.success) {
        setServices(data.data)
      } else {
        showNotification("Failed to fetch services", "error")
      }
    } catch (error) {
      showNotification("Failed to fetch services", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [categoryFilter, activeFilter])

  // Filter services based on search term
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      detailedContent: "",
      category: "",
      duration: "",
      price: "",
      isActive: true,
    })
    setFormErrors({})
    setEditingService(null)
  }

  // Open dialog for adding new service
  const handleAddNew = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Open dialog for editing service
  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      detailedContent: service.detailedContent,
      category: service.category,
      duration: service.duration,
      price: service.price,
      isActive: service.isActive,
    })
    setFormErrors({})
    setIsDialogOpen(true)
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Service name is required"
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }
    if (!formData.category) {
      errors.category = "Category is required"
    }
    if (!formData.duration || Number(formData.duration) < 1) {
      errors.duration = "Duration must be a positive number"
    }
    if (!formData.price || Number(formData.price) < 0) {
      errors.price = "Price must be a positive number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const submitData = {
        ...formData,
        duration: Number(formData.duration),
        price: Number(formData.price),
      }

      const url = editingService ? `${API_BASE_URL}/${editingService._id}` : API_BASE_URL
      const method = editingService ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.success) {
        showNotification(`Service ${editingService ? "updated" : "created"} successfully`, "success")
        setIsDialogOpen(false)
        resetForm()
        fetchServices()
      } else {
        if (data.errors) {
          const newErrors: Record<string, string> = {}
          data.errors.forEach((error: any) => {
            newErrors[error.path || error.param] = error.msg
          })
          setFormErrors(newErrors)
        } else {
          showNotification(data.error || "Failed to save service", "error")
        }
      }
    } catch (error) {
      showNotification("Failed to save service", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // Delete service
  const handleDelete = async (serviceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${serviceId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          'Authorization': `Bearer ${getAdminToken()}`
        },
      })

      const data = await response.json()

      if (data.success) {
        showNotification("Service deleted successfully", "success")
        fetchServices()
      } else {
        showNotification(data.error || "Failed to delete service", "error")
      }
    } catch (error) {
      showNotification("Failed to delete service", "error")
    }
    setIsDeleteDialogOpen(false)
    setServiceToDelete(null)
  }

  const openDeleteDialog = (service: Service) => {
    setServiceToDelete(service)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="min-h-screen ml-[300px] pt-32 bg-gray-50 p-6">
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Management</h1>
          <p className="text-gray-600">Manage your therapy services, pricing, and availability</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
                  style={{color:"black"}}
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              style={{color:"black"}}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              style={{color:"black"}}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              onClick={handleAddNew}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Service
            </button>
          </div>

          {/* Services Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        No services found
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => (
                      <tr key={service._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-900">{service.duration} min</td>
                        <td className="py-4 px-4 text-gray-900">${service.price}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              service.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteDialog(service)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingService ? "Edit Service" : "Add New Service"}
              </h2>
              <p className="text-gray-600 mt-1">
                {editingService ? "Update the service details below." : "Fill in the details to create a new service."}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  style={{color:"black"}}
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter service name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter service description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label htmlFor="detailedContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Content
                </label>
                <textarea
                  id="detailedContent"
                  value={formData.detailedContent}
                  onChange={(e) => setFormData({ ...formData, detailedContent: e.target.value })}
                  placeholder="Enter detailed content (optional)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  style={{color:"black"}}
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formErrors.category && <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                  style={{color:"black"}}
                    type="number"
                    id="duration"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formErrors.duration && <p className="text-sm text-red-600 mt-1">{formErrors.duration}</p>}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                  style={{color:"black"}}
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="100.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formErrors.price && <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  style={{color:"black"}}
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Service is active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {editingService ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && serviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Service</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete "{serviceToDelete.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(serviceToDelete._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
