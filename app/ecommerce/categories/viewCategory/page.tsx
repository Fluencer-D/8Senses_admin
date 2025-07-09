"use client"

import { Suspense } from "react"

// Loading component for Suspense fallback
function CategoryDetailsLoading() {
  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category details...</p>
        </div>
      </div>
    </div>
  )
}

// Move your existing component code here
function CategoryDetailsContent() {
  const { useEffect, useState } = require("react")
  const { useRouter, useSearchParams } = require("next/navigation")

  interface Product {
    _id: string
    name: string
  }

  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("id")
  const [categoryName, setCategoryName] = useState("")
  const [categoryType, setCategoryType] = useState("")
  const [description, setDescription] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categoryId) return

    const token = localStorage.getItem("adminToken")

    const fetchData = async () => {
      try {
        // Fetch category details
        const categoryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const categoryData = await categoryRes.json()
        setCategoryName(categoryData.data.name)
        setCategoryType(categoryData.data.type)
        setDescription(categoryData.data.description || "")
        setSelectedProducts(categoryData.data.products || [])

        // Fetch all products
        const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const productData = await productRes.json()
        setAllProducts(productData.data || [])
      } catch (err) {
        console.error("Failed to fetch category or products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categoryId])

  const handleCancel = () => {
    router.push("/ecommerce/categories")
  }

  const handleSave = async () => {
    const token = localStorage.getItem("adminToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryName,
          type: categoryType,
          description,
          products: selectedProducts,
        }),
      })

      if (res.ok) {
        alert("Category updated!")
        router.push("/ecommerce/categories")
      } else {
        const error = await res.json()
        alert(error.message || "Update failed")
      }
    } catch (err) {
      console.error("Update Error:", err)
      alert("Something went wrong")
    }
  }

  if (loading) return <CategoryDetailsLoading />

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header section */}
      <h1 className="text-[#333843] text-3xl">Category Details</h1>
      <div className="flex justify-between items-center mb-4">
        {/* Breadcrumbs */}
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer">E-commerce</span> &gt;{" "}
          <span className="text-blue-600 cursor-pointer">Categories</span> &gt;{" "}
          <span className="text-gray-800 font-semibold">Category Details</span>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-[#858D9D] rounded-lg text-gray-700 flex items-center gap-1"
          >
            ✖ Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#C83C92] text-white rounded-lg flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 2.5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V7.47072C17.5 6.80768 17.2366 6.17179 16.7678 5.70295L14.297 3.23223C13.8282 2.76339 13.1923 2.5 12.5293 2.5H5ZM12.5293 4.16667H12.5V5.83333C12.5 6.75381 11.7538 7.5 10.8333 7.5H7.5C6.57953 7.5 5.83333 6.75381 5.83333 5.83333V4.16667H5C4.53976 4.16667 4.16667 4.53976 4.16667 5V15C4.16667 15.4602 4.53976 15.8333 5 15.8333H5.83333V10.8333C5.83333 9.91286 6.57953 9.16667 7.5 9.16667H12.5C13.4205 9.16667 14.1667 9.91286 14.1667 10.8333V15.8333H15C15.4602 15.8333 15.8333 15.4602 15.8333 15V7.47072C15.8333 7.24971 15.7455 7.03774 15.5893 6.88146L13.1185 4.41074C12.9623 4.25446 12.7503 4.16667 12.5293 4.16667ZM12.5 15.8333V10.8333H7.5V15.8333H12.5ZM7.5 4.16667H10.8333V5.83333H7.5V4.16667Z"
                fill="white"
              />
            </svg>{" "}
            Save Category
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {/* General Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4 text-[#333843]">General Information</h3>
          {/* Category Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1E437A] mb-1">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-white text-[#1E437A]"
            />
          </div>
          {/* Category Type */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1E437A] mb-1">Category Type</label>
            <div className="relative">
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-white text-[#1E437A] appearance-none"
              >
                <option value="Therapy Type">Therapy Type</option>
                <option value="Product Type">Product Type</option>
                <option value="Age Group">Age Group</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#1E437A] mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-white h-24 text-[#1E437A]"
            />
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4 text-[#1E437A]">Products</h3>
          {/* Assign Products */}
          <div>
            <label className="block text-sm font-semibold text-[#1E437A] mb-1">Assign Products to Category</label>
            <div className="relative">
              <select
                value=""
                onChange={(e) => {
                  const productId = e.target.value
                  if (productId && !selectedProducts.includes(productId)) {
                    setSelectedProducts([...selectedProducts, productId])
                  }
                }}
                className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-white text-[#1E437A] appearance-none"
              >
                <option value="">Select products to include in this category</option>
                {allProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Selected product list */}
          {selectedProducts.length > 0 && (
            <ul className="mt-4 space-y-2">
              {selectedProducts.map((id) => {
                const product = allProducts.find((p) => p._id === id)
                return (
                  <li key={id} className="flex justify-between items-center border p-2 rounded">
                    <span className="text-[#1E437A]">{product?.name || "Unnamed product"}</span>
                    <button
                      onClick={() => setSelectedProducts(selectedProducts.filter((pid) => pid !== id))}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense wrapper
export default function CategoryDetails() {
  return (
    <Suspense fallback={<CategoryDetailsLoading />}>
      <CategoryDetailsContent />
    </Suspense>
  )
}
