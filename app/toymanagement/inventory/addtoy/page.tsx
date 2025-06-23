"use client"

import React, { useState } from "react"
import { ArrowLeft, Plus, Upload, X } from "lucide-react"

export default function AddNewToy() {
  const [toyName, setToyName] = useState("")
  const [category, setCategory] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [description, setDescription] = useState("")
  const [toyUnits, setToyUnits] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files)
      setUploadedImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div  style={{ color:"#1E437A"}} className="min-h-screen  font-sans bg-gray-50 p-6">
      <div className="max-w-7xl pl-32 pt-24 mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2  cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-5 ">Add New Toy</h1>
        {/* Basic Toy Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold  mb-6">Basic Toy Information</h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="toy-name" className="block text-sm font-medium  mb-2">
                Toy Name
              </label>
              <input
                id="toy-name"
                type="text"
                placeholder="Enter Toy Name"
                value={toyName}
                style={{backgroundColor:"#F9F9FC"}}
                onChange={(e) => setToyName(e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  style={{backgroundColor:"#F9F9FC"}}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select category</option>
                  <option value="gross-motor">Gross Motor</option>
                  <option value="cognitive">Cognitive</option>
                  <option value="sensory-grip">Sensory & Grip</option>
                  <option value="stem-problem-solving">STEM & Problem-Solving</option>
                  <option value="hand-strength">Hand Strength</option>
                  <option value="balance-coordination">Balance & Coordination</option>
                  <option value="calming-sensory">Calming & Sensory</option>
                  <option value="tactile-sensory">Tactile & Sensory</option>
                </select>
              </div>
              <div>
                <label htmlFor="age-group" className="block text-sm font-medium  mb-2">
                  Age Group
                </label>
                <select
                  id="age-group"
                  style={{backgroundColor:"#F9F9FC"}}
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select age group</option>
                  <option value="0-2">0-2 years</option>
                  <option value="2-4">2-4 years</option>
                  <option value="4-6">4-6 years</option>
                  <option value="6-8">6-8 years</option>
                  <option value="8-12">8-12 years</option>
                  <option value="12+">12+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description"  style={{backgroundColor:"#F9F9FC"}} className="block text-sm font-medium  mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                placeholder="Write any additional notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label htmlFor="toy-units" className="block text-sm font-medium  mb-2">
                Add Toy Units
              </label>
              <input
                id="toy-units"
                type="number"
                placeholder="Enter toy units"
                value={toyUnits}
                style={{backgroundColor:"#F9F9FC"}}
                onChange={(e) => setToyUnits(e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Toy Images Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold  mb-6">Toy Images</h2>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium  mb-1">Upload toy images</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium  bg-white hover:bg-gray-50">
                    Choose Files
                  </span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div>
                <p className="text-sm font-medium  mb-3">Uploaded Images ({uploadedImages.length})</p>
                <div className="grid grid-cols-4 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Toy Button */}
        <div className="flex justify-start">
          <button style={{backgroundColor:"#C83C92"}} className="flex items-center gap-2 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium">
            <Plus className="w-4 h-4" />
            Add Toy
          </button>
        </div>
      </div>
    </div>
  )
}
