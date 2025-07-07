"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";

// Define type for member object
interface Member {
  id: string;
  memberName: string;
  email: string;
  tier: string;
  status: string;
  renewalDate: string;
}

const MembersTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/members`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setMembersData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [hasMounted]);

  if (!hasMounted) return null;

  // Filter based on search input
  const filteredMembers = membersData.filter(
    (item) =>
      item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(item.renewalDate).toLocaleDateString().includes(searchTerm)
  );

  // Status badge component
  const getStatusBadge = (status: string) => {
    let bgColor = "";
    let textColor = "";

    switch (status) {
      case "Active":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "Expired":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "Pending Renewal":
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
    }

    return (
      <span
        className={`${bgColor} ${textColor} text-sm px-3 py-1 rounded-full`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
      {/* Header and search input */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-[#333843] font-medium text-2xl leading-8 tracking-[0.12px]">
            Members
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            <span className="text-[#245BA7] font-medium">Subscription</span> →{" "}
            <span className="text-[#667085]">Members</span>
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search member..."
            className="pl-10 pr-4 py-2 border bg-white text-[#858D9D] border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.7844 16.1991C11.646 18.6416 7.10629 18.4205 4.22156 15.5358C1.09737 12.4116 1.09737 7.34625 4.22156 4.22205C7.34576 1.09786 12.4111 1.09786 15.5353 4.22205C18.42 7.10677 18.6411 11.6464 16.1986 14.7849L20.4851 19.0713C20.8756 19.4618 20.8756 20.095 20.4851 20.4855C20.0945 20.876 19.4614 20.876 19.0708 20.4855L14.7844 16.1991ZM5.63578 14.1215C7.97892 16.4647 11.7779 16.4647 14.1211 14.1215C16.4642 11.7784 16.4642 7.97941 14.1211 5.63627C11.7779 3.29312 7.97892 3.29312 5.63578 5.63627C3.29263 7.97941 3.29263 11.7784 5.63578 14.1215Z"
                fill="#667085"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 mt-6">
        <div className="grid grid-cols-6 font-semibold text-[#1E437A] py-4 px-6 bg-gray-100 rounded-t-md">
          <div>Member Name</div>
          <div>Email</div>
          <div>Membership Tier</div>
          <div>Status</div>
          <div>Renewal Date</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading members...
          </div>
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-6 py-4 px-6 border-t border-gray-200 items-center"
            >
              <Link
                href={`/subscription/members/details/${item.id}`}
                className="text-[#1E437A] font-medium"
              >
                {item.memberName}
              </Link>
              <div className="text-[#1E437A]">{item.email}</div>
              <div className="text-[#1E437A]">{item.tier}</div>
              <div>{getStatusBadge(item.status)}</div>
              <div className="text-[#1E437A]">
                {new Date(item.renewalDate).toLocaleDateString()}
              </div>
              <div>
                <button
                  onClick={() =>
                    router.push(`/subscription/members/details/${item.id}`)
                  }
                  className="flex cursor-pointer items-center gap-1 text-[#C83C92] font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            No members found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersTable;
