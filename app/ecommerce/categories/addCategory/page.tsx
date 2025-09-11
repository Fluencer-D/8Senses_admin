"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/utils/storage";

const AddCategory = () => {
  const router = useRouter();

  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<
    { _id: string; name: string }[]
  >([]);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = getAdminToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setAllProducts(data.data || []);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, []);


  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      // ✅ If token is missing, redirect to login page
      router.replace("/admin");

    }
  }, [router]);

  const handleCancel = () => {
    setCategoryName("");
    setCategoryType("");
    setDescription("");
    setSelectedProducts([]);
    router.push("/ecommerce/categories");
  };

  const handleSubmit = async () => {
    const token = getAdminToken();

    const payload = {
      name: categoryName,
      type: categoryType,
      description,
      products: selectedProducts,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        router.push("/ecommerce/categories");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-hidden">
      <h1 className="text-[#333843] text-3xl mb-2">Add Category</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer">E-commerce</span> &gt;{" "}
          <span className="text-blue-600 cursor-pointer">Categories</span> &gt;{" "}
          <span className="text-gray-800 font-semibold">Add Category</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 flex items-center gap-1"
          >
            <span>✖</span> Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#C83C92] text-white rounded-lg flex items-center gap-1"
          >
            <span>+</span> Add Category
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl text-[#333843] font-semibold mb-4">
          General Information
        </h2>

        <div className="mb-4">
          <label className="block text-[#1E437A] text-sm font-semibold mb-2">
            Category Name
          </label>
          <input
            type="text"
            placeholder="Type category name here..."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[#1E437A] text-sm font-semibold mb-2">
            Category Type
          </label>
          <div className="relative">
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-black appearance-none"
            >
              <option value="">Select a category type</option>
              <option value="physical">Physical Products</option>
              <option value="digital">Digital Products</option>
              <option value="services">Services</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 fill-current text-gray-500"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[#1E437A] text-sm font-semibold mb-2">
            Description
          </label>
          <textarea
            placeholder="Type category description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] h-32 text-black"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-[#333843]">Products</h2>

        <div>
          <label className="block text-[#1E437A] text-sm font-semibold mb-2">
            Assign Products to Category
          </label>
          <div className="relative">
            <select
              className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-black appearance-none"
              onChange={(e) => {
                const value = e.target.value;
                if (value && !selectedProducts.includes(value)) {
                  setSelectedProducts([...selectedProducts, value]);
                }
              }}
              value=""
            >
              <option value="">
                Select products to include in this category
              </option>
              {allProducts.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 fill-current text-gray-500"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
              </svg>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Selected Products:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                  >
                    <span>
                      {allProducts.find((p) => p._id === product)?.name ||
                        product}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedProducts(
                          selectedProducts.filter((p) => p !== product)
                        )
                      }
                      className="ml-2 text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
