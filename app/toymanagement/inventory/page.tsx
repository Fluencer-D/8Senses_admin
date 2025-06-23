"use client"

import { useState } from "react"
import { ArrowLeft, Search, Filter, Eye, Edit, Trash2, Download, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function InventoryComponent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const inventoryData = [
    {
      id: 1,
      name: "Stacking Rings",
      subtitle: "2 pieces",
      category: "Gross Motor",
      totalUnits: 3,
      availableUnits: 2,
      icon: "🔴",
    },
    {
      id: 2,
      name: "Wooden Puzzle",
      subtitle: "Subtest here",
      category: "Cognitive",
      totalUnits: 2,
      availableUnits: 0,
      icon: "🧩",
    },
    {
      id: 3,
      name: "Sensory Balls",
      subtitle: "Subtest here",
      category: "Sensory & Grip",
      totalUnits: 3,
      availableUnits: 1,
      icon: "⚽",
    },
    {
      id: 4,
      name: "Magnetic Tiles",
      subtitle: "Subtest here",
      category: "STEM & Problem-Solving",
      totalUnits: 1,
      availableUnits: 1,
      icon: "🔷",
    },
    {
      id: 5,
      name: "Therapy Putty",
      subtitle: "Subtest here",
      category: "Hand Strength",
      totalUnits: 2,
      availableUnits: 0,
      icon: "🟡",
    },
    {
      id: 6,
      name: "Balance Stepping Stones",
      subtitle: "Subtest here",
      category: "Balance & Coordination",
      totalUnits: 2,
      availableUnits: 1,
      icon: "🪨",
    },
    {
      id: 7,
      name: "Weighted Lap Pad",
      subtitle: "Subtest here",
      category: "Calming & Sensory",
      totalUnits: 1,
      availableUnits: 1,
      icon: "📱",
    },
    {
      id: 8,
      name: "Pop Tubes",
      subtitle: "Subtest here",
      category: "Tactile & Sensory",
      totalUnits: 2,
      availableUnits: 0,
      icon: "🟢",
    },
    {
      id: 9,
      name: "Foam Building Blocks",
      subtitle: "Subtest here",
      category: "Gross Motor",
      totalUnits: 3,
      availableUnits: 3,
      icon: "🧱",
    },
    {
      id: 10,
      name: "Mini Trampoline",
      subtitle: "Subtest here",
      category: "Balance & Coordination",
      totalUnits: 1,
      availableUnits: 0,
      icon: "🔵",
    },
  ];

  return (
    <div style={{ color: "#1E437A" }} className="min-h-screen w-[85%] ml-[300px] font-sans text-brandblue bg-gray-50 p-6">
      <div className="max-w-7xl pt-28 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-brandblue cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </div>
            <br />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-gray-300 bg-white text-brandblue hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link href={"/toymanagement/inventory/addtoy"}>
              <button style={{ backgroundColor: "#C83C92" }} className="flex items-center gap-2  hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add New Toy
              </button>
            </Link>
          </div>
        </div>
        <h1 style={{ color: "#1E437A" }} className="text-2xl block font-semibold text-brandblue -mt-5 mb-5">Inventory</h1>
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brandblue w-4 h-4" />
            <input
              type="text"
              placeholder="Search by toy name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-300 bg-white text-brandblue hover:bg-gray-50 px-4 py-2.5 rounded-md text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">Toy Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">Total Units</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">Available Units</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-brandblue">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-lg">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brandblue">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-brandblue font-medium">{item.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-brandblue font-medium">{item.totalUnits}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-brandblue font-medium">{item.availableUnits}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link href={"/toymanagement/inventory/viewinventorytoy"}>
                          <button className="p-1.5 text-brandblue hover:text-brandblue hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={"/toymanagement/inventory/edittoy"}>
                          <button className="p-1.5 text-brandblue hover:text-green-600 hover:bg-green-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button className="p-1.5 text-brandblue hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-brandblue">Showing 1-10 from 100</div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-brandblue hover:text-brandblue disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}

                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-sm font-medium rounded ${currentPage === page ? " text-white" : "text-brandblue hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))}

              <span className="text-brandblue px-2">...</span>

              <button className="p-2 text-brandblue hover:text-brandblue" onClick={() => setCurrentPage(currentPage + 1)}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
