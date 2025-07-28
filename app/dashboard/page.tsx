"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ClipboardList, ShoppingCart, Users } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { getAdminToken } from "@/utils/storage";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
  phone?: string;
}

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  shippingMethod: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount?: {
    code: string;
    amount: number;
  };
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface StatCard {
  id: number;
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface DashboardProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isOpen, setIsOpen }) => {
  const [activeTab, setActiveTab] = useState("All Time");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatCard[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ORDERS_PER_PAGE = 10;

  const tabs = ["All Time", "12 Months", "30 Days", "7 Days", "24 Hour"];

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [quote, setQuote] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch orders from your backend API
        const token = getAdminToken(); // Get auth token
        if (!token) throw new Error("Login first");
        const ordersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders?page=${currentPage}&limit=${ORDERS_PER_PAGE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders");
        }

        const responseData = await ordersResponse.json();
        console.log(responseData); //debug

        // Check if ordersData is an array or if it's nested inside a property
        const ordersData = Array.isArray(responseData)
          ? responseData
          : responseData.orders || responseData.data || [];

        // Ensure orders is always an array
        if (!Array.isArray(ordersData)) {
          throw new Error("API response format is not as expected");
        }

        // Ensure all order objects have the expected structure
        const validatedOrders = ordersData.map((order) => ({
          ...order,
          // Ensure user object exists
          user: order.user || {
            _id: order.customerInfo?.email || "guest", // using email as fallback ID
            email: order.customerInfo?.email || "unknown",
            firstName: order.customerInfo?.firstName || "Anonymous",
            lastName: order.customerInfo?.lastName || "User",
          },
          // Ensure items is an array
          items: Array.isArray(order.items) ? order.items : [],
          // Ensure other required fields have defaults
          total: order.total || 0,
          status: order.status || "pending",
        }));

        setOrders(validatedOrders);
        setTotalPages(responseData.totalPages || 1);

        // Calculate stats from orders data safely
        const totalSales = validatedOrders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        );

        // Count active orders safely
        const activeOrders = validatedOrders.filter(
          (order) =>
            order.status &&
            ["pending", "processing", "shipped"].includes(order.status)
        ).length;

        // Get unique users safely
        const uniqueUserIds = new Set();
        validatedOrders.forEach((order) => {
          if (order.user && order.user._id) {
            uniqueUserIds.add(order.user._id);
          }
        });
        const activeUsers = uniqueUserIds.size;

        setStats([
          {
            id: 1,
            title: "Total Sales",
            value: `$${totalSales.toLocaleString()}`,
            icon: <ShoppingCart className="text-green-500 w-6 h-6" />,
            bgColor: "bg-green-100",
          },
          {
            id: 2,
            title: "Active Orders",
            value: activeOrders.toString(),
            icon: <ClipboardList className="text-red-500 w-6 h-6" />,
            bgColor: "bg-red-100",
          },
          {
            id: 3,
            title: "Active Users",
            value: activeUsers.toString(),
            icon: <Users className="text-blue-500 w-6 h-6" />,
            bgColor: "bg-blue-100",
          },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  //Motivational Email
  const handleSendMotivation = async () => {
    try {
      setSending(true);
      const token = getAdminToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/emails/motivation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subject, quote }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setSendSuccess("Motivational email sent!");
      setSubject("");
      setQuote("");
      setModalOpen(false);
    } catch (err: any) {
      setSendSuccess(err.message);
    } finally {
      setSending(false);
    }
  };

  //
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} min ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return { bg: "bg-orange-100", text: "text-orange-600" };
      case "shipped":
        return { bg: "bg-blue-100", text: "text-blue-600" };
      case "delivered":
        return { bg: "bg-green-100", text: "text-green-600" };
      case "cancelled":
      case "refunded":
        return { bg: "bg-red-100", text: "text-red-600" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="p-6">
      {/* Modal for Motivational Email */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-bold mb-4">
            Send Motivational Email
          </Dialog.Title>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Subject"
              className="w-full border px-3 py-2 rounded-md"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              placeholder="Quote / Message"
              rows={4}
              className="w-full border px-3 py-2 rounded-md"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
            {sendSuccess && (
              <p className="text-sm text-green-600">{sendSuccess}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMotivation}
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      <div className="flex flex-col h-screen">
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 bg-gray-100 rounded-xl mt-10 ml-68">
            {/* Filter Bar with Motivational Email Button */}
            <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gray-100 w-[105%] -ml-5">
              <div className="flex items-center space-x-5 bg-white text-gray-500 text-sm border border-[#E0E2E7] w-fit px-4 py-2 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${
                      activeTab === tab
                        ? "bg-blue-100 text-blue-700"
                        : "hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Button next to tabs */}
              <button
                onClick={() => setModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow ml-[-60px]"
              >
                ✉️ Motivational Email
              </button>
            </div>

            {/* Stats Cards */}
            <div className="flex space-x-4 -mb-10">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-xl p-6 w-full flex flex-col space-y-2 border"
                >
                  <div
                    className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}
                  >
                    {stat.icon}
                  </div>
                  <h3 className="text-[#667085] text-sm">{stat.title}</h3>
                  <p className="text-2xl text-[#333843] font-semibold">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="mt-15 p-6 bg-white rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#333843]">
                  Recent Orders
                </h1>

                <div className="ml-auto">
                  <button className="flex items-center gap-x-2 p-1 rounded-lg border-2 h-9">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 20 15"
                      fill="none"
                    >
                      <path
                        d="M10.8333 6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5C12.1269 7.5 12.5 7.1269 12.5 6.66667V5.83333H16.6667C17.1269 5.83333 17.5 5.46024 17.5 5C17.5 4.53976 17.1269 4.16667 16.6667 4.16667H12.5V3.33333C12.5 2.8731 12.1269 2.5 11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667Z"
                        fill="#667085"
                      />
                      <path
                        d="M2.5 10C2.5 9.53976 2.8731 9.16667 3.33333 9.16667H4.58333C4.81345 9.16667 5 9.35321 5 9.58333V10.4167C5 10.6468 4.81345 10.8333 4.58333 10.8333H3.33333C2.8731 10.8333 2.5 10.4602 2.5 10Z"
                        fill="#667085"
                      />
                      <path
                        d="M7.5 7.5C7.03976 7.5 6.66667 7.8731 6.66667 8.33333V11.6667C6.66667 12.1269 7.03976 12.5 7.5 12.5C7.96024 12.5 8.33333 12.1269 8.33333 11.6667V10.8333H16.6667C17.1269 10.8333 17.5 10.4602 17.5 10C17.5 9.53976 17.1269 9.16667 16.6667 9.16667H8.33333V8.33333C8.33333 7.8731 7.96024 7.5 7.5 7.5Z"
                        fill="#667085"
                      />
                      <path
                        d="M2.5 5C2.5 4.53976 2.8731 4.16667 3.33333 4.16667H8.75C8.98012 4.16667 9.16667 4.35321 9.16667 4.58333V5.41667C9.16667 5.64679 8.98012 5.83333 8.75 5.83333H3.33333C2.8731 5.83333 2.5 5.46024 2.5 5Z"
                        fill="#667085"
                      />
                      <path
                        d="M12.5 13.3333C12.5 12.8731 12.8731 12.5 13.3333 12.5C13.7936 12.5 14.1667 12.8731 14.1667 13.3333V14.1667H16.6667C17.1269 14.1667 17.5 14.5398 17.5 15C17.5 15.4602 17.1269 15.8333 16.6667 15.8333H14.1667V16.6667C14.1667 16.6667 14.1667 17.5 13.3333 17.5C12.8731 17.5 12.5 17.1269 12.5 16.6667V13.3333Z"
                        fill="#667085"
                      />
                      <path
                        d="M2.5 15C2.5 14.5398 2.8731 14.1667 3.33333 14.1667H10.4167C10.6468 14.1667 10.8333 14.3532 10.8333 14.5833V15.4167C10.8333 15.6468 10.6468 15.8333 10.4167 15.8333H3.33333C2.8731 15.8333 2.5 15.4602 2.5 15Z"
                        fill="#667085"
                      />
                    </svg>
                    <h2 className="text-[#333843] text-lg">Filters</h2>
                  </button>
                </div>
              </div>

              {/* Table Container - Fixed height with proper scrolling */}
              <div className="relative h-96">
                {/* Fixed header */}
                <div className="sticky top-0 z-10 w-full">
                  <table className="w-full border-collapse">
                    <colgroup>
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <thead className="bg-gray-50 h-12 text-gray-500 text-left text-sm uppercase">
                      <tr>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3 flex items-center">
                          <span className="mr-1">Date</span>
                          <ChevronDown className="w-4 h-4" />
                        </th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3 flex items-center">
                          <span className="mr-1">Total</span>
                          <ChevronDown className="w-4 h-4" />
                        </th>
                        <th className="px-6 py-3">Payment</th>
                        <th className="px-6 py-3 flex items-center">
                          <span className="mr-1">Status</span>
                          <ChevronDown className="w-4 h-4" />
                        </th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable body with full height */}
                <div className="overflow-y-auto h-full max-h-[calc(100%-48px)]">
                  <table className="w-full border-collapse">
                    <colgroup>
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {orders.length > 0 ? (
                        orders.map((order) => {
                          // Safeguard: Make sure items array exists and has elements
                          const items = Array.isArray(order.items)
                            ? order.items
                            : [];
                          const mainItem = items.length > 0 ? items[0] : null;
                          const additionalItems =
                            items.length > 1 ? items.length - 1 : 0;
                          const statusColors = getStatusColor(order.status);

                          return (
                            <tr
                              key={order._id}
                              className="h-16 hover:bg-gray-50 transition"
                            >
                              <td className="px-6 py-4 font-medium">
                                {order.orderNumber || "N/A"}
                              </td>
                              <td className="px-6 py-4 flex items-center space-x-3">
                                <Image
                                  src={
                                    mainItem?.image ||
                                    "/placeholder-product.png"
                                  }
                                  alt={mainItem?.name || "Product"}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-lg"
                                />
                                <div>
                                  <span className="block">
                                    {mainItem?.name || "Unnamed Product"}
                                  </span>
                                  {additionalItems > 0 && (
                                    <span className="text-gray-400 text-sm">
                                      +{additionalItems} other product
                                      {additionalItems > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-6 py-4">
                                <span className="block font-medium">
                                  {order.user?.firstName || "Anonymous"}{" "}
                                  {order.user?.lastName || ""}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {order.user?.email || "No email"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                ${(order.total || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                {order.paymentMethod || "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1.5 text-sm font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}
                                >
                                  {order.status
                                    ? order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)
                                    : "Unknown"}
                                </span>
                              </td>
                              <td className="px-6 py-4 flex items-center space-x-3 text-gray-500">
                                <button className="hover:text-gray-700">
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
                                      d="M9.99996 4.16663C15.1083 4.16663 17.5256 7.5916 18.3765 9.19278C18.6475 9.70262 18.6475 10.2973 18.3765 10.8071C17.5256 12.4083 15.1083 15.8333 9.99996 15.8333C4.89164 15.8333 2.47436 12.4083 1.62339 10.8071C1.35242 10.2973 1.35242 9.70262 1.62339 9.19277C2.47436 7.59159 4.89164 4.16663 9.99996 4.16663ZM5.69692 7.0647C4.31336 7.98141 3.50548 9.20281 3.09512 9.97494C3.09054 9.98357 3.08865 9.98955 3.08783 9.99283C3.08699 9.99617 3.08683 9.99996 3.08683 9.99996C3.08683 9.99996 3.08699 10.0037 3.08783 10.0071C3.08865 10.0104 3.09054 10.0164 3.09512 10.025C3.50548 10.7971 4.31336 12.0185 5.69692 12.9352C5.1257 12.0994 4.79163 11.0887 4.79163 9.99996C4.79163 8.91121 5.1257 7.90049 5.69692 7.0647ZM14.303 12.9352C15.6866 12.0185 16.4944 10.7971 16.9048 10.025C16.9094 10.0164 16.9113 10.0104 16.9121 10.0071C16.9126 10.0049 16.913 10.0019 16.913 10.0019L16.9131 9.99996L16.9128 9.99629L16.9121 9.99283C16.9113 9.98955 16.9094 9.98357 16.9048 9.97494C16.4944 9.20282 15.6866 7.98142 14.303 7.06471C14.8742 7.9005 15.2083 8.91122 15.2083 9.99996C15.2083 11.0887 14.8742 12.0994 14.303 12.9352ZM6.4583 9.99996C6.4583 8.04395 8.04396 6.45829 9.99997 6.45829C11.956 6.45829 13.5416 8.04395 13.5416 9.99996C13.5416 11.956 11.956 13.5416 9.99997 13.5416C8.04396 13.5416 6.4583 11.956 6.4583 9.99996Z"
                                      fill="#456696"
                                    />
                                  </svg>
                                </button>
                                <button className="hover:text-gray-700">
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
                                      d="M17.3047 6.82016C18.281 5.84385 18.281 4.26093 17.3047 3.28462L16.7155 2.69537C15.7391 1.71906 14.1562 1.71906 13.1799 2.69537L3.69097 12.1843C3.34624 12.529 3.10982 12.967 3.01082 13.4444L2.34111 16.6738C2.21932 17.261 2.73906 17.7807 3.32629 17.6589L6.55565 16.9892C7.03302 16.8902 7.47103 16.6538 7.81577 16.3091L17.3047 6.82016ZM16.1262 4.46313L15.5369 3.87388C15.2115 3.54844 14.6839 3.54844 14.3584 3.87388L13.4745 4.75779L15.2423 6.52556L16.1262 5.64165C16.4516 5.31621 16.4516 4.78857 16.1262 4.46313ZM14.0638 7.70407L12.296 5.9363L4.86948 13.3628C4.75457 13.4777 4.67577 13.6237 4.64277 13.7829L4.23082 15.7692L6.21721 15.3573C6.37634 15.3243 6.52234 15.2455 6.63726 15.1306L14.0638 7.70407Z"
                                      fill="#456696"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
