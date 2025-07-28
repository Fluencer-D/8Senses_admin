"use client";
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/utils/storage";

const AddProduct = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [price, setPrice] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [taxClass, setTaxClass] = useState("");
  const [vatAmount, setVatAmount] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (typeof window === "undefined") return;

      try {
        const token = getAdminToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCancel = () => {
    setName("");
    setDescription("");
    setCategory("");
    setStatus("draft");
    setPrice("");
    setDiscountType("");
    setDiscountPercentage("");
    setTaxClass("");
    setVatAmount("");
    setSku("");
    setBarcode("");
    setQuantity("");
    setImage(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(selectedImage);
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!description.trim()) newErrors.description = "Description is required";

    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(price))) {
      newErrors.price = "Price must be a number";
    } else if (Number(price) < 0) {
      newErrors.price = "Price must be greater than or equal to 0";
    }

    if (!category) {
      newErrors.category = "Category is required";
    } else if (!categories.some((cat) => cat._id === category)) {
      newErrors.category = "Invalid category ID";
    }

    if (quantity && isNaN(Number(quantity))) {
      newErrors.quantity = "Quantity must be a number";
    }

    if (discountPercentage && isNaN(Number(discountPercentage))) {
      newErrors.discountPercentage = "Discount percentage must be a number";
    }

    if (vatAmount && isNaN(Number(vatAmount))) {
      newErrors.vatAmount = "VAT amount must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const token = getAdminToken();

    try {
      let imageUrl = "";

      // 1. Upload image if present
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        console.log("imageeeeee", image);
        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/upload/product`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // if required
            },
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        console.log("upload dataaaaaaaaaaaaaaaa", uploadData);
        if (!uploadRes.ok || !uploadData?.data?.url) {
          throw new Error("Image upload failed");
        }

        imageUrl = uploadData.data.url;
      }

      // 2. Prepare payload
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        status,
        price: parseFloat(price),
        discountType: discountType || undefined,
        discountPercentage: discountPercentage
          ? parseFloat(discountPercentage)
          : undefined,
        taxClass: taxClass || undefined,
        vatAmount: vatAmount ? parseFloat(vatAmount) : undefined,
        sku: sku || undefined,
        barcode: barcode || undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                alt: name, // you can customize or make it optional
                isMain: true, // assuming it's the main image
              },
            ]
          : [],
      };

      // 3. Submit product
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/admin`,
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
        router.push("/ecommerce/products");
      } else {
        const errorData = await res.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const apiErrors: Record<string, string> = {};
          errorData.errors.forEach((err: any) => {
            apiErrors[err.path] = err.msg;
          });
          setErrors(apiErrors);
        } else {
          alert(errorData.message || "Failed to add product");
        }
      }
    } catch (error: any) {
      console.error("Submit Error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      <h1 className="text-[#333843] text-3xl">Add Product</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer">E-commerce</span> &gt;{" "}
          <span className="text-blue-600 cursor-pointer">Products</span> &gt;{" "}
          <span className="text-gray-800 font-semibold">Add Product</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 flex items-center gap-1"
          >
            ✖ Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 bg-[#C83C92] text-white rounded-lg flex items-center gap-1 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Adding..." : "+ Add Product"}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-2/3 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              General Information
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1E437A] mb-1">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Type product name here..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border ${
                  errors.name ? "border-red-500" : "border-[#E0E2E7]"
                } p-3 rounded-lg bg-[#F9F9FC] text-black`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E437A] mb-1">
                Description
              </label>
              <textarea
                placeholder="Type product description here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full border ${
                  errors.description ? "border-red-500" : "border-[#E0E2E7]"
                } p-3 rounded-lg bg-[#F9F9FC] h-24 text-black`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">Media</h3>

            <label className="block text-sm font-semibold text-[#1E437A] mb-2">
              Photo
            </label>

            <div
              className={`border-2 border-dashed border-[#E0E2E7] bg-[#F9F9FC] p-6 rounded-lg text-center flex flex-col items-center ${
                imagePreview ? "border-solid border-[#245BA7]" : ""
              }`}
              onClick={triggerFileInput}
            >
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto mb-4 rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
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
                  <p className="text-gray-500 text-sm mb-3">
                    Drag and drop image here, or click add image
                  </p>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                id="upload-image"
                accept="image/*"
              />

              <label
                htmlFor="upload-image"
                className="cursor-pointer bg-[#DEDEFA] text-[#245BA7] px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {imagePreview ? "Change Image" : "Add Image"}
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              Pricing
            </h3>

            <div className="mb-4">
              <label className="text-sm font-semibold text-[#1E437A] mb-1 flex items-center gap-1">
                Price (₹)
              </label>

              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="Type price here..."
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full border ${
                    errors.price ? "border-red-500" : "border-[#E0E2E7]"
                  } p-3 rounded-lg bg-[#F9F9FC] text-black`}
                />
              </div>

              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-[#858D9D]"
                >
                  <option value="">Select a discount type</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="none">None</option>
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
                  className={`w-full border ${
                    errors.discountPercentage
                      ? "border-red-500"
                      : "border-[#E0E2E7]"
                  } p-3 rounded-lg bg-[#F9F9FC] text-black`}
                />
                {errors.discountPercentage && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountPercentage}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-[#1E437A] mb-1">
                  Tax Class
                </label>
                <select
                  value={taxClass}
                  onChange={(e) => setTaxClass(e.target.value)}
                  className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-[#858D9D]"
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
                  className={`w-full border ${
                    errors.vatAmount ? "border-red-500" : "border-[#E0E2E7]"
                  } p-3 rounded-lg bg-[#F9F9FC] text-black`}
                />
                {errors.vatAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vatAmount}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              Inventory
            </h3>

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
                  className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-black"
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
                  className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-black"
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
                  className={`w-full border ${
                    errors.quantity ? "border-red-500" : "border-[#E0E2E7]"
                  } p-3 rounded-lg bg-[#F9F9FC] text-black`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#333843]">
              Category
            </h3>
            <label className="text-sm font-semibold text-[#1E437A] mb-1">
              Product Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full border ${
                errors.category ? "border-red-500" : "border-[#E0E2E7]"
              } p-3 rounded-lg bg-[#F9F9FC] text-[#858D9D]`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-[#333843]">Status</h3>
              <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-lg capitalize">
                {status}
              </span>
            </div>
            <label className="text-sm font-semibold text-[#1E437A] mb-1">
              Product Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-[#E0E2E7] p-3 rounded-lg bg-[#F9F9FC] text-[#858D9D]"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
