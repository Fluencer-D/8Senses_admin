"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminToken } from "@/utils/storage"

const AddPlanPage = () => {
  const router = useRouter()

  // State variables for form fields
  const [planName, setPlanName] = useState("")
  const [planDescription, setPlanDescription] = useState("")
  const [planStatus, setPlanStatus] = useState("active")
  const [price, setPrice] = useState("")
  const [billingCycle, setBillingCycle] = useState("")
  const [trialPeriod, setTrialPeriod] = useState("")
  const [gracePeriod, setGracePeriod] = useState("")
  const [order, setOrder] = useState("")
  const [accessToWebinars, setAccessToWebinars] = useState(false)
  const [accessToPremiumCourses, setAccessToPremiumCourses] = useState(false)
  const [customerDiscounts, setCustomerDiscounts] = useState(false)
  const [autoRenewal, setAutoRenewal] = useState(true)
  const [displayOnPricingPage, setDisplayOnPricingPage] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [adminToken, setAdminToken] = useState<string | null>(null);


  useEffect(() => {
    setIsClient(true)
  }, [])


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const token = getAdminToken();
      setAdminToken(token);
    }
  }, []);



  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!planName.trim()) {
      newErrors.planName = "Plan name is required"
    } else if (planName.length < 2) {
      newErrors.planName = "Plan name must be at least 2 characters"
    }

    if (!planDescription.trim()) {
      newErrors.planDescription = "Plan description is required"
    } else if (planDescription.length < 10) {
      newErrors.planDescription = "Plan description must be at least 10 characters"
    }

    if (!price) {
      newErrors.price = "Price is required"
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Price must be a valid number greater than or equal to 0"
    }

    if (!billingCycle) {
      newErrors.billingCycle = "Billing cycle is required"
    }

    if (trialPeriod && (isNaN(Number(trialPeriod)) || Number(trialPeriod) < 0)) {
      newErrors.trialPeriod = "Trial period must be a valid number"
    }

    if (gracePeriod && (isNaN(Number(gracePeriod)) || Number(gracePeriod) < 0)) {
      newErrors.gracePeriod = "Grace period must be a valid number"
    }

    if (order && (isNaN(Number(order)) || Number(order) < 0)) {
      newErrors.order = "Order must be a valid number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle cancel button click
  const handleCancel = () => {
    router.push("/subscription/plans")
  }




  // Handle save button click
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const planData = {
        name: planName,
        description: planDescription,
        status: planStatus,
        price: Number(price),
        billingCycle,
        trialPeriod: trialPeriod ? Number(trialPeriod) : 0,
        gracePeriod: gracePeriod ? Number(gracePeriod) : 0,
        order: order ? Number(order) : 0,
        features: {
          accessToWebinars,
          customerDiscounts,
          autoRenewal,
          displayOnPricingPage,
          accessToPremiumCourses,
        },
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": adminToken ? `Bearer ${adminToken}` : "",
        },
        body: JSON.stringify(planData),
      })

      const result = await response.json()

      if (result.success) {
        alert("Plan created successfully!")
        router.push("/subscription/plans")
      } else {
        if (result.errors) {
          const errorMessages = result.errors.map((err: any) => err.msg).join(", ")
          alert(`Error: ${errorMessages}`)
        } else {
          alert(`Error: ${result.error}`)
        }
      }
    } catch (error) {
      console.error("Error creating plan:", error)
      alert("Failed to create plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto">
      {/* Header */}
      <h1 className="text-[#333843] text-3xl">Plans</h1>
      <div className="flex justify-between items-center mb-4">
        {/* Breadcrumbs */}
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer">Subscription</span> &gt;{" "}
          <span className="text-blue-600 cursor-pointer">Plans</span> &gt;{" "}
          <span className="text-gray-800 font-semibold">Add Plan</span>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 flex items-center gap-1"
            disabled={isLoading}
          >
            ✖ Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#C83C92] text-white rounded-lg flex items-center gap-1 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5 2.5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V7.47072C17.5 6.80768 17.2366 6.17179 16.7678 5.70295L14.297 3.23223C13.8282 2.76339 13.1923 2.5 12.5293 2.5H5ZM12.5293 4.16667H12.5V5.83333C12.5 6.75381 11.7538 7.5 10.8333 7.5H7.5C6.57953 7.5 5.83333 6.75381 5.83333 5.83333V4.16667H5C4.53976 4.16667 4.16667 4.53976 4.16667 5V15C4.16667 15.4602 4.53976 15.8333 5 15.8333H5.83333V10.8333C5.83333 9.91286 6.57953 9.16667 7.5 9.16667H12.5C13.4205 9.16667 14.1667 9.91286 14.1667 10.8333V15.8333H15C15.4602 15.8333 15.8333 15.4602 15.8333 15V7.47072C15.8333 7.24971 15.7455 7.03774 15.5893 6.88146L13.1185 4.41074C12.9623 4.25446 12.7503 4.16667 12.5293 4.16667ZM12.5 15.8333V10.8333H7.5V15.8333H12.5ZM7.5 4.16667H10.8333V5.83333H7.5V4.16667Z"
                    fill="white"
                  />
                </svg>
                Save Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Basic Plan Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-[#333843] mb-4">Basic Plan Details</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1E437A] mb-1">Plan Name</label>
            <input
              type="text"
              placeholder="Type plan name here..."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className={`w-full border p-2 rounded-md text-[#858D9D] bg-[#F9F9FC] ${errors.planName ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.planName && <p className="text-red-500 text-sm mt-1">{errors.planName}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1E437A] mb-1">Plan Description</label>
            <textarea
              placeholder="Type plan description here..."
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              className={`w-full border p-2 rounded-md h-32 text-[#858D9D] bg-[#F9F9FC] ${errors.planDescription ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.planDescription && <p className="text-red-500 text-sm mt-1">{errors.planDescription}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Plan Status</label>
              <div className="relative">
                <select
                  value={planStatus}
                  onChange={(e) => setPlanStatus(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md appearance-none text-[#858D9D] bg-[#F9F9FC] pr-8"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Display Order</label>
              <input
                type="number"
                placeholder="Enter display order"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className={`w-full border p-2 rounded-md text-[#858D9D] bg-[#F9F9FC] ${errors.order ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.order && <p className="text-red-500 text-sm mt-1">{errors.order}</p>}
            </div>
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-[#333843] mb-4">Pricing & Duration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter price here"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full border p-2 pl-6 rounded-md text-[#858D9D] bg-[#F9F9FC] ${errors.price ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Billing Cycle</label>
              <div className="relative">
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className={`w-full border p-2 rounded-md appearance-none text-[#858D9D] bg-[#F9F9FC] pr-8 ${errors.billingCycle ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select billing cycle</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="biannual">Biannual</option>
                  <option value="annual">Annual</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              {errors.billingCycle && <p className="text-red-500 text-sm mt-1">{errors.billingCycle}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Trial Period (days)</label>
              <input
                type="number"
                placeholder="Enter trial period"
                value={trialPeriod}
                onChange={(e) => setTrialPeriod(e.target.value)}
                className={`w-full border p-2 rounded-md text-[#858D9D] bg-[#F9F9FC] ${errors.trialPeriod ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.trialPeriod && <p className="text-red-500 text-sm mt-1">{errors.trialPeriod}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Grace Period (days)</label>
              <input
                type="number"
                placeholder="Enter grace period"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className={`w-full border p-2 rounded-md text-[#858D9D] bg-[#F9F9FC] ${errors.gracePeriod ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.gracePeriod && <p className="text-red-500 text-sm mt-1">{errors.gracePeriod}</p>}
            </div>
          </div>
        </div>

        {/* Plan Benefits & Access */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-[#1E437A] mb-4">Plan Benefits & Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Access to Webinars */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#1E437A]">Access to Webinars?</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessToWebinars}
                    onChange={() => setAccessToWebinars(!accessToWebinars)}
                    className="sr-only peer"
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full peer transition-colors ${accessToWebinars ? "bg-[#C83C92]" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${accessToWebinars ? "translate-x-5" : ""}`}
                    ></div>
                  </div>
                </label>
              </div>

              {/* Customer Discounts */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#1E437A]">Customer Discounts?</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerDiscounts}
                    onChange={() => setCustomerDiscounts(!customerDiscounts)}
                    className="sr-only peer"
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full peer transition-colors ${customerDiscounts ? "bg-[#C83C92]" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${customerDiscounts ? "translate-x-5" : ""}`}
                    ></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#1E437A]">Access to Premium Courses?</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessToPremiumCourses}
                    onChange={() => setAccessToPremiumCourses(!accessToPremiumCourses)}
                    className="sr-only peer"
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full peer transition-colors ${accessToPremiumCourses ? "bg-[#C83C92]" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${accessToPremiumCourses ? "translate-x-5" : ""}`}
                    ></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Renewal & Payment Options */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-[#333843] mb-4">Renewal & Payment Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1E437A]">Auto-Renewal?</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenewal}
                  onChange={() => setAutoRenewal(!autoRenewal)}
                  className="sr-only peer"
                />
                <div
                  className={`relative w-11 h-6 rounded-full peer transition-colors ${autoRenewal ? "bg-[#C83C92]" : "bg-gray-200"}`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${autoRenewal ? "translate-x-5" : ""}`}
                  ></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1E437A]">Display on Pricing Page?</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayOnPricingPage}
                  onChange={() => setDisplayOnPricingPage(!displayOnPricingPage)}
                  className="sr-only peer"
                />
                <div
                  className={`relative w-11 h-6 rounded-full peer transition-colors ${displayOnPricingPage ? "bg-[#C83C92]" : "bg-gray-200"}`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${displayOnPricingPage ? "translate-x-5" : ""}`}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddPlanPage
