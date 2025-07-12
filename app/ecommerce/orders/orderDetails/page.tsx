"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

// Loading component for Suspense fallback
function OrderDetailsLoading() {
  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
      <div className="mb-6">
        <h1 className="text-[#333843] text-3xl">Orders</h1>
        <div className="text-gray-500 text-sm mt-1 flex items-center">
          <span className="text-[#1E437A] cursor-pointer">E-commerce</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#1E437A] cursor-pointer">Orders</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#667085]">Order Details</span>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-[#333843] mb-6">
          Order Details
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Move your existing component code here
function OrderDetailsContent() {
  interface Product {
    name: string;
    quantity: number;
    price: number;
  }

  interface Address {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  }

  interface OrderData {
    _id: string;
    customer: string;
    address: Address;
    products: Product[];
    paymentStatus: string;
    shippingStatus: string;
  }

  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Error fetching order");

        const data = await res.json();
        console.log("data", data); //debug
        const order = data.data;
        console.log("orders", order); //debug

        const formatted: OrderData = {
          _id: order._id,
          customer:
            `${order.customerInfo?.firstName || ""} ${
              order.customerInfo?.lastName || ""
            }`.trim() || "N/A",
          address: order.shippingAddress,
          products: Array.isArray(order.items)
            ? order.items.map((item: any) => ({
                name: item.name || "Unnamed",
                quantity: item.quantity || 1,
                price: item.price || 0,
              }))
            : [],
          paymentStatus: order.paymentStatus || "Unknown",
          shippingStatus:
            order.status?.charAt(0).toUpperCase() + order.status?.slice(1) ||
            "Not Shipped",
        };

        setOrderData(formatted);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleUpdateShipping = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "processing" }),
        }
      );

      if (!res.ok) throw new Error("Failed to update shipping status");

      setOrderData((prev) =>
        prev ? { ...prev, shippingStatus: "Shipped" } : prev
      );
      alert("Shipping status updated successfully");
    } catch (err) {
      console.error("Error updating shipping status:", err);
      alert(`Error: ${(err as Error).message}`);
    }
  };

  const handleProcessRefund = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to process refund");

      router.push("/ecommerce/orders/issueRefund");
      setOrderData((prev) =>
        prev ? { ...prev, paymentStatus: "Refunded" } : prev
      );
      alert("Refund processed successfully");
    } catch (err) {
      console.error("Error processing refund:", err);
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[#333843] text-3xl">Orders</h1>
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
        <div className="text-gray-500 text-sm mt-1 flex items-center">
          <span className="text-[#1E437A] cursor-pointer">E-commerce</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#1E437A] cursor-pointer">Orders</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#667085]">Order Details</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-[#333843] mb-6">
          Order Details
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
          </div>
        ) : error && !orderData ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : (
          orderData && (
            <div className="space-y-6">
              <div>
                <p className="text-[#1E437A] mb-1">Order ID</p>
                <p className="text-[#1E437A] text-lg font-semibold">
                  {orderData._id}
                </p>
              </div>

              <div>
                <p className="text-gray-600 mb-1">Customer</p>
                <p className="text-lg font-medium text-[#1E437A]">
                  {orderData.customer}
                </p>
              </div>

              <div>
                <p className="text-[#1E437A] mb-1">Address</p>
                <p className="text-lg font-medium text-[#1E437A]">
                  {`${orderData.address.firstName} ${
                    orderData.address.lastName
                  }, ${orderData.address.address1}, ${
                    orderData.address.address2
                      ? orderData.address.address2 + ", "
                      : ""
                  }${orderData.address.city}, ${orderData.address.state} ${
                    orderData.address.postalCode
                  }, ${orderData.address.country} (${orderData.address.phone})`}
                </p>
              </div>

              <div>
                <p className="text-[#1E437A] mb-1">Products Ordered</p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  {orderData.products.map((product, index) => (
                    <li key={index} className="text-[#1E437A]">
                      {product.name} (Qty: {product.quantity}) - $
                      {product.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-16">
                <div>
                  <p className="text-[#1E437A] mb-1">Payment Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      orderData.paymentStatus.toLowerCase() === "paid"
                        ? "bg-[#E7F4EE] text-[#0D894F]"
                        : "bg-[#FEEDEC] text-[#F04438]"
                    }`}
                  >
                    {orderData.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[#1E437A] mb-1">Shipping Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      orderData.shippingStatus.toLowerCase() === "shipped"
                        ? "bg-[#E7F4EE] text-[#0D894F]"
                        : "bg-[#FEEDEC] text-[#F04438]"
                    }`}
                  >
                    {orderData.shippingStatus}
                  </span>
                </div>
              </div>

              {/* <div className="flex gap-4 mt-4">
                <button
                  className="bg-[#C83C92] text-white px-5 py-3 rounded-lg disabled:bg-gray-400"
                  onClick={handleUpdateShipping}
                  disabled={orderData.shippingStatus === "Shipped"}
                >
                  Update Shipping Status
                </button>
                <button
                  className="bg-[#F04438] text-white px-5 py-3 rounded-lg disabled:bg-gray-400"
                  onClick={handleProcessRefund}
                  disabled={orderData.paymentStatus === "Refunded"}
                >
                  Process Refund
                </button>
              </div> */}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<OrderDetailsLoading />}>
      <OrderDetailsContent />
    </Suspense>
  );
}
