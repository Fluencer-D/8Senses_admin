"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Plus, Upload, X } from "lucide-react"
import { getAdminToken } from "@/utils/storage"
interface AddNewToyProps {
  onClose: () => void
}

export default function AddNewToy({ onClose }: AddNewToyProps) {
  const [toyName, setToyName] = useState("")
  const [category, setCategory] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [description, setDescription] = useState("")
  const [toyUnits, setToyUnits] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // API Base URL - adjust according to your backend
  const NEXT_PUBLIC_API_URL =  `${process.env.NEXT_PUBLIC_API_URL}/api`

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

  // Upload images to Cloudinary
  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      const formData = new FormData()
      formData.append("file", image)
      formData.append("upload_preset", "my_unsigned_preset") // Replace with your upload preset
      
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dlehbizfp/image/upload`, // Replace with your cloud name
          {
            method: "POST",
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`)
        }

        const result = await response.json()
        return result.secure_url // Cloudinary returns secure_url
      } catch (error) {
        console.error("Image upload failed:", error)
        // Return placeholder for failed uploads
        return "/placeholder.svg?height=200&width=200"
      }
    })

    return Promise.all(uploadPromises)
  }

  // Create toy via API
  const createToy = async (toyData: any) => {
    try {
      const token = getAdminToken()
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/toys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(toyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Create toy failed:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!toyName.trim()) {
        alert("Toy name is required")
        return
      }
      if (!category) {
        alert("Category is required")
        return
      }

      let imageUrls: string[] = []

      // Upload images if any
      if (uploadedImages.length > 0) {
        console.log("Uploading images...")
        imageUrls = await uploadImages(uploadedImages)
      }

      // Prepare toy data for backend
      const toyData = {
        name: toyName.trim(),
        category: category,
        description: description.trim(),
        units: Number.parseInt(toyUnits) || 1,
        image: imageUrls[0] || "", // Use first image as main image
        // Note: You might need to add ageGroup to your backend schema
        // ageGroup: ageGroup,
        // images: imageUrls, // If you want to store multiple images
      }

      console.log("Creating toy with data:", toyData)

      // Create toy via API
      const result = await createToy(toyData)

      console.log("Toy created successfully:", result)
      alert("Toy added successfully!")

      // Reset form
      setToyName("")
      setCategory("")
      setAgeGroup("")
      setDescription("")
      setToyUnits("")
      setUploadedImages([])

      // Close the form
      onClose();

      // Optionally refresh the page or update parent component
      window.location.reload() // Simple refresh - you can improve this with state management
    } catch (error) {
      console.error("Error adding toy:", error)
      alert(`Failed to add toy: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{ color: "#1E437A" }}
      className="min-h-screen font-sans bg-gray-50 p-6 fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="max-w-7xl pl-32 pt-24 mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-5">Add New Toy</h1>

        <form onSubmit={handleSubmit}>
          {/* Basic Toy Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">Basic Toy Information</h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="toy-name" className="block text-sm font-medium mb-2">
                  Toy Name *
                </label>
                <input
                  id="toy-name"
                  type="text"
                  placeholder="Enter Toy Name"
                  value={toyName}
                  style={{ backgroundColor: "#F9F9FC" }}
                  onChange={(e) => setToyName(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={category}
                    style={{ backgroundColor: "#F9F9FC" }}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Building Blocks">Building Blocks</option>
                    <option value="Puzzles">Puzzles</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Arts & Crafts">Arts & Crafts</option>
                    <option value="Games">Games</option>
                    <option value="Music">Music</option>
                    <option value="Educational">Educational</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Dolls & Figures">Dolls & Figures</option>
                    <option value="Sports">Sports</option>
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
                  <label htmlFor="age-group" className="block text-sm font-medium mb-2">
                    Age Group
                  </label>
                  <select
                    id="age-group"
                    style={{ backgroundColor: "#F9F9FC" }}
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
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  placeholder="Write any additional notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{ backgroundColor: "#F9F9FC" }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label htmlFor="toy-units" className="block text-sm font-medium mb-2">
                  Add Toy Units
                </label>
                <input
                  id="toy-units"
                  type="number"
                  placeholder="Enter toy units"
                  value={toyUnits}
                  min="1"
                  style={{ backgroundColor: "#F9F9FC" }}
                  onChange={(e) => setToyUnits(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Toy Images Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">Toy Images</h2>

            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Upload toy images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50">
                      Choose Files
                    </span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Uploaded Images ({uploadedImages.length})</p>
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
                          type="button"
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
          <div className="flex justify-start gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "#C83C92" }}
              className="flex items-center gap-2 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? "Adding Toy..." : "Add Toy"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}