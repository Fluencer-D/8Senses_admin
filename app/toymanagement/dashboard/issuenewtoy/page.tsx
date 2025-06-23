"use client"

import { useState } from "react"
import { ArrowLeft, X, Search, Calendar } from "lucide-react"

export default function IssueToyForm() {
  const [borrowerName, setBorrowerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [relationship, setRelationship] = useState("")
  const [toySearch, setToySearch] = useState("Wooden Puzzle")
  const [toyName, setToyName] = useState("Wooden Puzzle")
  const [category, setCategory] = useState("Brain Development")
  const [toyUnit, setToyUnit] = useState("2")
  const [condition, setCondition] = useState("Good")
  const [issueDate, setIssueDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  return (
    <div className="min-h-screen ml-[300px]  max-w-[85%] bg-gray-50 p-6">
      <div className=" w-[80%] mt-28 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-blue-600 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span style={{ color:"#456696"}}className="text-sm font-medium font-semibold">Back</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <h1 style={{color:"#1E437A",}} className="text-2xl font-semibold  mb-4 -mt-5">Issue a Toy</h1>

        {/* Borrower Details Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6" style={{color:"#1E437A"}}>Borrower Details</h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="borrower-name" className="block text-sm font-medium text-gray-700 mb-2">
                Borrower Name
              </label>
              <input
                id="borrower-name"
                type="text"
                placeholder="Enter borrower's full name"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                className="w-1/2 h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  placeholder="Enter borrower's phone number"
                  value={phoneNumber}
                  style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter borrower's email address"
                  value={email}
                  style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                Relationship to Child
              </label>
              <select
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select relationship</option>
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="grandparent">Grandparent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button  style={{backgroundColor:"#C83C92"}} className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 rounded-md font-medium">
              Confirm & Continue
            </button>
          </div>
        </div>

        {/* Toy Details Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h2 style={{color:"#1E437A"}} className="text-base font-semibold text-gray-900 mb-6">Toy Details</h2>

          <div className="space-y-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Wooden Puzzle"
                value={toySearch}
                style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                onChange={(e) => setToySearch(e.target.value)}
                className="w-1/2 h-11 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="toy-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Toy Name
                </label>
                <input
                  id="toy-name"
                  type="text"
                  style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                  value={toyName}
                  onChange={(e) => setToyName(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="toy-unit" className="block text-sm font-medium text-gray-700 mb-2">
                Select Toy Unit
              </label>
              <select
                id="toy-unit"
                value={toyUnit}
                style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                onChange={(e) => setToyUnit(e.target.value)}
                className="w- h1/2-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <input
                id="condition"
                type="text"
                style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-1/2 h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button style={{backgroundColor:"#C83C92"}} className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 rounded-md font-medium">
              Confirm & Continue
            </button>
          </div>
        </div>

        {/* Borrowing Details & Confirmation Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6" style={{color:"#1E437A"}}>Borrowing Details & Confirmation</h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <div className="relative">
                  <input
                    id="issue-date"
                    type="date"
                    style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                    placeholder="Select Start Date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="return-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Return Due Date
                </label>
                <div className="relative">
                  <input
                    id="return-date"
                    type="date"
                    style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                    placeholder="Select Return Date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="additional-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additional-notes"
                placeholder="Write any additional notes..."
                value={additionalNotes}
                style={{color:"#858D9D",backgroundColor:"#F9F9FC"}}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <button style={{backgroundColor:"#C83C92"}} className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 rounded-md font-medium">
              Issue Toy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
