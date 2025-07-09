"use client"

import { Suspense } from "react"

// Loading component for Suspense fallback
function UpdateStockLoading() {
  return (
    <div className="p-6 max-w-[84%] mt-20 ml-70 mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="items-center gap-8">
          <h1 className="text-[#333843] text-3xl">Update Stock</h1>
          <div className="text-gray-500 text-sm flex items-center">
            <span className="text-[#245BA7] cursor-pointer">E-commerce</span>
            <span className="mx-2">&gt;</span>
            <span className="text-[#245BA7] cursor-pointer">Inventory</span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800">Update Stock</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-300 text-[#858D9D] px-5 py-2 rounded-lg">
            Cancel
          </button>
          <button className="flex items-center gap-2 bg-[#C83C92] text-white px-5 py-2 rounded-lg">Update Stock</button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Move your existing component code here
function UpdateStockContent() {
  const React = require("react")
  const { useState, useEffect } = React
  const { useRouter, useSearchParams } = require("next/navigation")

  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")
  const [productName, setProductName] = useState("")
  const [currentStock, setCurrentStock] = useState("")
  const [newStockLevel, setNewStockLevel] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) return

    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch product")

        const data = await res.json()
        setProductName(data.data.name || "")
        setCurrentStock(data.data.quantity?.toString() || "")
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [productId])

  const handleCancel = () => {
    router.push("/ecommerce/inventory")
  }

  const handleUpdateStock = async () => {
    if (!newStockLevel) return

    try {
      const token = localStorage.getItem("adminToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/${productId}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: Number.parseInt(newStockLevel) }),
      })

      if (!res.ok) throw new Error("Failed to update stock")

      router.push("/ecommerce/inventory")
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-[84%] mt-20 ml-70 mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="items-center gap-8">
            <h1 className="text-[#333843] text-3xl">Update Stock</h1>
            <div className="text-gray-500 text-sm flex items-center">
              <span className="text-[#245BA7] cursor-pointer">E-commerce</span>
              <span className="mx-2">&gt;</span>
              <span className="text-[#245BA7] cursor-pointer">Inventory</span>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-800">Update Stock</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border border-gray-300 text-[#858D9D] px-5 py-2 rounded-lg">
              Cancel
            </button>
            <button className="flex items-center gap-2 bg-[#C83C92] text-white px-5 py-2 rounded-lg">
              Update Stock
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-[84%] mt-20 ml-70 mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[84%] mt-20 ml-70 mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="items-center gap-8">
          <h1 className="text-[#333843] text-3xl">Update Stock</h1>
          <div className="text-gray-500 text-sm flex items-center">
            <span className="text-[#245BA7] cursor-pointer">E-commerce</span>
            <span className="mx-2">&gt;</span>
            <span className="text-[#245BA7] cursor-pointer">Inventory</span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800">Update Stock</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 border border-gray-300 text-[#858D9D] px-5 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStock}
            className="flex items-center gap-2 bg-[#C83C92] text-white px-5 py-2 rounded-lg"
          >
            Update Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <label htmlFor="productName" className="block text-[#1E437A] font-semibold mb-2">
            Product Name
          </label>
          <input
            type="text"
            id="productName"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700"
            value={productName}
            disabled
          />
        </div>

        <div className="mb-6">
          <label htmlFor="currentStock" className="block text-[#1E437A] font-semibold mb-2">
            Current Stock
          </label>
          <input
            type="text"
            id="currentStock"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700"
            value={currentStock}
            disabled
          />
        </div>

        <div className="mb-6">
          <label htmlFor="newStockLevel" className="block text-[#1E437A] font-semibold mb-2">
            Enter New Stock Level
          </label>
          <input
            type="text"
            id="newStockLevel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700"
            placeholder="Type new stock level..."
            value={newStockLevel}
            onChange={(e) => setNewStockLevel(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense wrapper
export default function UpdateStockForm() {
  return (
    <Suspense fallback={<UpdateStockLoading />}>
      <UpdateStockContent />
    </Suspense>
  )
}
