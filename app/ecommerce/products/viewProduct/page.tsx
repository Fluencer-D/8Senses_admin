"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSearchParams } from "next/navigation";

// Updated interface to match the actual API response structure
interface ProductData {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountType: string;
  discountPercentage: number;
  taxClass: string;
  vatAmount: number;
  sku: string;
  barcode: string;
  quantity: number;
  category: {
    _id: string;
    name: string;
    id: string;
  };
  status: string;
  images: {
    url: string;
    alt: string;
    isMain: boolean;
    _id: string;
    id: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const ProductDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  // State variables for form fields
  const [productName, setProductName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [discountType, setDiscountType] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<string>("");
  const [taxClass, setTaxClass] = useState<string>("");
  const [vatAmount, setVatAmount] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(""); // Added state for category ID
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [status, setStatus] = useState<string>("Draft");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch product data when component mounts
  useEffect(() => {
    if (!hasMounted || !productId) return;

    const fetchEverything = async () => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) return;

      try {
        const [productRes, categoriesRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const productData = productRes.data.data;
        const categoriesData = categoriesRes.data.data.filter(
          (cat: any) => cat.isActive
        );

        setCategories(categoriesData);
        setProductName(productData.name || "");
        setDescription(productData.description || "");
        setBasePrice(productData.price?.toString() || "");
        setDiscountType(productData.discountType || "");
        setDiscountPercentage(productData.discountPercentage?.toString() || "");
        setTaxClass(productData.taxClass || "");
        setVatAmount(productData.vatAmount?.toString() || "");
        setSku(productData.sku || "");
        setBarcode(productData.barcode || "");
        setQuantity(productData.quantity?.toString() || "");
        setCategory(productData.category?.name || "");
        setCategoryId(productData.category?._id || "");

        let displayStatus = "Draft";
        if (productData.status === "active") displayStatus = "Published";
        else if (productData.status === "archived") displayStatus = "Archived";
        setStatus(displayStatus);

        if (productData.images?.length > 0) {
          setImageUrl(productData.images[0].url || "");
        }

        setCreatedAt(productData.createdAt || "");
        setUpdatedAt(productData.updatedAt || "");
      } catch (err) {
        console.error("Error fetching product or category data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [productId, hasMounted]);

  if (!hasMounted) return null;

  // Handle edit/save button click
  const toggleEditMode = (): void => {
    setIsEditing(!isEditing);
    // Clear any success message when entering edit mode
    if (!isEditing) {
      setUpdateSuccess(false);
    }
  };

  // Handle cancel button click
  const handleCancel = (): void => {
    // Return to products list
    router.push("/ecommerce/products");
  };

  // Handle update button click
  const handleUpdate = async (): Promise<void> => {
    if (!productId) return;

    setError(null); // Clear any previous errors

    try {
      // Map status back to API format
      let apiStatus = "draft"; // Default to draft
      if (status === "Published") apiStatus = "active";
      else if (status === "Archived") apiStatus = "archived";

      // Prepare product data
      const productData = {
        name: productName,
        description,
        price: parseFloat(basePrice) || 0,
        discountType,
        discountPercentage: parseFloat(discountPercentage) || 0,
        taxClass,
        vatAmount: parseFloat(vatAmount) || 0,
        sku,
        barcode,
        quantity: parseInt(quantity, 10) || 0,
        category: categoryId, // Send the category ID rather than name
        status: apiStatus,
      };

      console.log("Sending product data:", productData); // Log the data before sending

      // Get the token from localStorage or your auth state
      const token = localStorage.getItem("adminToken"); // or however you store your auth token

      // Check if we have a token
      if (!token) {
        setError("You are not logged in. Please log in to update products.");
        return;
      }

      // Update product details with auth header
      const updateResponse = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/${productId}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update response:", updateResponse.data);

      // Exit edit mode after update
      setIsEditing(false);

      // Show success message
      setUpdateSuccess(true);

      // Update the updatedAt timestamp
      setUpdatedAt(new Date().toISOString());

      console.log("Product updated successfully");

      // Optional: Refresh product data to ensure we have the latest
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      const refreshedProductData = response.data.data;

      // Update state with refreshed data if needed
      setProductName(refreshedProductData.name || "");
      setDescription(refreshedProductData.description || "");
      setBasePrice(refreshedProductData.price?.toString() || "");
      setDiscountType(refreshedProductData.discountType || "");
      setDiscountPercentage(
        refreshedProductData.discountPercentage?.toString() || ""
      );
      setTaxClass(refreshedProductData.taxClass || "");
      setVatAmount(refreshedProductData.vatAmount?.toString() || "");
      setSku(refreshedProductData.sku || "");
      setBarcode(refreshedProductData.barcode || "");
      setQuantity(refreshedProductData.quantity?.toString() || "");
      setCategory(refreshedProductData.category?.name || "");
      setCategoryId(refreshedProductData.category?._id || "");
    } catch (err) {
      console.error("Error updating product:", err);

      // Show error message in UI
      if (axios.isAxiosError(err)) {
        console.log("Error response data:", err.response?.data); // Log the error response

        if (err.response?.status === 404) {
          setError(
            "Update failed: API endpoint not found. Please contact support."
          );
        } else if (err.response?.status === 401) {
          setError(
            "Authentication error: Your session has expired. Please log in again."
          );
          // You might want to redirect to login
          router.push("/login");
        } else if (err.response?.status === 403) {
          setError(
            "Permission denied: You don't have rights to update this product."
          );
        } else if (!err.response) {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setError(
            `Error updating product: ${
              err.response?.data?.message || "Unknown error"
            }`
          );
        }
      } else {
        setError("An unexpected error occurred while updating the product.");
      }
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);

    // You would typically upload the image to your server/storage here
    // const formData = new FormData();
    // formData.append('image', file);
    // const response = await axios.post('/api/upload', formData);
    // Handle the response...
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-4 text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => router.push("/ecommerce/products")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Breadcrumbs */}
      <h1 className="text-[#333843] text-3xl">Product Details</h1>
      <div className="flex justify-between items-center mb-4">
        {/* Breadcrumbs */}
        <div className="text-gray-500 text-sm">
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.push("/ecommerce")}
          >
            E-commerce
          </span>{" "}
          &gt;{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.push("/ecommerce/products")}
          >
            Products
          </span>{" "}
          &gt;{" "}
          <span className="text-gray-800 font-semibold">
            {productName || "Product Details"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 flex items-center gap-1"
          >
            ✖ Cancel
          </button>
          {isEditing ? (
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-[#C83C92] text-white rounded-lg flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 2.5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V7.47072C17.5 6.80768 17.2366 6.17179 16.7678 5.70295L14.297 3.23223C13.8282 2.76339 13.1923 2.5 12.5293 2.5H5ZM12.5293 4.16667H12.5V5.83333C12.5 6.75381 11.7538 7.5 10.8333 7.5H7.5C6.57953 7.5 5.83333 6.75381 5.83333 5.83333V4.16667H5C4.53976 4.16667 4.16667 4.53976 4.16667 5V15C4.16667 15.4602 4.53976 15.8333 5 15.8333H5.83333V10.8333C5.83333 9.91286 6.57953 9.16667 7.5 9.16667H12.5C13.4205 9.16667 14.1667 9.91286 14.1667 10.8333V15.8333H15C15.4602 15.8333 15.8333 15.4602 15.8333 15V7.47072C15.8333 7.24971 15.7455 7.03774 15.5893 6.88146L13.1185 4.41074C12.9623 4.25446 12.7503 4.16667 12.5293 4.16667ZM12.5 15.8333V10.8333H7.5V15.8333H12.5ZM7.5 4.16667H10.8333V5.83333H7.5V4.16667Z"
                  fill="white"
                />
              </svg>{" "}
              Save Product
            </button>
          ) : (
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 bg-[#245BA7] text-white rounded-lg flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M4.16667 15.8333H5.83333V14.1667H4.16667V15.8333ZM4.16667 10.8333H5.83333V9.16667H4.16667V10.8333ZM4.16667 5.83333H5.83333V4.16667H4.16667V5.83333ZM7.5 15.8333H15.8333V14.1667H7.5V15.8333ZM7.5 10.8333H15.8333V9.16667H7.5V10.8333ZM7.5 4.16667V5.83333H15.8333V4.16667H7.5Z"
                  fill="white"
                />
              </svg>{" "}
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex gap-4">
        {/* Left Side (Main Form) */}
        <div className="w-2/3 space-y-6">
          {/* General Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              General Information
            </h3>

            {/* Product Name */}
            <label className="block text-sm font-semibold text-[#1E437A] mb-1">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Type product name here..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                isEditing ? "bg-white" : "bg-[#F9F9FC]"
              } mb-4 text-[#333843]`}
              disabled={!isEditing}
            />

            {/* Description */}
            <label className="block text-sm font-semibold text-[#1E437A] mb-1">
              Description
            </label>
            <textarea
              placeholder="Type product description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                isEditing ? "bg-white" : "bg-[#F9F9FC]"
              } h-24 text-[#333843]`}
              disabled={!isEditing}
            />
          </div>

          {/* Media */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">Media</h3>

            {/* Photo Label */}
            <label className="block text-sm font-semibold text-[#1E437A] mb-2">
              Photo
            </label>

            {/* Current Image Display */}
            <div className="mb-4 border border-[#E0E2E7] rounded-lg p-2">
              <div className="bg-gray-100 h-40 w-full flex items-center justify-center rounded">
                <img
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : imageUrl
                      ? imageUrl
                      : "https://placehold.co/400x320"
                  }
                  alt={productName || "Product"}
                  className="max-h-full object-contain"
                />
              </div>
            </div>

            {/* Drag & Drop Area (Only show when editing) */}
            {isEditing && (
              <div className="border-2 border-dashed border-[#E0E2E7] bg-[#F9F9FC] p-6 rounded-lg text-center flex flex-col items-center">
                {/* Camera Icon */}
                <div className="mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                  >
                    <path
                      d="M9.33325 12.25C10.2998 12.25 11.0833 11.4665 11.0833 10.5C11.0833 9.53354 10.2998 8.75004 9.33325 8.75004C8.36675 8.75004 7.58325 9.53354 7.58325 10.5C7.58325 11.4665 8.36675 12.25 9.33325 12.25Z"
                      fill="#245BA7"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.70825 3.20837C4.77525 3.20837 3.20825 4.77538 3.20825 6.70837V21.2917C3.20825 23.2247 4.77526 24.7917 6.70825 24.7917H21.2916C23.2246 24.7917 24.7916 23.2247 24.7916 21.2917V6.70837C24.7916 4.77538 23.2246 3.20837 21.2916 3.20837H6.70825ZM21.2916 5.54171H6.70825C6.06392 5.54171 5.54159 6.06404 5.54159 6.70837V15.7712L8.45682 13.9772C8.65082 13.8578 8.89658 13.8623 9.08612 13.9887L12.1974 16.0629L17.1418 12.2173C17.3525 12.0534 17.6474 12.0534 17.8581 12.2172L22.4583 15.7952V6.70837C22.4583 6.06404 21.9359 5.54171 21.2916 5.54171ZM5.54159 21.2917V18.511L8.72477 16.5521L12.3025 18.9372L17.5 14.8947L22.4583 18.7512V21.2917C22.4583 21.936 21.9359 22.4584 21.2916 22.4584H6.70825C6.06392 22.4584 5.54159 21.936 5.54159 21.2917Z"
                      fill="#245BA7"
                    />
                  </svg>
                </div>

                {/* Drag & Drop Text */}
                <p className="text-gray-500 text-sm mb-3">
                  Drag and drop image here, or click add image
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="upload-image"
                />

                {/* Add Image Button */}
                <label
                  htmlFor="upload-image"
                  className="cursor-pointer bg-[#DEDEFA] text-[#245BA7] px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Update Image
                </label>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              Pricing
            </h3>

            {/* Base Price Input */}
            <div>
              <label className="text-sm font-semibold text-[#1E437A] mb-1">
                Base Price
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11 20C11 20.5523 11.4477 21 12 21C12.5523 21 13 20.5523 13 20V19.7465C15.5014 19.651 17.5 17.593 17.5 15.0682C17.5 12.8214 15.6786 11 13.4318 11H13V6.27392C13.797 6.37092 14.5238 6.75823 15.0475 7.34945C15.4137 7.76288 15.9953 8.00555 16.5 7.78125C17.0047 7.55695 17.2392 6.95834 16.9237 6.50507C16.0259 5.21544 14.5875 4.38385 13 4.26478V4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4V4.25347C8.49857 4.34898 6.5 6.40701 6.5 8.93182C6.5 11.1786 8.32139 13 10.5682 13H11V17.7261C10.203 17.6291 9.4762 17.2418 8.95253 16.6505C8.58633 16.2371 8.00468 15.9944 7.5 16.2188C6.99532 16.4431 6.76079 17.0417 7.07633 17.4949C7.97411 18.7846 9.41252 19.6161 11 19.7352V20ZM13 17.7439C14.3963 17.6505 15.5 16.4882 15.5 15.0682C15.5 13.926 14.574 13 13.4318 13H13V17.7439ZM11 11V6.25607C9.60366 6.34955 8.5 7.5118 8.5 8.93182C8.5 10.074 9.42596 11 10.5682 11H11Z"
                      fill="#667085"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Type base price here..."
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 pl-8 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Discount Type & Discount Percentage */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                >
                  <option value="">Select a discount type</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="text"
                  placeholder="Type discount percentage..."
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Tax Class & VAT Amount */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  Tax Class
                </label>
                <select
                  value={taxClass}
                  onChange={(e) => setTaxClass(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                >
                  <option value="">Select a tax class</option>
                  <option value="standard">Standard</option>
                  <option value="reduced">Reduced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  VAT Amount (%)
                </label>
                <input
                  type="text"
                  placeholder="Type VAT amount..."
                  value={vatAmount}
                  onChange={(e) => setVatAmount(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              Inventory
            </h3>

            {/* SKU, Barcode, and Quantity Inputs */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  placeholder="Type product SKU here..."
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  placeholder="Product barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  placeholder="Type product quantity here..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                    isEditing ? "bg-white" : "bg-[#F9F9FC]"
                  } text-[#333843]`}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Sidebar) */}
        <div className="w-1/3 space-y-6">
          {/* Category */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              Category
            </h3>
            <label className="text-sm font-semibold text-[#1E437A] mb-1">
              Product Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setCategoryId(selectedId);
                const selectedCategory = categories.find(
                  (cat) => cat._id === selectedId
                );
                setCategory(selectedCategory?.name || "");
              }}
              className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                isEditing ? "bg-white" : "bg-[#F9F9FC]"
              } text-[#333843]`}
              disabled={!isEditing}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-[#333843]">Status</h3>
              <span
                className={`${
                  status === "Published"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                } text-sm px-3 py-1 rounded-lg`}
              >
                {status}
              </span>
            </div>
            <label className="text-sm font-semibold text-[#1E437A] mb-1">
              Product Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full border border-[#E0E2E7] p-3 rounded-lg ${
                isEditing ? "bg-white" : "bg-[#F9F9FC]"
              } text-[#333843]`}
              disabled={!isEditing}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Product Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              Product ID
            </h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                ID: <span className="font-mono text-gray-800">{productId}</span>
              </p>
              <p className="mb-2">
                Created: <span className="text-gray-800">April 4, 2025</span>
              </p>
              <p>
                Last Updated:{" "}
                <span className="text-gray-800">April 5, 2025</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
