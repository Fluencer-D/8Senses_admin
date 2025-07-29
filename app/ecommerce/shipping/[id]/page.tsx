"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminToken } from "@/utils/storage";

interface OrderDetails {
  _id: string;
  orderNumber: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  status: string; // Backend status string
  trackingNumber?: string;
  shippingDate?: string; // ISO date string
  estimatedDelivery?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

const UpdateShippingStatus = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [shippingStatus, setShippingStatus] = useState<string>(""); // Corresponds to backend enum
  const [shipmentDate, setShipmentDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const token = getAdminToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch order details");
        }

        const result = await response.json();
        const order = result.data;
        setOrderDetails(order);
        setTrackingNumber(order.trackingNumber || "");
        setShippingStatus(order.status || "pending"); // Initialize with current status
        setShipmentDate(
          order.shippingDate
            ? new Date(order.shippingDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
      } catch (err: any) {
        console.error("Error fetching order details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleSaveChanges = async () => {
    if (!orderDetails) return;

    setIsSubmitting(true);
    try {
      const token = getAdminToken();
      const payload: {
        status: string;
        trackingNumber?: string;
        shippingDate?: string;
      } = {
        status: shippingStatus,
      };

      // Only include trackingNumber and shippingDate if status is 'shipped'
      if (shippingStatus === "shipped") {
        if (!trackingNumber) {
          alert("Tracking number is required for 'Shipped' status.");
          setIsSubmitting(false);
          return;
        }
        payload.trackingNumber = trackingNumber;
        payload.shippingDate = shipmentDate;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update order status");
      }

      const result = await response.json();
      alert("Order status updated successfully!");
      console.log("Update result:", result);
      router.push("/ecommerce/shipping"); // Navigate back to the shipping page
    } catch (err: any) {
      console.error("Error saving changes:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/ecommerce/shipping"); // Navigate back without saving changes
  };

  if (loading)
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C83C92]"></div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  if (!orderDetails)
    return (
      <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">Order details not found.</p>
        </div>
      </div>
    );

  const customerFullName = `${orderDetails.customerInfo?.firstName || ""} ${
    orderDetails.customerInfo?.lastName || ""
  }`.trim();
  const fullAddress = `${orderDetails.shippingAddress.address1}, ${
    orderDetails.shippingAddress.address2
      ? orderDetails.shippingAddress.address2 + ", "
      : ""
  }${orderDetails.shippingAddress.city}, ${
    orderDetails.shippingAddress.state
  }, ${orderDetails.shippingAddress.postalCode}, ${
    orderDetails.shippingAddress.country
  }`;

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#333843] text-3xl">Shipping</h1>
          <div className="text-gray-500 text-sm mt-1">
            <span className="text-[#245BA7] cursor-pointer">E-commerce</span>{" "}
            &gt; <span className="text-[#245BA7] cursor-pointer">Shipping</span>{" "}
            &gt; <span className="text-gray-800">Orders</span>
          </div>
        </div>
        {/* Export Button (kept for consistency, though not directly related to this page's function) */}
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
      {/* Order & Customer Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-medium text-[#333843] mb-6">
          Order & Customer Details
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-[#1E437A] mb-1">Order ID</p>
            <p className="text-[#1E437A] text-lg font-semibold">
              #{orderDetails.orderNumber}
            </p>
          </div>
          <div>
            <p className="text-[#1E437A] mb-1">Customer</p>
            <p className="text-lg font-medium text-[#1E437A]">
              {customerFullName}
            </p>
          </div>
          <div>
            <p className="text-[#1E437A] mb-1">Current Shipping Status</p>
            <p className="text-lg font-medium text-[#1E437A]">
              {orderDetails.status}
            </p>
          </div>
          <div>
            <p className="text-[#1E437A] mb-1">Address</p>
            <p className="text-lg font-medium text-[#1E437A]">{fullAddress}</p>
          </div>
        </div>
      </div>
      {/* Update Status Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-[#333843] mb-6">
          Update Status
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveChanges();
          }}
        >
          {/* Tracking Number */}
          <div className="mb-6">
            <label
              htmlFor="trackingNumber"
              className="block mb-2 font-medium text-[#1E437A]"
            >
              Tracking Number
            </label>
            <input
              type="text"
              id="trackingNumber"
              placeholder="Required only when updating status to shipped"
              className="w-full p-3 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={
                isSubmitting ||
                shippingStatus === "delivered" ||
                shippingStatus === "cancelled" ||
                shippingStatus === "refunded"
              }
            />
          </div>
          {/* Update Shipping Status */}
          <div className="mb-6">
            <label
              htmlFor="shippingStatus"
              className="block mb-2 font-medium text-[#1E437A]"
            >
              Update Shipping Status
            </label>
            <select
              id="shippingStatus"
              className="w-full p-3 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md"
              value={shippingStatus}
              onChange={(e) => setShippingStatus(e.target.value)}
              disabled={
                isSubmitting ||
                orderDetails.status === "delivered" ||
                orderDetails.status === "cancelled" ||
                orderDetails.status === "refunded"
              }
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          {/* Date of Shipment */}
          <div className="mb-6">
            <label
              htmlFor="shipmentDate"
              className="block mb-2 font-medium text-[#1E437A]"
            >
              Date of Shipment
            </label>
            <div className="relative">
              <input
                type="date"
                id="shipmentDate"
                className="w-full p-3 pr-10 border bg-[#F9F9FC] border-[#E0E2E7] text-[#858D9D] rounded-md"
                value={shipmentDate}
                onChange={(e) => setShipmentDate(e.target.value)}
                disabled={isSubmitting || shippingStatus !== "shipped"} // Only enable if status is 'shipped'
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#858D9D]"
              >
                <path
                  d="M6.5384 2C6.68692 2 6.82936 2.059 6.93438 2.16402C7.0394 2.26904 7.0984 2.41148 7.0984 2.56V3.6072H13.112V2.5672C13.112 2.41868 13.171 2.27624 13.276 2.17122C13.381 2.0662 13.5235 2.0072 13.672 2.0072C13.8205 2.0072 13.963 2.0662 14.068 2.17122C14.173 2.27624 14.232 2.41868 14.232 2.5672V3.6072H16.4C16.8242 3.6072 17.2311 3.77566 17.5311 4.07555C17.8311 4.37543 17.9998 4.78219 18 5.2064V16.4008C17.9998 16.825 17.8311 17.2318 17.5311 17.5317C17.2311 17.8315 16.8242 18 16.4 18H3.6C3.17579 18 2.76895 17.8315 2.46891 17.5317C2.16888 17.2318 2.00021 16.825 2 16.4008V5.2064C2.00021 4.78219 2.16888 4.37543 2.46891 4.07555C2.76895 3.77566 3.17579 3.6072 3.6 3.6072H5.9784V2.5592C5.97861 2.41082 6.03771 2.26858 6.1427 2.16374C6.2477 2.05889 6.39002 2 6.5384 2ZM3.12 8.1936V16.4008C3.12 16.4638 3.13242 16.5263 3.15654 16.5845C3.18066 16.6427 3.21602 16.6956 3.26059 16.7402C3.30516 16.7848 3.35808 16.8201 3.41631 16.8443C3.47455 16.8684 3.53697 16.8808 3.6 16.8808H16.4C16.463 16.8808 16.5255 16.8684 16.5837 16.8443C16.6419 16.8201 16.6948 16.7848 16.7394 16.7402C16.784 16.6956 16.8193 16.6427 16.8435 16.5845C16.8676 16.5263 16.88 16.4638 16.88 16.4008V8.2048L3.12 8.1936ZM7.3336 13.6952V15.028H6V13.6952H7.3336ZM10.6664 13.6952V15.028H9.3336V13.6952H10.6664ZM14 13.6952V15.028H12.6664V13.6952H14ZM7.3336 10.5136V11.8464H6V10.5136H7.3336ZM10.6664 10.5136V11.8464H9.3336V10.5136H10.6664ZM14 10.5136V11.8464H12.6664V10.5136H14ZM5.9784 4.7264H3.6C3.53697 4.7264 3.47455 4.73882 3.41631 4.76294C3.35808 4.78706 3.30516 4.82242 3.26059 4.86699C3.21602 4.91156 3.18066 4.96448 3.15654 5.02271C3.13242 5.08095 3.12 5.14337 3.12 5.2064V7.0744L16.88 7.0856V5.2064C16.88 5.14337 16.8676 5.08095 16.8435 5.02271C16.8193 4.96448 16.784 4.91156 16.7394 4.86699C16.6948 4.82242 16.6419 4.78706 16.5837 4.76294C16.5255 4.73882 16.463 4.7264 16.4 4.7264H14.232V5.4696C14.232 5.61812 14.173 5.76056 14.068 5.86558C13.963 5.9706 13.8205 6.0296 13.672 6.0296C13.5235 6.0296 13.381 5.9706 13.276 5.86558C13.171 5.76056 13.112 5.61812 13.112 5.4696V4.7264H7.0984V5.4624C7.0984 5.61092 7.0394 5.75336 6.93438 5.85838C6.82936 5.9634 6.68692 6.0224 6.5384 6.0224C6.38988 6.0224 6.24744 5.9634 6.14242 5.85838C6.0374 5.75336 5.9784 5.61092 5.9784 5.4624V4.7264Z"
                  fill="#858D9D"
                />
              </svg>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-[#C83C92] text-white font-medium rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                isSubmitting ||
                orderDetails.status === "delivered" ||
                orderDetails.status === "cancelled" ||
                orderDetails.status === "refunded"
              }
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-[#F04438] text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateShippingStatus;
