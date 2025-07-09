"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface MemberData {
  id: string;
  memberName: string;
  email: string;
  phone: string;
  tier: string;
  plan: string;
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  nextRenewalDate: string;
  paymentHistory: {
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId: string;
    date: string;
  }[];
}

const MemberDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/members/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setMemberData(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch member details:", err);
        setError("Failed to fetch member details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberDetails();
    }
  }, [id]);

  const handleSendRenewalReminder = async () => {
    alert("Renewal reminder sent successfully (mocked)");
  };

  const handleSuspendSubscription = async () => {
    if (
      confirm("Are you sure you want to suspend this member's subscription?")
    ) {
      alert("Subscription suspended successfully (mocked)");
      router.push("/subscription/members");
    }
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto hide-scrollbar">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[#1E437A] text-3xl font-medium">Members</h1>
          <button
            onClick={() => router.push("/export")}
            className="flex items-center gap-2 bg-[#FFF1F8] text-[#C83C92] px-4 py-2 rounded-lg font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 17V3" />
              <path d="m6 11 6 6 6-6" />
              <path d="M19 21H5" />
            </svg>
            Export
          </button>
        </div>
        <div className="text-gray-500 text-sm mt-1 flex items-center">
          <span className="text-[#1E437A] cursor-pointer">Subscription</span>
          <span className="mx-2">&gt;</span>
          <span
            className="text-[#1E437A] cursor-pointer"
            onClick={() => router.push("/subscription/members")}
          >
            Members
          </span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#667085]">Member Details</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-[#333843] mb-6">
          User Information
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : memberData ? (
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 mb-1">Name</p>
              <p className="text-lg font-medium text-[#1E437A]">
                {memberData.memberName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">Email</p>
                <p className="text-lg font-medium text-[#1E437A]">
                  {memberData.email}
                </p>
              </div>

              <div>
                <p className="text-gray-600 mb-1">Phone</p>
                <p className="text-lg font-medium text-[#1E437A]">
                  {memberData.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">Current Tier</p>
                <p className="text-lg font-medium text-[#1E437A]">
                  {memberData.tier}
                </p>
              </div>

              <div>
                <p className="text-gray-600 mb-1">Status</p>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      memberData.status === "Active"
                        ? "bg-[#E7F4EE] text-[#0D894F]"
                        : "bg-[#FEEDEC] text-[#F04438]"
                    }`}
                  >
                    {memberData.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-600 mb-1">Next Renewal Date</p>
              <p className="text-lg font-medium text-[#1E437A]">
                {new Date(memberData.nextRenewalDate).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-md font-semibold text-[#333843] mb-2">
                Payment History
              </h3>
              {memberData.paymentHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No payments found.</p>
              ) : (
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  {memberData.paymentHistory.map((payment, i) => (
                    <li key={i}>
                      {new Date(payment.date).toLocaleDateString()} – $
                      {payment.amount} ({payment.status})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                className="bg-[#C83C92] text-white px-5 py-3 rounded-lg hover:bg-[#C83C92] transition-colors"
                onClick={handleSendRenewalReminder}
              >
                Send Renewal Reminder
              </button>
              <button
                className="bg-[#F04438] text-white px-5 py-3 rounded-lg hover:bg-[#E42F22] transition-colors"
                onClick={handleSuspendSubscription}
              >
                Suspend Subscription
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MemberDetailsPage;
