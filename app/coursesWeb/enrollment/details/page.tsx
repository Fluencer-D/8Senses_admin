"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define user data type
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  startDate: string;
}

const UserDetailsPage: React.FC<{ userId?: string }> = ({ userId = "12345" }) => {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        // Commented API call as backend is not ready
        // const response = await fetch(`/api/users/${userId}`);
        // if (!response.ok) {
        //   throw new Error(`Error fetching user: ${response.statusText}`);
        // }
        // const data: UserData = await response.json();
        // setUserData(data);
        
        // Dummy data based on the image
        setUserData({
          id: "12345",
          name: "John Dawson",
          email: "john@example.com",
          phone: "+1 (555) 987-6543",
          course: "Speech Therapy Basics",
          status: "Active",
          startDate: "Mar 5, 2025",
        });

        setError(null);
      } catch (err: unknown) {
        console.error("Failed to fetch user details:", err);
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleEditEnrollment = () => {
    router.push(`/webinars/enrollment/edit/${userId}`);
  };

  const handleRemoveFromCourse = async () => {
    if (confirm("Are you sure you want to remove this user from the course?")) {
      try {
        // Commented API call
        // const response = await fetch(`/api/users/${userId}/enrollment`, {
        //   method: "DELETE",
        // });
        // if (!response.ok) throw new Error("Failed to remove user from course");

        alert("User removed from course successfully");
        router.push("/webinars/enrollment");
      } catch (err) {
        console.error("Error removing user from course:", err);
        alert(`Error: ${(err as Error).message}`);
      }
    }
  };

  const handleIssueCertificate = async () => {
    try {
      // Commented API call
      // const response = await fetch(`/api/users/${userId}/certificate`, {
      //   method: "POST",
      // });
      // if (!response.ok) throw new Error("Failed to issue certificate");

      alert("Certificate issued successfully");
    } catch (err) {
      console.error("Error issuing certificate:", err);
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[#333843] text-3xl">Webinars</h1>
          <button 
            onClick={handleIssueCertificate}
            className="flex items-center gap-2 bg-[#C83C921A] text-[#C83C92] px-4 py-2 rounded-lg font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C83C92"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            Issue Certificate
          </button>
        </div>
        <div className="text-gray-500 text-sm mt-1 flex items-center">
          <span className="text-[#1E437A] cursor-pointer">Courses & Webinars</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#1E437A] cursor-pointer">Enrollment</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#667085]">User Details</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-[#333843] mb-6">User Information</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
          </div>
        ) : error && !userData ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">Error: {error}</div>
        ) : (
          userData && (
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 mb-1">Name</p>
                <p className="text-lg font-medium text-[#1E437A]">{userData.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-medium text-[#1E437A]">{userData.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Phone</p>
                  <p className="text-lg font-medium text-[#1E437A]">{userData.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-600 mb-1">Enrolled In</p>
                <p className="text-lg font-medium text-[#1E437A]">{userData.course}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  userData.status === "Active" ? "bg-[#E7F4EE] text-[#0D894F]" : "bg-[#FEEDEC] text-[#F04438]"
                }`}>
                  {userData.status}
                </span>
                <span className="text-gray-600">Started: {userData.startDate}</span>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  className="bg-[#C83C92] text-white px-5 py-3 rounded-lg"
                  onClick={handleEditEnrollment}
                >
                  Edit Enrollment
                </button>
                <button 
                  className="bg-[#F04438] text-white px-5 py-3 rounded-lg"
                  onClick={handleRemoveFromCourse}
                >
                  Remove From Course
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UserDetailsPage;