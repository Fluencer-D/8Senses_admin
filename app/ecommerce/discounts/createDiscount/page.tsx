"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface DiscountData {
  code: string;
  percentage: string;
  startDate: string;
  expiryDate: string;
  usageLimit: string;
}

const DiscountForm: React.FC = () => {
  const router = useRouter();
  const [discountData, setDiscountData] = useState<DiscountData>({
    code: "",
    percentage: "",
    startDate: "",
    expiryDate: "",
    usageLimit: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDiscountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const payload = {
      code: discountData.code,
      discountValue: parseFloat(discountData.percentage),
      startDate: discountData.startDate,
      endDate: discountData.expiryDate,
      usageLimit: discountData.usageLimit === "unlimited"
        ? null
        : parseInt(discountData.usageLimit),
    };
  
    try {
      const token = localStorage.getItem("adminToken");
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <-- make sure this is set
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errData = await res.json();
        console.error("Create discount failed:", errData);
        throw new Error("Failed to create discount");
      }
  
      router.push("/ecommerce/discounts");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to create discount");
    }
  };
  

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-[#333843]">Discounts</h1>
        {/* Export Button */}
        <button className="flex items-center gap-2 bg-[#C83C92] text-white px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="2 2 20 20"
              fill="none"
            >
              <g clipPath="url(#clip0_786_597)">
                <path
                  d="M15.7071 7.20706C15.3166 7.59758 14.6834 7.59758 14.2929 7.20706L13 5.91417V15.5C13 16.0522 12.5523 16.5 12 16.5C11.4477 16.5 11 16.0522 11 15.5V5.91417L9.70711 7.20706C9.31658 7.59758 8.68342 7.59758 8.29289 7.20706C7.90237 6.81654 7.90237 6.18337 8.29289 5.79285L11.6464 2.43929C11.8417 2.24403 12.1583 2.24403 12.3536 2.43929L15.7071 5.79285C16.0976 6.18337 16.0976 6.81654 15.7071 7.20706Z"
                  fill="white"
                />
                <path
                  d="M18 8.49996C20.2091 8.49996 22 10.2908 22 12.5V17.5C22 19.7091 20.2091 21.5 18 21.5H6C3.79086 21.5 2 19.7091 2 17.5V12.5C2 10.2908 3.79086 8.49996 6 8.49996H8C8.55229 8.49996 9 8.94767 9 9.49996C9 10.0522 8.55229 10.5 8 10.5H6C4.89543 10.5 4 11.3954 4 12.5V17.5C4 18.6045 4.89543 19.5 6 19.5H18C19.1046 19.5 20 18.6045 20 17.5V12.5C20 11.3954 19.1046 10.5 18 10.5H16C15.4477 10.5 15 10.0522 15 9.49996C15 8.94767 15.4477 8.49996 16 8.49996H18Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_786_597">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Export
          </button>
      </div>

      <div className="flex items-center text-sm mb-6">
        <Link href="/e-commerce" className="text-[#245BA7] mr-2">
          E-commerce
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href="/e-commerce/discounts" className="text-[#245BA7] mr-2">
          Discounts
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-[#667085]">New Discount</span>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="code" className="block mb-2 font-medium text-[#1E437A]">
                Discount Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                className="w-full p-3 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md"
                value={discountData.code}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="percentage" className="block mb-2 font-medium text-[#1E437A]">
                Discount Percentage
              </label>
              <input
                type="text"
                id="percentage"
                name="percentage"
                className="w-full p-3 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md"
                value={discountData.percentage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="startDate" className="block mb-2 font-medium text-[#1E437A]">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="w-full p-3 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md"
                value={discountData.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="expiryDate" className="block mb-2 font-medium text-[#1E437A]">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                className="w-full p-3 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md"
                value={discountData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="usageLimit" className="block mb-2 font-medium text-[#1E437A]">
              Usage Limit
            </label>
            <div className="relative">
              <select
                id="usageLimit"
                name="usageLimit"
                className="w-full p-3 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md appearance-none"
                value={discountData.usageLimit}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select usage limit
                </option>
                <option value="1">1 use per customer</option>
                <option value="999999">Unlimited</option>
                <option value="5">5 uses</option>
                <option value="10">10 uses</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <ChevronDownIcon size={20} />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-[#C83C92] text-white font-medium rounded-md hover:bg-pink-700"
            >
              Save Discount
            </button>
            <button
              type="button"
              onClick={() => router.push("/ecommerce/discounts")}
              className="px-6 py-3 bg-[#F04438] text-white font-medium rounded-md hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountForm;
