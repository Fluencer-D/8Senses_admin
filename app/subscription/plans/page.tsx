"use client"

import { getAdminToken } from "@/utils/storage"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState, useEffect } from "react"

interface PlanData {
  _id: string
  name: string
  price: number
  billingCycle: "monthly" | "quarterly" | "biannual" | "annual"
  description: string
  status: "active" | "inactive" | "archived"
  features: {
    accessToWebinars: boolean
    customerDiscounts: boolean
    autoRenewal: boolean
    displayOnPricingPage: boolean
    accessToPremiumCourses: boolean
  }
  trialPeriod: number
  gracePeriod: number
  order: number
  createdAt: string
  updatedAt: string
}

const PlansPage: React.FC = () => {
  const router = useRouter()
  const [plansData, setPlansData] = useState<PlanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<PlanData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch plans from API
  const fetchPlans = async () => {
    
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setPlansData(result.data)
      } else {
        setError(result.error || "Failed to fetch plans")
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
      setError("Failed to fetch plans")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const formatPrice = (price: number, billingCycle: string) => {
    const formattedPrice = `$${price.toFixed(2)}`
    const cycleMap: { [key: string]: string } = {
      monthly: "/month",
      quarterly: "/quarter",
      biannual: "/6 months",
      annual: "/year",
    }
    return `${formattedPrice}${cycleMap[billingCycle] || ""}`
  }

  const getBenefitsSummary = (features: PlanData["features"]) => {
    const benefits = []
    if (features.accessToWebinars) benefits.push("Webinars")
    if (features.accessToPremiumCourses) benefits.push("Premium Courses")
    if (features.customerDiscounts) benefits.push("Discounts")
    return benefits.length > 0 ? benefits.join(", ") : "Basic access"
  }

  const handleViewPlan = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSelectedPlan(result.data)
        setShowViewModal(true)
      } else {
        alert(`Error fetching plan: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error fetching plan for view:", error)
      alert("Failed to fetch plan details.")
    }
  }

  const handleEditPlan = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSelectedPlan(result.data)
        setEditFormData(result.data) // Initialize form data with current plan data
        setShowEditModal(true)
      } else {
        alert(`Error fetching plan for edit: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error fetching plan for edit:", error)
      alert("Failed to fetch plan details for editing.")
    }
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setEditFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [name]: checked,
        },
      }))
    } else if (name === "price" || name === "trialPeriod" || name === "gracePeriod" || name === "order") {
      setEditFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedPlan?._id) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans/${selectedPlan._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(editFormData),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        alert("Plan updated successfully!")
        setShowEditModal(false)
        fetchPlans() // Refresh the plans list
      } else {
        alert(`Error updating plan: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      alert("Failed to update plan. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAdminToken()}`,
          },
        })
        const result = await response.json()
        if (response.ok && result.success) {
          alert("Plan deleted successfully!")
          fetchPlans() // Refresh the plans list
        } else {
          alert(`Error: ${result.error}`)
        }
      } catch (error) {
        console.error("Error deleting plan:", error)
        alert("Failed to delete plan. Please try again.")
      }
    }
  }

  const handleAddNewPlan = () => {
    router.push("/subscription/plans/addPlan")
  }

  const handleExport = async () => {
    try {
      // Create CSV content
      const csvContent = [
        ["Plan Name", "Price", "Billing Cycle", "Status", "Benefits", "Created Date"].join(","),
        ...plansData.map((plan) =>
          [
            plan.name,
            plan.price,
            plan.billingCycle,
            plan.status,
            getBenefitsSummary(plan.features),
            new Date(plan.createdAt).toLocaleDateString(),
          ].join(","),
        ),
      ].join("\n")
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `subscription-plans-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting plans:", error)
      alert("Failed to export plans")
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C83C92]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button onClick={fetchPlans} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[84%] font-sans mt-15 ml-70 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[#1E437A] text-3xl font-medium">Plans</h1>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#FFF1F8] text-[#C83C92] px-4 py-2 rounded-lg font-medium hover:bg-[#FFE7F1]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 17V3" />
                <path d="m6 11 6 6 6-6" />
                <path d="M19 21H5" />
              </svg>
              Export
            </button>
            <button
              className="flex items-center gap-2 bg-[#C83C92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#B8358A]"
              onClick={handleAddNewPlan}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add New Plan
            </button>
          </div>
        </div>
        <div className="text-gray-500 text-sm mt-1 flex items-center">
          <span className="text-[#1E437A] cursor-pointer">Subscription</span>
          <span className="mx-2">{">"}</span>
          <span className="text-[#667085]">Plans</span>
        </div>
      </div>
      {/* Plans Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 py-4 px-6 bg-gray-50 text-[#1E437A] font-medium">
          <div>Plan Name</div>
          <div>Price</div>
          <div>Status</div>
          <div>Benefits Summary</div>
          <div className="text-right">Action</div>
        </div>
        {/* Table Body */}
        {plansData.length === 0 ? (
          <div className="py-8 px-6 text-center text-gray-500">
            No plans found.{" "}
            <button onClick={handleAddNewPlan} className="text-[#C83C92] hover:underline">
              Create your first plan
            </button>
          </div>
        ) : (
          plansData.map((plan) => (
            <div
              key={plan._id}
              className="grid grid-cols-5 py-4 px-6 border-t border-gray-200 items-center hover:bg-gray-50"
            >
              <div className="text-[#1E437A] font-medium">{plan.name}</div>
              <div className="text-[#1E437A]">{formatPrice(plan.price, plan.billingCycle)}</div>
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {plan.status}
                </span>
              </div>
              <div className="text-[#667085]">{getBenefitsSummary(plan.features)}</div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleViewPlan(plan._id)}
                  className="p-1.5 text-gray-500 hover:text-[#1E437A]"
                  title="View Plan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.99972 4.16675C15.108 4.16675 17.5253 7.59172 18.3763 9.1929C18.6473 9.70275 18.6473 10.2974 18.3763 10.8073C17.5253 12.4084 15.108 15.8334 9.99972 15.8334C4.89139 15.8334 2.47411 12.4084 1.62315 10.8073C1.35218 10.2974 1.35218 9.70274 1.62315 9.1929C2.47411 7.59172 4.89139 4.16675 9.99972 4.16675ZM5.69667 7.06483C4.31312 7.98153 3.50523 9.20294 3.09488 9.97507C3.09029 9.98369 3.08841 9.98967 3.08758 9.99295C3.08675 9.99629 3.08659 10.0001 3.08659 10.0001C3.08659 10.0001 3.08675 10.0039 3.08758 10.0072C3.08841 10.0105 3.09029 10.0165 3.09488 10.0251C3.50523 10.7972 4.31312 12.0186 5.69667 12.9353C5.12545 12.0995 4.79139 11.0888 4.79139 10.0001C4.79139 8.91133 5.12545 7.90061 5.69667 7.06483ZM14.3028 12.9353C15.6863 12.0186 16.4942 10.7972 16.9046 10.0251C16.9091 10.0165 16.911 10.0105 16.9119 10.0072C16.9124 10.005 16.9128 10.002 16.9128 10.002L16.9128 10.0001L16.9126 9.99641L16.9119 9.99295C16.911 9.98967 16.9091 9.98369 16.9046 9.97507C16.4942 9.20294 15.6863 7.98154 14.3028 7.06484C14.874 7.90062 15.2081 8.91134 15.2081 10.0001C15.2081 11.0888 14.874 12.0995 14.3028 12.9353ZM6.45806 10.0001C6.45806 8.04407 8.04371 6.45841 9.99972 6.45841C11.9557 6.45841 13.5414 8.04407 13.5414 10.0001C13.5414 11.9561 11.9557 13.5417 9.99972 13.5417C8.04371 13.5417 6.45806 11.9561 6.45806 10.0001Z"
                      fill="#456696"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleEditPlan(plan._id)}
                  className="p-1.5 text-gray-500 hover:text-[#1E437A]"
                  title="Edit Plan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M17.3047 6.82016C18.281 5.84385 18.281 4.26093 17.3047 3.28462L16.7155 2.69537C15.7391 1.71906 14.1562 1.71906 13.1799 2.69537L3.69097 12.1843C3.34624 12.529 3.10982 12.967 3.01082 13.4444L2.34111 16.6738C2.21932 17.261 2.73906 17.7807 3.32629 17.6589L6.55565 16.9892C7.03302 16.8902 7.47103 16.6538 7.81577 16.3091L17.3047 6.82016ZM16.1262 4.46313L15.5369 3.87388C15.2115 3.54844 14.6839 3.54844 14.3584 3.87388L13.4745 4.75779L15.2423 6.52556L16.1262 5.64165C16.4516 5.31621 16.4516 4.78857 16.1262 4.46313ZM14.0638 7.70407L12.296 5.9363L4.86948 13.3628C4.75457 13.4777 4.67577 13.6237 4.64277 13.7829L4.23082 15.7692L6.21721 15.3573C6.37634 15.3243 6.52234 15.2455 6.63726 15.1306L14.0638 7.70407Z"
                      fill="#456696"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="p-1.5 text-gray-500 hover:text-[#F04438]"
                  title="Delete Plan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M8.33366 8.12508C8.7939 8.12508 9.16699 8.49818 9.16699 8.95842V13.9584C9.16699 14.4187 8.7939 14.7917 8.33366 14.7917C7.87342 14.7917 7.50033 14.4187 7.50033 13.9584V8.95842C7.50033 8.49818 7.87342 8.12508 8.33366 8.12508Z"
                      fill="#456696"
                    />
                    <path
                      d="M12.5003 8.95842C12.5003 8.49818 12.1272 8.12508 11.667 8.12508C11.2068 8.12508 10.8337 8.49818 10.8337 8.95842V13.9584C10.8337 14.4187 11.2068 14.7917 11.667 14.7917C12.1272 14.7917 12.5003 14.4187 12.5003 13.9584V8.95842Z"
                      fill="#456696"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.0003 5.00008V4.16675C15.0003 2.78604 13.881 1.66675 12.5003 1.66675H7.50033C6.11961 1.66675 5.00033 2.78604 5.00033 4.16675V5.00008H3.75033C3.29009 5.00008 2.91699 5.37318 2.91699 5.83342C2.91699 6.29365 3.29009 6.66675 3.75033 6.66675H4.16699V15.8334C4.16699 17.2141 5.28628 18.3334 6.66699 18.3334H13.3337C14.7144 18.3334 15.8337 17.2141 15.8337 15.8334V6.66675H16.2503C16.7106 6.66675 17.0837 6.29365 17.0837 5.83342C17.0837 5.37318 16.7106 5.00008 16.2503 5.00008H15.0003ZM12.5003 3.33341H7.50033C7.04009 3.33341 6.66699 3.70651 6.66699 4.16675V5.00008H13.3337V4.16675C13.3337 3.70651 12.9606 3.33341 12.5003 3.33341ZM14.167 6.66675H5.83366V15.8334C5.83366 16.2937 6.20676 16.6667 6.66699 16.6667H13.3337C13.7939 16.6667 14.167 16.2937 14.167 15.8334V6.66675Z"
                      fill="#456696"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Plan Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Plan Details: {selectedPlan.name}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Detailed information about the selected subscription plan.</p>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-name" className="text-right text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  style={{color:"black"}}
                  id="view-name"
                  value={selectedPlan.name || ""}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-description" className="text-right text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                style={{color:"black"}}
                  id="view-description"
                  value={selectedPlan.description || ""}
                  readOnly
                  className="col-span-3 flex h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-price" className="text-right text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                style={{color:"black"}}
                  id="view-price"
                  value={selectedPlan.price.toFixed(2) || ""}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-billingCycle" className="text-right text-sm font-medium text-gray-700">
                  Billing Cycle
                </label>
                <input
                style={{color:"black"}}
                  id="view-billingCycle"
                  value={selectedPlan.billingCycle || ""}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-status" className="text-right text-sm font-medium text-gray-700">
                  Status
                </label>
                <input
                style={{color:"black"}}
                  id="view-status"
                  value={selectedPlan.status || ""}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-trialPeriod" className="text-right text-sm font-medium text-gray-700">
                  Trial Period (days)
                </label>
                <input
                style={{color:"black"}}
                  id="view-trialPeriod"
                  value={selectedPlan.trialPeriod.toString() || "0"}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-gracePeriod" className="text-right text-sm font-medium text-gray-700">
                  Grace Period (days)
                </label>
                <input
                style={{color:"black"}}
                  id="view-gracePeriod"
                  value={selectedPlan.gracePeriod.toString() || "0"}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-order" className="text-right text-sm font-medium text-gray-700">
                  Order
                </label>
                <input
                style={{color:"black"}}
                  id="view-order"
                  value={selectedPlan.order.toString() || "0"}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right pt-2 text-sm font-medium text-gray-700">Features</label>
                <div className="col-span-3 grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="view-webinars"
                      checked={selectedPlan.features?.accessToWebinars}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="view-webinars" className="text-sm font-medium text-gray-700">
                      Access to Webinars
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="view-discounts"
                      checked={selectedPlan.features?.customerDiscounts}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="view-discounts" className="text-sm font-medium text-gray-700">
                      Customer Discounts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="view-autoRenewal"
                      checked={selectedPlan.features?.autoRenewal}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="view-autoRenewal" className="text-sm font-medium text-gray-700">
                      Auto Renewal
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="view-display"
                      checked={selectedPlan.features?.displayOnPricingPage}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="view-display" className="text-sm font-medium text-gray-700">
                      Display on Pricing Page
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="view-premiumCourses"
                      checked={selectedPlan.features?.accessToPremiumCourses}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="view-premiumCourses" className="text-sm font-medium text-gray-700">
                      Access to Premium Courses
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-createdAt" className="text-right text-sm font-medium text-gray-700">
                  Created At
                </label>
                <input
                style={{color:"black"}}
                  id="view-createdAt"
                  value={selectedPlan.createdAt ? new Date(selectedPlan.createdAt).toLocaleString() : ""}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-updatedAt" className="text-right text-sm font-medium text-gray-700">
                  Updated At
                </label>
                <input
                style={{color:"black"}}
                  id="view-updatedAt"
                  value={selectedPlan.updatedAt ? new Date(selectedPlan.updatedAt).toLocaleString() : ""}
                  readOnly
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 ring-offset-white transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Plan: {selectedPlan.name}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Make changes to the subscription plan here. Click save when you're done.
            </p>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                style={{color:"black"}}
                  id="edit-name"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-description" className="text-right text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description || ""}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-price" className="text-right text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                style={{color:"black"}}
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={editFormData.price || ""}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-billingCycle" className="text-right text-sm font-medium text-gray-700">
                  Billing Cycle
                </label>
                <select
                  id="edit-billingCycle"
                  style={{color:"black"}}
                  name="billingCycle"
                  value={editFormData.billingCycle || ""}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a billing cycle</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="biannual">Biannual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-status" className="text-right text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                style={{color:"black"}}
                  id="edit-status"
                  name="status"
                  value={editFormData.status || ""}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-trialPeriod" className="text-right text-sm font-medium text-gray-700">
                  Trial Period (days)
                </label>
                <input
                style={{color:"black"}}
                  id="edit-trialPeriod"
                  name="trialPeriod"
                  type="number"
                  value={editFormData.trialPeriod || 0}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-gracePeriod" className="text-right text-sm font-medium text-gray-700">
                  Grace Period (days)
                </label>
                <input
                style={{color:"black"}}
                  id="edit-gracePeriod"
                  name="gracePeriod"
                  type="number"
                  value={editFormData.gracePeriod || 0}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-order" className="text-right text-sm font-medium text-gray-700">
                  Order
                </label>
                <input
                style={{color:"black"}}
                  id="edit-order"
                  name="order"
                  type="number"
                  value={editFormData.order || 0}
                  onChange={handleEditFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right pt-2 text-sm font-medium text-gray-700">Features</label>
                <div className="col-span-3 grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="accessToWebinars"
                      name="accessToWebinars"
                      checked={editFormData.features?.accessToWebinars || false}
                      onChange={handleEditFormChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="accessToWebinars" className="text-sm font-medium text-gray-700">
                      Access to Webinars
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="customerDiscounts"
                      name="customerDiscounts"
                      checked={editFormData.features?.customerDiscounts || false}
                      onChange={handleEditFormChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="customerDiscounts" className="text-sm font-medium text-gray-700">
                      Customer Discounts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="autoRenewal"
                      name="autoRenewal"
                      checked={editFormData.features?.autoRenewal || false}
                      onChange={handleEditFormChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="autoRenewal" className="text-sm font-medium text-gray-700">
                      Auto Renewal
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="displayOnPricingPage"
                      name="displayOnPricingPage"
                      checked={editFormData.features?.displayOnPricingPage || false}
                      onChange={handleEditFormChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="displayOnPricingPage" className="text-sm font-medium text-gray-700">
                      Display on Pricing Page
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                    style={{color:"black"}}
                      type="checkbox"
                      id="accessToPremiumCourses"
                      name="accessToPremiumCourses"
                      checked={editFormData.features?.accessToPremiumCourses || false}
                      onChange={handleEditFormChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#C83C92] focus:ring-[#C83C92]"
                    />
                    <label htmlFor="accessToPremiumCourses" className="text-sm font-medium text-gray-700">
                      Access to Premium Courses
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm ring-offset-white transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 ring-offset-white transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlansPage
