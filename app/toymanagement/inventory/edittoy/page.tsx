"use client"

import { useState } from "react"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

export default function EditToyDetails() {
    const [toyName, setToyName] = useState("Stacking Rings")
    const [category, setCategory] = useState("Gross Motor")
    const [ageGroup, setAgeGroup] = useState("0-2 years")
    const [description, setDescription] = useState("This is the description.")

    const [units, setUnits] = useState([
        {
            id: 1,
            unitNo: 1,
            availability: "Available",
            condition: "Good",
            borrowedBy: "-",
        },
        {
            id: 2,
            unitNo: 2,
            availability: "Borrowed",
            condition: "New",
            borrowedBy: "Alice Johnson",
        },
        {
            id: 3,
            unitNo: 3,
            availability: "Available",
            condition: "Needs Repair",
            borrowedBy: "-",
        },
    ])

    const updateUnit = (id: number, field: string, value: string) => {
        setUnits((prev) => prev.map((unit) => (unit.id === id ? { ...unit, [field]: value } : unit)))
    }

    const deleteUnit = (id: number) => {
        setUnits((prev) => prev.filter((unit) => unit.id !== id))
    }

    return (
        <div style={{color:"#1E437A"}} className="min-h-screen w-[85%] ml-[300px] font-sans  bg-gray-50 p-6">
            <div className="max-w-5xl pt-24 mx-auto">
                {/* Header */}
                <div className="flex mb-5 items-center gap-2 text-blue-600 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold ">Edit Toy Details - Stacking Rings</h1>
                    </div>
                    <button style={{backgroundColor:"#C83C92"}} className="flex items-center gap-2  hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        <Save className="w-4 h-4" />
                        Save Details
                    </button>
                </div>

                {/* Basic Toy Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-base font-semibold  mb-5">Basic Toy Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="toy-name" className="block text-sm font-medium  mb-2">
                                Toy Name
                            </label>
                            <input
                                id="toy-name"
                                type="text"
                                value={toyName}
                                style={{ backgroundColor: "#F9F9FC" }}
                                onChange={(e) => setToyName(e.target.value)}
                                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium  mb-2">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    style={{ backgroundColor: "#F9F9FC" }}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                                >
                                    <option value="Gross Motor">Gross Motor</option>
                                    <option value="Cognitive">Cognitive</option>
                                    <option value="Sensory & Grip">Sensory & Grip</option>
                                    <option value="STEM & Problem-Solving">STEM & Problem-Solving</option>
                                    <option value="Hand Strength">Hand Strength</option>
                                    <option value="Balance & Coordination">Balance & Coordination</option>
                                    <option value="Calming & Sensory">Calming & Sensory</option>
                                    <option value="Tactile & Sensory">Tactile & Sensory</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="age-group" className="block text-sm font-medium  mb-2">
                                    Age Group
                                </label>
                                <select
                                    id="age-group"
                                    value={ageGroup}
                                    style={{ backgroundColor: "#F9F9FC" }}
                                    onChange={(e) => setAgeGroup(e.target.value)}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                                >
                                    <option value="0-2 years">0-2 years</option>
                                    <option value="2-4 years">2-4 years</option>
                                    <option value="4-6 years">4-6 years</option>
                                    <option value="6-8 years">6-8 years</option>
                                    <option value="8-12 years">8-12 years</option>
                                    <option value="12+ years">12+ years</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium  mb-2">
                                Description (Optional)
                            </label>
                            <textarea

                                id="description"
                                style={{ backgroundColor: "#F9F9FC" }}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Manage Toy Units */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-base font-semibold  mb-5">Manage Toy Units</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-3 text-sm font-medium  w-20">Unit No.</th>
                                    <th className="text-left py-3 px-3 text-sm font-medium ">Availability</th>
                                    <th className="text-left py-3 px-3 text-sm font-medium ">Condition</th>
                                    <th className="text-left py-3 px-3 text-sm font-medium ">Borrowed By</th>
                                    <th className="text-left py-3 px-3 text-sm font-medium ">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.map((unit) => (
                                    <tr key={unit.id} className="border-b border-gray-100">
                                        <td className="py-4 px-3 text-sm  font-medium">{unit.unitNo}</td>
                                        <td className="py-4 px-3">
                                            <select
                                                style={{ backgroundColor: "#F9F9FC" }}
                                                value={unit.availability}
                                                onChange={(e) => updateUnit(unit.id, "availability", e.target.value)}
                                                className="w-full h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            >
                                                <option value="Available">Available</option>
                                                <option value="Borrowed">Borrowed</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-3">
                                            <select
                                                style={{ backgroundColor: "#F9F9FC" }}
                                                value={unit.condition}
                                                onChange={(e) => updateUnit(unit.id, "condition", e.target.value)}
                                                className="w-full h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            >
                                                <option value="Good">Good</option>
                                                <option value="New">New</option>
                                                <option value="Needs Repair">Needs Repair</option>
                                                <option value="Fair">Fair</option>
                                                <option value="Poor">Poor</option>
                                            </select>
                                        </td>
                                        <td style={{color:"#1E437A"}} className="py-4 px-3 text-sm ">
                                            {unit.borrowedBy === "-" ? (
                                                <span className="text-gray-500">-</span>
                                            ) : (
                                                <span className=" font-medium">{unit.borrowedBy}</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-3">
                                            <button
                                                onClick={() => deleteUnit(unit.id)}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete Unit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
