"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const MembersTable = () => {
  let router=useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Initial members data
  const membersData = [
    {
      id: 1,
      name: "John Dawson",
      email: "john@example.com",
      membershipTier: "Premium",
      status: "Active",
      renewalDate: "Apr 30, 2025"
    },
    {
      id: 2,
      name: "Emily Carter",
      email: "emily@example.com",
      membershipTier: "Standard",
      status: "Active",
      renewalDate: "Apr 20, 2025"
    },
    {
      id: 3,
      name: "Sarah Kim",
      email: "sarah@example.com",
      membershipTier: "Premium",
      status: "Expired",
      renewalDate: "Mar 10, 2025"
    },
    {
      id: 4,
      name: "Robert Green",
      email: "robert@example.com",
      membershipTier: "Standard",
      status: "Pending Renewal",
      renewalDate: "Apr 15, 2025"
    }
  ];

  // Filter members based on search term
  const filteredMembers = membersData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.membershipTier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.renewalDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get status badge with appropriate color
  const getStatusBadge = (status: "Active" | "Expired" | "Pending Renewal" | string) => {
    let bgColor = '';
    let textColor = '';
  
    switch (status) {
      case 'Active':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'Expired':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'Pending Renewal':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
  
    return (
      <span className={`${bgColor} ${textColor} text-sm px-3 py-1 rounded-full`}>
        {status}
      </span>
    );
  };
  
  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[#333843] font-medium text-2xl leading-8 tracking-[0.12px]">
          Members
        </h2>
        <p className="text-sm text-gray-500 flex items-center mt-1">
          <span className="text-[#245BA7] font-medium text-sm leading-5 tracking-[0.07px]">
            Subscription
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
          <span className="text-[#667085]">Members</span>
        </p>
        <button className="flex items-center gap-2 bg-[#C83C921A] text-[#C83C92] px-4 py-2 rounded-lg ml-275 -mt-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M13.0896 6.00594C12.7641 6.33138 12.2365 6.33138 11.9111 6.00594L10.8337 4.92853V12.9167C10.8337 13.3769 10.4606 13.75 10.0003 13.75C9.54009 13.75 9.16699 13.3769 9.16699 12.9167V4.92853L8.08958 6.00594C7.76414 6.33138 7.23651 6.33138 6.91107 6.00594C6.58563 5.68051 6.58563 5.15287 6.91107 4.82743L9.7057 2.03281C9.86842 1.87009 10.1322 1.87009 10.295 2.03281L13.0896 4.82743C13.415 5.15287 13.415 5.68051 13.0896 6.00594Z" fill="#C83C92"/>
  <path d="M15.0003 7.08336C16.8413 7.08336 18.3337 8.57574 18.3337 10.4167V14.5834C18.3337 16.4243 16.8413 17.9167 15.0003 17.9167H5.00033C3.15938 17.9167 1.66699 16.4243 1.66699 14.5834V10.4167C1.66699 8.57574 3.15938 7.08336 5.00033 7.08336H6.66699C7.12723 7.08336 7.50033 7.45645 7.50033 7.91669C7.50033 8.37693 7.12723 8.75002 6.66699 8.75002H5.00033C4.07985 8.75002 3.33366 9.49622 3.33366 10.4167V14.5834C3.33366 15.5038 4.07985 16.25 5.00033 16.25H15.0003C15.9208 16.25 16.667 15.5038 16.667 14.5834V10.4167C16.667 9.49622 15.9208 8.75002 15.0003 8.75002H13.3337C12.8734 8.75002 12.5003 8.37693 12.5003 7.91669C12.5003 7.45645 12.8734 7.08336 13.3337 7.08336H15.0003Z" fill="#C83C92"/>
</svg>
            Export
          </button>
      </div>

      {/* Controls Row */}
      <div className="flex justify-between mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.7844 16.1991C11.646 18.6416 7.10629 18.4205 4.22156 15.5358C1.09737 12.4116 1.09737 7.34625 4.22156 4.22205C7.34576 1.09786 12.4111 1.09786 15.5353 4.22205C18.42 7.10677 18.6411 11.6464 16.1986 14.7849L20.4851 19.0713C20.8756 19.4618 20.8756 20.095 20.4851 20.4855C20.0945 20.876 19.4614 20.876 19.0708 20.4855L14.7844 16.1991ZM5.63578 14.1215C7.97892 16.4647 11.7779 16.4647 14.1211 14.1215C16.4642 11.7784 16.4642 7.97941 14.1211 5.63627C11.7779 3.29312 7.97892 3.29312 5.63578 5.63627C3.29263 7.97941 3.29263 11.7784 5.63578 14.1215Z" fill="#667085" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search member..."
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
                d="M7.5 2.49996C7.5 2.03972 7.1269 1.66663 6.66667 1.66663C6.20643 1.66663 5.83333 2.03972 5.83333 2.49996H5C3.61929 2.49996 2.5 3.61925 2.5 4.99996V15.8333C2.5 17.214 3.61929 18.3333 5 18.3333H15C16.3807 18.3333 17.5 17.214 17.5 15.8333V4.99996C17.5 3.61925 16.3807 2.49996 15 2.49996H14.1667C14.1667 2.03972 13.7936 1.66663 13.3333 1.66663C12.8731 1.66663 12.5 2.03972 12.5 2.49996H7.5ZM15.8333 5.83329V4.99996C15.8333 4.53972 15.4602 4.16663 15 4.16663H14.1667C14.1667 4.62686 13.7936 4.99996 13.3333 4.99996C12.8731 4.99996 12.5 4.62686 12.5 4.16663H7.5C7.5 4.62686 7.1269 4.99996 6.66667 4.99996C6.20643 4.99996 5.83333 4.62686 5.83333 4.16663H5C4.53976 4.16663 4.16667 4.53972 4.16667 4.99996V5.83329H15.8333ZM4.16667 7.49996V15.8333C4.16667 16.2935 4.53976 16.6666 5 16.6666H15C15.4602 16.6666 15.8333 16.2935 15.8333 15.8333V7.49996H4.16667Z"
                fill="#667085"
              />
            </svg>
            Select Dates
          </button>
          
          
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
          
          
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="grid grid-cols-6 font-semibold text-[#1E437A] py-4 px-6 bg-gray-100 rounded-t-md">
          <div>Member Name</div>
          <div>Email</div>
          <div>Membership Tier</div>
          <div>Status</div>
          <div>Renewal Date</div>
          <div>Action</div>
        </div>

        {/* Table Body */}
        {filteredMembers.length > 0 ? (
          filteredMembers.map((item) => (
            <div key={item.id} className="grid grid-cols-6 py-4 px-6 border-t border-gray-200 items-center">
              <Link href={'/subscription/members/details'} className="text-[#1E437A] font-medium">{item.name}</Link>
              <div className="text-[#1E437A]">{item.email}</div>
              <div className="text-[#1E437A]">{item.membershipTier}</div>
              <div>{getStatusBadge(item.status)}</div>
              <div className="text-[#1E437A]">{item.renewalDate}</div>
              <div>
                <button onClick={()=>{router.push('/subscription/members/details')}} className="flex cursor-pointer items-center gap-1 text-[#C83C92] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">No members found matching your search criteria</div>
        )}
      </div>
    </div>
  );
};

export default MembersTable;