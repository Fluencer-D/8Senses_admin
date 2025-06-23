"use client"

import { ArrowLeft, Filter, X } from "lucide-react"

export default function BorrowerProfile() {
    return (
        <div style={{color:"#1E437A"}} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50 p-6">
            <div className=" pt-24 mx-auto w-[95%]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3  cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                        <span style={{ color: "#456696" }} className="text-sm font-medium font-semibold">Back</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-brandblue border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-brandblue" >Alice Johnson - Profile</h1>
                            <div className="flex items-center gap-2 text-sm text-brandblue mt-1">
                                <span className="text-blue-600 cursor-pointer">Borrowers</span>
                                <span>›</span>
                                <span>Borrower Details</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button style={{backgroundColor:"#C83C92"}} className="flex items-center gap-2 text-white px-4 py-2 rounded-md text-sm font-medium bg-brandpink">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Issue a Toy
                        </button >
                        <button style={{backgroundColor:"#C83C92"}} className="flex items-center gap-2 text-white px-4 py-2 rounded-md text-sm font-medium bg-brandpink">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Edit Toy Details
                        </button>
                    </div>
                </div>

                {/* Borrower Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-brandblue mb-6">Borrower Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brandblue mb-1">Full Name</label>
                            <p className="text-base text-brandblue font-semibold text-xl font-sans">Alice Johnson</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-brandblue mb-1">Phone Number</label>
                                <p className="text-base font-semibold text-xl font-sans text-brandblue">555-123-457</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brandblue mb-1">Email</label>
                                <p className="text-base font-semibold text-xl font-sans text-brandblue">alicej@gmail.com</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brandblue mb-1">Relationship to Child</label>
                            <p className="text-base text-brandblue font-semibold text-xl font-sans">Father</p>
                        </div>
                    </div>
                </div>

                {/* Borrowed Toy */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-brandblue mb-6">Borrowed Toy</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Toy Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Borrowed Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Due Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-brandblue">Wooden Puzzle</p>
                                                <p className="text-xs text-gray-500">Unit 2</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-brandblue">28-Feb-2024</td>
                                    <td className="py-4 px-4 text-sm text-brandblue">04-Mar-2024</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            Due Soon
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z"
                                                />
                                            </svg>
                                            Send Reminder
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Borrowing History */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-brandblue">Borrowing History</h2>
                        <button className="flex items-center gap-2 text-brandblue hover:text-gray-700 text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-md">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Toy Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Borrowed Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Returned Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-brandblue">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-brandblue">Wooden Puzzle</p>
                                                <p className="text-xs text-gray-500">Unit 2</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-brandblue">10-Jan-2024</td>
                                    <td className="py-4 px-4 text-sm text-brandblue">17-Jan-2024</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Returned On Time
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-brandblue">Stacking Rings</p>
                                                <p className="text-xs text-gray-500">Unit 1</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-brandblue">05-Dec-2023</td>
                                    <td className="py-4 px-4 text-sm text-brandblue">15-Dec-2023</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            Return Late (2 Days)
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
