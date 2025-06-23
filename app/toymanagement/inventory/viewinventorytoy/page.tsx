"use client"

import { ArrowLeft, Filter, Eye, Edit, Trash2 } from "lucide-react"

export default function StackingRingsDetails() {
    return (
        <div style={{ color: "#1E437A" }} className="min-h-screen text-brandblue font-sans w-[85%] ml-[300px] bg-gray-50 p-6">
            <div className="w-[95%] mx-auto py-28">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold ">Stacking Rings Details</h1>
                            <div className="flex items-center gap-2 text-sm  mt-1">
                                <span className=" cursor-pointer">Inventory</span>
                                <span>›</span>
                                <span>Toy Details</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 border border-gray-300 bg-white  hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Issue a Toy
                        </button>
                        <button style={{backgroundColor:"#C83C92"}} className="flex items-center gap-2 bg-brandpink hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                            <Edit className="w-4 h-4" />
                            Edit Toy Details
                        </button>
                    </div>
                </div>

                {/* Basic Toy Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold  mb-6">Basic Toy Information</h2>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium  mb-1">Category</label>
                                <p className="text-base text-xl  font-medium">Gross Motor</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium  mb-1">Total Units</label>
                                <p className="text-base text-xl  font-medium">3</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium  mb-1">Recommended Age</label>
                                <p className="text-base text-xl  font-medium">0-2 years</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium  mb-1">Available Units</label>
                                <p className="text-base text-xl  font-medium">2</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Units & Availability */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold  mb-6">Units & Availability</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Unit No.</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Availability</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Condition</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Borrowed By</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-sm  font-medium">1</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Available
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Good
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-500">-</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 text-gray-400 hover: hover:bg-blue-50 rounded">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-sm  font-medium">2</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Borrowed
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            New
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm  font-medium">Alice Johnson</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 text-gray-400 hover: hover:bg-blue-50 rounded">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-sm  font-medium">3</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Available
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            Needs Repair
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-500">-</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 text-gray-400 hover: hover:bg-blue-50 rounded">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Borrowing History */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold ">Borrowing History</h2>
                        <button className="flex items-center gap-2  hover: text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-md">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Unit No.</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Borrower</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Borrowed Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Due Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium ">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-sm  font-medium">1</td>
                                    <td className="py-4 px-4 text-sm  font-medium">Ethan Miller</td>
                                    <td className="py-4 px-4 text-sm ">10-Feb-2024</td>
                                    <td className="py-4 px-4 text-sm ">17-Feb-2024</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Returned
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-sm  font-medium">2</td>
                                    <td className="py-4 px-4 text-sm  font-medium">Alice Johnson</td>
                                    <td className="py-4 px-4 text-sm ">28-Feb-2024</td>
                                    <td className="py-4 px-4 text-sm ">04-Mar-2024</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            Due Soon
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-sm  font-medium">3</td>
                                    <td className="py-4 px-4 text-sm  font-medium">Bob Smith</td>
                                    <td className="py-4 px-4 text-sm ">18-Jan-2024</td>
                                    <td className="py-4 px-4 text-sm ">25-Jan-2024</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Returned
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Button */}
                <div className="flex justify-start">
                    <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        <Trash2 className="w-4 h-4" />
                        Delete Toy
                    </button>
                </div>
            </div>
        </div>
    )
}
