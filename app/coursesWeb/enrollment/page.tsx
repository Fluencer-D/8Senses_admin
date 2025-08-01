"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminToken } from "@/utils/storage";

interface Enrollment {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  courseTitle: string;
  status: "enrolled" | "completed" | "dropped";
}

const WebinarEnrollmentTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = getAdminToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/course-enrollments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch enrollments");

        const data = await res.json();
        console.log(data); //debug
        const formatted = data.data.map((e: any) => ({
          _id: e._id,
          firstName: e.firstName,
          lastName: e.lastName,
          email: e.email,
          courseTitle: e.courseTitle || "Untitled Webinar",
          status: e.status || "enrolled",
        }));

        setEnrollments(formatted);
      } catch (err: any) {
        console.error("❌ Error fetching enrollments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "enrolled":
      case "active":
      case "completed":
        return "bg-[#E7F4EE] text-[#0D894F]";
      case "dropped":
        return "bg-[#FDF1E8] text-[#E46A11]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-6">Loading enrollments...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  // keep rest of the UI same — just map through filteredEnrollments below

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-[#333843] font-inter font-medium text-2xl leading-8 tracking-[0.12px]">
              Webinars
            </h2>
            <p className="text-sm text-gray-500 flex items-center">
              <span className="text-[#245BA7] font-inter font-medium text-sm leading-5 tracking-[0.07px]">
                Courses & Webinars
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="mx-2"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.59467 3.96967C6.30178 4.26256 6.30178 4.73744 6.59467 5.03033L10.5643 9L6.59467 12.9697C6.30178 13.2626 6.30178 13.7374 6.59467 14.0303C6.88756 14.3232 7.36244 14.3232 7.65533 14.0303L12.4205 9.26516C12.5669 9.11872 12.5669 8.88128 12.4205 8.73484L7.65533 3.96967C7.36244 3.67678 6.88756 3.67678 6.59467 3.96967Z"
                  fill="#A3A9B6"
                />
              </svg>
              <span className="text-[#667085]">Enrollment</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
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
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex justify-between mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                d="M14.7844 16.1991C11.646 18.6416 7.10629 18.4205 4.22156 15.5358C1.09737 12.4116 1.09737 7.34625 4.22156 4.22205C7.34576 1.09786 12.4111 1.09786 15.5353 4.22205C18.42 7.10677 18.6411 11.6464 16.1986 14.7849L20.4851 19.0713C20.8756 19.4618 20.8756 20.095 20.4851 20.4855C20.0945 20.876 19.4614 20.876 19.0708 20.4855L14.7844 16.1991ZM5.63578 14.1215C7.97892 16.4647 11.7779 16.4647 14.1211 14.1215C16.4642 11.7784 16.4642 7.97941 14.1211 5.63627C11.7779 3.29312 7.97892 3.29312 5.63578 5.63627C3.29263 7.97941 3.29263 11.7784 5.63578 14.1215Z"
                fill="#667085"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search user..."
            className="pl-10 pr-4 py-2 border font-[inter] bg-white text-[#858D9D] border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          {/* <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg font-medium">
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
                d="M7.5 2.49996C7.5 2.03972 7.1269 1.66663 6.66667 1.66663C6.20643 1.66663 5.83333 2.03972 5.83333 2.49996H5C3.61929 2.49996 2.5 3.61925 2.5 4.99996V15.8333C2.5 17.214 3.61929 18.3333 5 18.3333H15C16.3807 18.3333 17.5 17.214 17.5 15.8333V4.99996C17.5 3.61925 16.3807 2.49996 15 2.49996H14.1667C14.1667 2.03972 13.7936 1.66663 13.3333 1.66663C12.8731 1.66663 12.5 2.03972 12.5 2.49996H7.5ZM15.8333 5.83329V4.99996C15.8333 4.53972 15.4602 4.16663 15 4.16663H14.1667C14.1667 4.62686 13.7936 4.99996 13.3333 4.99996C12.8731 4.99996 12.5 4.62686 12.5 4.16663H7.5C7.5 4.62686 7.1269 4.99996 6.66667 4.99996C6.20643 4.99996 5.83333 4.62686 5.83333 4.16663H5C4.53976 4.16663 4.16667 4.53972 4.16667 4.99996V5.83329H15.8333ZM4.16667 7.49996V15.8333C4.16667 16.2935 4.53976 16.6666 5 16.6666H15C15.4602 16.6666 15.8333 16.2935 15.8333 15.8333V7.49996H4.16667Z"
                fill="#667085"
              />
            </svg>
            Select Dates
          </button> */}
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
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
                d="M12.5 13.3333C12.5 12.8731 12.8731 12.5 13.3333 12.5C13.7936 12.5 14.1667 12.8731 14.1667 13.3333V14.1667H16.6667C17.1269 14.1667 17.5 14.5398 17.5 15C17.5 15.4602 17.1269 15.8333 16.6667 15.8333H14.1667V16.6667C14.1667 17.1269 13.7936 17.5 13.3333 17.5C12.8731 17.5 12.5 17.1269 12.5 16.6667V13.3333Z"
                fill="#667085"
              />
              <path
                d="M2.5 15C2.5 14.5398 2.8731 14.1667 3.33333 14.1667H10.4167C10.6468 14.1667 10.8333 14.3532 10.8333 14.5833V15.4167C10.8333 15.6468 10.6468 15.8333 10.4167 15.8333H3.33333C2.8731 15.8333 2.5 15.4602 2.5 15Z"
                fill="#667085"
              />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Enrollment Table */}
      <div className="bg-white rounded-md shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-5 font-medium text-[#1E437A] py-4 px-6 bg-gray-100 rounded-t-md">
          <div>User Name</div>
          <div>Email</div>
          <div>Enrolled In</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {/* Table Body */}
        {filteredEnrollments.length > 0 ? (
          filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment._id}
              className="grid grid-cols-5 py-4 px-6 border-t border-gray-200 items-center"
            >
              <Link
                href={"/coursesWeb/enrollment/details"}
                className="text-[#1E437A] font-medium"
              >
                {enrollment.firstName} {enrollment.lastName}
              </Link>
              <div className="text-[#1E437A]">{enrollment.email}</div>
              <div className="text-[#1E437A]">{enrollment.courseTitle}</div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(
                    enrollment.status
                  )}`}
                >
                  {enrollment.status}
                </span>
              </div>
              <div className="flex space-x-3">
                <button className="text-blue-600">
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
                      d="M10.0002 4.16663C15.1085 4.16663 17.5258 7.5916 18.3768 9.19278C18.6477 9.70262 18.6477 10.2973 18.3768 10.8071C17.5258 12.4083 15.1085 15.8333 10.0002 15.8333C4.89188 15.8333 2.4746 12.4083 1.62363 10.8071C1.35267 10.2973 1.35267 9.70262 1.62363 9.19277C2.4746 7.59159 4.89188 4.16663 10.0002 4.16663ZM5.69716 7.0647C4.31361 7.98141 3.50572 9.20281 3.09536 9.97494C3.09078 9.98357 3.08889 9.98955 3.08807 9.99283C3.08724 9.99617 3.08708 9.99996 3.08708 9.99996C3.08708 9.99996 3.08724 10.0037 3.08807 10.0071C3.08889 10.0104 3.09078 10.0164 3.09536 10.025C3.50572 10.7971 4.31361 12.0185 5.69716 12.9352C5.12594 12.0994 4.79188 11.0887 4.79188 9.99996C4.79188 8.91121 5.12594 7.90049 5.69716 7.0647ZM14.3033 12.9352C15.6868 12.0185 16.4947 10.7971 16.905 10.025C16.9096 10.0164 16.9115 10.0104 16.9123 10.0071C16.9129 10.0049 16.9133 10.0019 16.9133 10.0019L16.9133 9.99996L16.913 9.99629L16.9123 9.99283C16.9115 9.98955 16.9096 9.98357 16.905 9.97494C16.4947 9.20282 15.6868 7.98142 14.3033 7.06471C14.8745 7.9005 15.2085 8.91122 15.2085 9.99996C15.2085 11.0887 14.8745 12.0994 14.3033 12.9352ZM6.45854 9.99996C6.45854 8.04395 8.0442 6.45829 10.0002 6.45829C11.9562 6.45829 13.5419 8.04395 13.5419 9.99996C13.5419 11.956 11.9562 13.5416 10.0002 13.5416C8.0442 13.5416 6.45854 11.956 6.45854 9.99996Z"
                      fill="#456696"
                    />
                  </svg>
                </button>
                <button className="text-blue-600">
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
                <button className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M8.33317 8.12496C8.79341 8.12496 9.1665 8.49806 9.1665 8.95829V13.9583C9.1665 14.4185 8.79341 14.7916 8.33317 14.7916C7.87293 14.7916 7.49984 14.4185 7.49984 13.9583V8.95829C7.49984 8.49806 7.87293 8.12496 8.33317 8.12496Z"
                      fill="#456696"
                    />
                    <path
                      d="M12.4998 8.95829C12.4998 8.49806 12.1267 8.12496 11.6665 8.12496C11.2063 8.12496 10.8332 8.49806 10.8332 8.95829V13.9583C10.8332 14.4185 11.2063 14.7916 11.6665 14.7916C12.1267 14.7916 12.4998 14.4185 12.4998 13.9583V8.95829Z"
                      fill="#456696"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.9998 4.99996V4.16663C14.9998 2.78591 13.8806 1.66663 12.4998 1.66663H7.49984C6.11913 1.66663 4.99984 2.78591 4.99984 4.16663V4.99996H3.74984C3.2896 4.99996 2.9165 5.37306 2.9165 5.83329C2.9165 6.29353 3.2896 6.66663 3.74984 6.66663H4.1665V15.8333C4.1665 17.214 5.28579 18.3333 6.6665 18.3333H13.3332C14.7139 18.3333 15.8332 17.214 15.8332 15.8333V6.66663H16.2498C16.7101 6.66663 17.0832 6.29353 17.0832 5.83329C17.0832 5.37306 16.7101 4.99996 16.2498 4.99996H14.9998ZM12.4998 3.33329H7.49984C7.0396 3.33329 6.6665 3.70639 6.6665 4.16663V4.99996H13.3332V4.16663C13.3332 3.70639 12.9601 3.33329 12.4998 3.33329ZM14.1665 6.66663H5.83317V15.8333C5.83317 16.2935 6.20627 16.6666 6.6665 16.6666H13.3332C13.7934 16.6666 14.1665 16.2935 14.1665 15.8333V6.66663Z"
                      fill="#456696"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            No enrollments found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default WebinarEnrollmentTable;
