"use client";
import React, { useState } from "react";

const FeedbackReviewsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Initial feedback data
  const feedbackData = [
    {
      id: 1,
      name: "John Dawson",
      course: "Speech Therapy Basics",
      rating: 5,
      feedback: "Very informative!",
    },
    {
      id: 2,
      name: "Emily Carter",
      course: "Sensory Play Webinar",
      rating: 3,
      feedback: "Good session, but a bit long.",
    },
    {
      id: 3,
      name: "Sarah Kim",
      course: "Fine Motor Skills Course",
      rating: 2,
      feedback: "Lacked depth on key topics.",
    },
    {
      id: 4,
      name: "Robert Green",
      course: "ADHD Awareness Webinar",
      rating: 4,
      feedback: "Great hands-on techniques!",
    },
  ];

  // Filter feedback based on search term
  const filteredFeedback = feedbackData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rating.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[#333843] font-medium text-2xl leading-8 tracking-[0.12px]">
          Feedback & Reviews
        </h2>
        <p className="text-sm text-gray-500 flex items-center mt-1">
          <span className="text-[#245BA7] font-medium text-sm leading-5 tracking-[0.07px]">
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
          <span className="text-[#667085]">Feedback & Reviews</span>
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex justify-between mb-6">
        <div className="relative">
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
          <input
            type="text"
            placeholder="Search feedback..."
            className="pl-10 pr-4 py-2 border bg-white text-[#858D9D] border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-3">
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.5 15C2.5 14.5398 2.8731 14.1667 3.33333 14.1667H10.4167C10.6468 14.1667 10.8333 14.3532 10.8333 14.5833V15.4167C10.8333 15.6468 10.6468 15.8333 10.4167 15.8333H3.33333C2.8731 15.8333 2.5 15.4602 2.5 15Z"
                fill="#667085"
              />
              <path
                d="M10.8333 6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5C12.1269 7.5 12.5 7.1269 12.5 6.66667V5.83333H16.6667C17.1269 5.83333 17.5 5.46024 17.5 5C17.5 4.53976 17.1269 4.16667 16.6667 4.16667H12.5V3.33333C12.5 2.8731 12.1269 2.5 11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667Z"
                fill="#667085"
              />
              <path
                d="M7.5 7.5C7.03976 7.5 6.66667 7.8731 6.66667 8.33333V11.6667C6.66667 12.1269 7.03976 12.5 7.5 12.5C7.96024 12.5 8.33333 12.1269 8.33333 11.6667V10.8333H16.6667C17.1269 10.8333 17.5 10.4602 17.5 10C17.5 9.53976 17.1269 9.16667 16.6667 9.16667H8.33333V8.33333C8.33333 7.8731 7.96024 7.5 7.5 7.5Z"
                fill="#667085"
              />
              <path
                d="M2.5 10C2.5 9.53976 2.8731 9.16667 3.33333 9.16667H4.58333C4.81345 9.16667 5 9.35321 5 9.58333V10.4167C5 10.6468 4.81345 10.8333 4.58333 10.8333H3.33333C2.8731 10.8333 2.5 10.4602 2.5 10Z"
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
            </svg>
            Filters
          </button>

          <button className="flex items-center gap-2 bg-[#C83C92] text-white px-4 py-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 20 20"
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

      {/* Feedback Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="grid grid-cols-4 font-medium text-[#1E437A] py-4 px-6 bg-gray-100 rounded-t-md">
          <div>User Name</div>
          <div>Course/Webinar</div>
          <div>Rating</div>
          <div>Feedback</div>
        </div>

        {/* Table Body */}
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 py-4 px-6 border-t border-gray-200 items-center"
            >
              <div className="text-[#1E437A] font-medium">{item.name}</div>
              <div className="text-[#1E437A]">{item.course}</div>
              <div className="text-[#1E437A]">{item.rating}</div>
              <div className="text-gray-700">{item.feedback}</div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            No feedback found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackReviewsTable;
