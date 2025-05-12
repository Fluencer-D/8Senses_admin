"use client";
import React, { useState, useEffect } from "react";

interface OrderData {
  id: string;
  product: string;
  amountPaid: number;
  refundAmount: number;
}

const IssueRefundPage: React.FC<{ orderId?: string }> = ({ orderId = "1275" }) => {
  const [orderData, setOrderData] = useState<OrderData>({
    id: "#1275",
    product: "Fine Motor Beads Set",
    amountPaid: 79.5,
    refundAmount: 79.5
  });
  const [loading, setLoading] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(orderData.amountPaid);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error(`Error fetching order: ${response.statusText}`);
        }

        const data: OrderData = await response.json();
        setOrderData(data);
        setRefundAmount(data.amountPaid);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    };

    // Uncomment to fetch real data
    // fetchOrderDetails();
  }, [orderId]);

  const handleConfirmRefund = async () => {
    if (!refundReason) {
      alert("Please select a reason for refund");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: refundAmount,
          reason: refundReason
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process refund");
      }

      alert("Refund processed successfully");
      // Redirect to order details page if needed
      // window.location.href = `/orders/${orderId}`;
    } catch (err) {
      console.error("Error processing refund:", err);

      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Redirect back to order details page
    console.log("Cancel clicked");
  };

  const refundReasons = [
    "Product damaged",
    "Wrong item received",
    "Item not as described",
    "Customer changed mind",
    "Shipping took too long",
    "Other"
  ];

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[#333843] text-3xl">Orders</h1>
        </div>
        <div className="text-gray-500 text-sm mt-1 flex items-center">
          <span className="text-[#245BA7] font-semibold cursor-pointer">E-commerce</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#245BA7] font-semibold cursor-pointer">Orders</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#245BA7] font-semibold cursor-pointer">Order Details</span>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800">Issue Refund</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="orderId" className="block text-[#1E437A] font-medium mb-2">
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#858D9D] bg-[#F9F9FC]"
              value={orderData.id}
              disabled
            />
          </div>

          <div>
            <label htmlFor="product" className="block text-[#1E437A] font-medium mb-2">
              Product
            </label>
            <input
              type="text"
              id="product"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#858D9D] bg-[#F9F9FC]"
              value={orderData.product}
              disabled
            />
          </div>

          <div>
            <label htmlFor="amountPaid" className="block text-[#1E437A] font-medium mb-2">
              Amount Paid
            </label>
            <input
              type="text"
              id="amountPaid"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#858D9D] bg-[#F9F9FC]"
              value={`$${orderData.amountPaid.toFixed(2)}`}
              disabled
            />
          </div>

          <div>
            <label htmlFor="refundAmount" className="block text-[#1E437A] font-medium mb-2">
              Refund Amount
            </label>
            <input
              type="text"
              id="refundAmount"
              className="w-full px-4 py-3 border border-gray-300 bg-[#F9F9FC] rounded-lg text-[#858D9D]"
              value={`$${refundAmount.toFixed(2)}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setRefundAmount(parseFloat(value) || 0);
              }}
            />
          </div>

          <div>
            <label htmlFor="refundReason" className="block text-[#1E437A] font-medium mb-2">
              Reason of Refund
            </label>
            <div className="relative">
              <select
                id="refundReason"
                className="w-full px-4 py-3 border border-gray-300 bg-[#F9F9FC] rounded-lg text-[#858D9D] appearance-none"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              >
                <option value="">Select reason of refund</option>
                {refundReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleConfirmRefund}
              disabled={loading}
              className="bg-[#C83C92] text-white px-5 py-3 rounded-lg hover:bg-pink-700 disabled:bg-pink-400"
            >
              {loading ? "Processing..." : "Confirm Refund"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-[#F04438] text-white px-5 py-3 rounded-lg hover:bg-red-600 disabled:bg-red-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueRefundPage;
