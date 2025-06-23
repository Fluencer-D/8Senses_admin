"use client"

import { useState } from "react"
import { ArrowLeft, Search, X, Filter } from "lucide-react"

export default function ProcessReturn() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [selectedBorrowers, setSelectedBorrowers] = useState<number[]>([])

  // Mock data for borrower search
  const borrowerData = {
    name: "Bob Smith",
    phone: "555-957-6543",
    email: "bobs@gmail.com",
    relationship: "Father",
    toys: [
      {
        id: 1,
        name: "Toy Car",
        unit: "Unit 1",
        issueDate: "March 03, 2025",
        dueDate: "March 18, 2025",
        status: "Overdue",
        icon: "🚗",
      },
    ],
  }

  // Mock data for toy search
  const toyData = {
    name: "Wooden Puzzle",
    category: "Brain Development",
    condition: "Good",
    borrowers: [
      {
        id: 1,
        name: "Alice Johnson",
        phone: "555-987-6543",
        unitNo: 3,
        issueDate: "March 05, 2025",
        dueDate: "March 20, 2025",
        status: "Active",
      },
      {
        id: 2,
        name: "Bob Smith",
        phone: "984-957-5603",
        unitNo: 2,
        issueDate: "March 06, 2025",
        dueDate: "March 21, 2025",
        status: "Active",
      },
      {
        id: 3,
        name: "Charlie Brown",
        phone: "999-567-1623",
        unitNo: 1,
        issueDate: "March 03, 2025",
        dueDate: "March 18, 2025",
        status: "Overdue",
      },
    ],
  }

  // Determine search type and show results
  const isBorrowerSearch = searchTerm.toLowerCase().includes("bob smith") && searchTerm.length > 2
  const isToySearch = searchTerm.toLowerCase().includes("wooden puzzle") && searchTerm.length > 2
  const showResults = isBorrowerSearch || isToySearch

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleBorrowerSelection = (borrowerId: number) => {
    setSelectedBorrowers((prev) =>
      prev.includes(borrowerId) ? prev.filter((id) => id !== borrowerId) : [...prev, borrowerId],
    )
  }

  return (
    <div style={{color:"#1E437A"}} className="min-h-screen font-sans w-[85%] ml-[300px] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b pt-24 w-[95%] border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-600 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </div>
            
          </div>
          <button className="flex items-center gap-2 border border-gray-300 bg-white  hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-5 ">Process Return</h1>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2  w-4 h-4" />
            <input
              type="text"
              placeholder="Search by borrower name or toy name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {showResults ? (
          <div className="space-y-6">
            {isBorrowerSearch ? (
              /* Borrower Search Results */
              <>
                {/* Borrower Details */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-base font-semibold  mb-5">Borrower Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium  mb-2">Borrower Name</label>
                      <input
                        type="text"
                        value={borrowerData.name}
                        readOnly
                        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm "
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium  mb-2">Phone Number</label>
                        <input
                          type="text"
                          value={borrowerData.phone}
                          readOnly
                          className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium  mb-2">Email</label>
                        <input
                          type="text"
                          value={borrowerData.email}
                          readOnly
                          className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm "
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium  mb-2">Relationship to Child</label>
                      <input
                        type="text"
                        value={borrowerData.relationship}
                        readOnly
                        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm "
                      />
                    </div>
                  </div>
                </div>

                {/* Select a Toy to Process Return */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-base font-semibold  mb-5">Select a Toy to Process Return</h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 text-sm font-medium ">Toy Name</th>
                          <th className="text-left py-3 px-3 text-sm font-medium ">Issue Date</th>
                          <th className="text-left py-3 px-3 text-sm font-medium ">Due Date</th>
                          <th className="text-left py-3 px-3 text-sm font-medium ">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {borrowerData.toys.map((toy) => (
                          <tr key={toy.id} className="border-b border-gray-100">
                            <td className="py-4 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                                  {toy.icon}
                                </div>
                                <div>
                                  <p className="text-sm font-medium ">{toy.name}</p>
                                  <p className="text-xs ">{toy.unit}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-sm ">{toy.issueDate}</td>
                            <td className="py-4 px-3 text-sm ">{toy.dueDate}</td>
                            <td className="py-4 px-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {toy.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Toy Search Results */
              <>
                {/* Toy Details */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-base font-semibold  mb-5">Borrower Details</h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium  mb-2">Toy Name</label>
                      <input
                        type="text"
                        value={toyData.name}
                        readOnly
                        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium  mb-2">Category</label>
                      <input
                        type="text"
                        value={toyData.category}
                        readOnly
                        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm "
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium  mb-2">Condition</label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {toyData.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Select a Borrower to Return From */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold ">Select a Borrower to Return From</h2>
                    <button className="flex items-center gap-2  hover: text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-md">
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 text-sm font-medium ">Borrowed By</th>
                          <th className="text-left py-3 px-3 text-sm font-medium ">Unit No.</th>
                          <th className="text-left py-3 px-3 text-sm font-medium ">Issue Date</th>
                          <th className="text-left py-3 px-3 text-sm font-medium ">Due Date</th>
                          <th className="text-left py-3 px-3 text-sm font-medium ">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {toyData.borrowers.map((borrower) => (
                          <tr key={borrower.id} className="border-b border-gray-100">
                            <td className="py-4 px-3">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedBorrowers.includes(borrower.id)}
                                  onChange={() => handleBorrowerSelection(borrower.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div>
                                  <p className="text-sm font-medium ">{borrower.name}</p>
                                  <p className="text-xs ">{borrower.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-sm  font-medium">{borrower.unitNo}</td>
                            <td className="py-4 px-3 text-sm ">{borrower.issueDate}</td>
                            <td className="py-4 px-3 text-sm ">{borrower.dueDate}</td>
                            <td className="py-4 px-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  borrower.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {borrower.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium text-sm">
                      Confirm & Continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Review & Update Toy Condition */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold  mb-5">Review & Update Toy Condition</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium  mb-2">Update Toy Condition</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">Select toy condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="needs-repair">Needs Repair</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium  mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Write any additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Final Confirm Button */}
            <div className="flex justify-start">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium text-sm">
                Confirm & Mark as Returned
              </button>
            </div>
          </div>
        ) : (
          /* Empty State - No Data Found */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 px-6">
              {/* Document Icon */}
              <div className="mb-6">
                <div className="relative">
                  {/* Main document */}
                  <div className="w-16 h-20 bg-white border-2 border-gray-300 rounded-lg relative">
                    {/* Document lines */}
                    <div className="absolute top-3 left-2 right-2 space-y-1">
                      <div className="h-0.5 bg-gray-300 rounded"></div>
                      <div className="h-0.5 bg-gray-300 rounded"></div>
                      <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                  {/* Background document */}
                  <div className="absolute -top-1 -right-1 w-16 h-20 bg-gray-100 border-2 border-gray-300 rounded-lg -z-10"></div>
                </div>
              </div>

              {/* Empty State Text */}
              <p className=" text-base font-medium">No Data Found! Search for the Data!</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Blue Line */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
    </div>
  )
}
