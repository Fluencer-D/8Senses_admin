"use client"
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/utils/storage';
// Define types to match the MongoDB schema
interface VideoData {
  title: string;
  url: string;  
  duration: number;
  description?: string;
  isPreview: boolean;
}

interface CourseData {
  title: string;
  instructor: string;
  price: string;
  description: string;
  summary: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  status: 'draft' | 'published' | 'archived' | 'active';
  thumbnail: string;
  videos: VideoData[];
  duration: string;
  prerequisites: string[];
  objectives: string[];
  tags: string[];
  featured: boolean;
}

interface ApiErrorResponse {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Array<{
    msg: string;
    param: string;
  }>;
}

const CourseCreationPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // State variables for form fields
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    instructor: "",
    price: "",
    description: "",
    summary: "",
    category: "",
    level: "all-levels",
    status: "draft",
    thumbnail: "",
    videos: [],
    duration: "Self-paced",
    prerequisites: [],
    objectives: [],
    tags: [],
    featured: false
  });
  
  // File states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<string>("");
  const [videoDescription, setVideoDescription] = useState<string>("");
  const [isPreview, setIsPreview] = useState<boolean>(false);
  
  // State for prerequisites, objectives, and tags
  const [prerequisite, setPrerequisite] = useState<string>("");
  const [objective, setObjective] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  
  // Check if the form is valid (all required fields are filled)
  const isFormValid = (): boolean => {
    return !!(
      courseData.title &&
      courseData.price &&
      courseData.description &&
      courseData.category &&
      courseData.thumbnail
    );
  };
  
  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setCourseData({
      ...courseData,
      [name]: checked
    });
  };

    useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      // ✅ If token is missing, redirect to login page
      router.replace("/admin");
      
    }
  }, [router]);

  // Handle thumbnail upload
  const handleThumbnailChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setThumbnailFile(file);
  
      try {
        const formData = new FormData();
        formData.append("thumbnail", file);
  
        const token = getAdminToken();
  
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/course/thumbnail`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        const data = await res.json();
  
        if (!res.ok || !data.success || !data.data?.url) {
          throw new Error(data.error || "Failed to upload thumbnail");
        }
  
        console.log("📸 Thumbnail uploaded:", data.data.url);
  
        setCourseData((prev) => ({
          ...prev,
          thumbnail: data.data.url,
        }));
      } catch (err) {
        setError("Thumbnail upload failed");
        console.error(err);
      }
    }
  };
  
  
  // Handle video upload
  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setVideoFile(file);
    }
  };

  // Update the handleAddVideo function
const handleAddVideo = async (): Promise<void> => {
  if (!videoFile || !videoTitle.trim()) {
    setError("Video file and title are required");
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("video", videoFile);

    const token = getAdminToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/course/video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    console.log("📼 Video upload response:", data);

    if (!res.ok) {
      throw new Error(data.error || "Failed to upload video");
    }

    // Check for different possible response structures
    const uploadedUrl = data?.data?.url || data?.url || data?.videoUrl;
    if (!uploadedUrl) {
      throw new Error("Video URL not found in response");
    }

    const newVideo: VideoData = {
      url: uploadedUrl,
      title: videoTitle.trim(),
      duration: parseInt(videoDuration) || 0,
      description: videoDescription.trim(),
      isPreview,
    };

    setCourseData((prev) => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));

    // Reset inputs
    setVideoFile(null);
    setVideoTitle("");
    setVideoDuration("");
    setVideoDescription("");
    setIsPreview(false);

    console.log("✅ Video added to course:", newVideo);
  } catch (err) {
    console.error("❌ Error uploading video:", err);
    setError(err instanceof Error ? err.message : "Video upload failed");
  } finally {
    setIsLoading(false);
  }
};
  
  

  // Remove a video from the videos array
  const handleRemoveVideo = (index: number): void => {
    const updatedVideos = [...courseData.videos];
    updatedVideos.splice(index, 1);
    setCourseData({
      ...courseData,
      videos: updatedVideos
    });
  };

  // Add prerequisite
  const handleAddPrerequisite = (): void => {
    if (prerequisite.trim()) {
      setCourseData({
        ...courseData,
        prerequisites: [...courseData.prerequisites, prerequisite.trim()]
      });
      setPrerequisite("");
    }
  };

  // Remove prerequisite
  const handleRemovePrerequisite = (index: number): void => {
    const updatedPrerequisites = [...courseData.prerequisites];
    updatedPrerequisites.splice(index, 1);
    setCourseData({
      ...courseData,
      prerequisites: updatedPrerequisites
    });
  };

  // Add objective
  const handleAddObjective = (): void => {
    if (objective.trim()) {
      setCourseData({
        ...courseData,
        objectives: [...courseData.objectives, objective.trim()]
      });
      setObjective("");
    }
  };

  // Remove objective
  const handleRemoveObjective = (index: number): void => {
    const updatedObjectives = [...courseData.objectives];
    updatedObjectives.splice(index, 1);
    setCourseData({
      ...courseData,
      objectives: updatedObjectives
    });
  };

  // Add tag
  const handleAddTag = (): void => {
    if (tag.trim()) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, tag.trim()]
      });
      setTag("");
    }
  };

  // Remove tag
  const handleRemoveTag = (index: number): void => {
    const updatedTags = [...courseData.tags];
    updatedTags.splice(index, 1);
    setCourseData({
      ...courseData,
      tags: updatedTags
    });
  };

  // Handle cancel button click
  const handleCancel = (): void => {
    if (window.confirm("Are you sure you want to cancel? All changes will be lost.")) {
      router.push('ecommerce/courses'); // Navigate to courses list
    }
  };

  // Handle form submission
  const handleSave = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Retrieve the auth token from wherever you store it (localStorage, context, etc.)
      const token = getAdminToken(); // Or however you store your token
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add authentication token
        },
        body: JSON.stringify({
          title: courseData.title,
          instructor: courseData.instructor,
          price: parseFloat(courseData.price),
          description: courseData.description,
          summary: courseData.summary,
          category: courseData.category,
          level: courseData.level,
          status: courseData.status,
          thumbnail: courseData.thumbnail,
          duration: courseData.duration,
          prerequisites: courseData.prerequisites,
          objectives: courseData.objectives,
          tags: courseData.tags,
          featured: courseData.featured,
          videos: courseData.videos
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
      }
    
      const result = await response.json();
    
      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.message ||
          result.error ||
          (result.errors && result.errors.map((e: { msg: string }) => e.msg).join(', ')) ||
          'Failed to create course'
        );
      }
      
    
      alert('Course created successfully!');
      router.push('/courses');
    
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the course');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto">
      {/* Header */}
      <h1 className="text-[#333843] text-3xl">Course Details</h1>
      <div className="flex justify-between items-center mb-4">
        {/* Breadcrumbs */}
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer">Learning</span> &gt;{" "}
          <span className="text-blue-600 cursor-pointer">Courses</span> &gt;{" "}
          <span className="text-gray-800 font-semibold">Add Course</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleCancel} 
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 flex items-center gap-1"
            disabled={isLoading}
            type="button"
          >
            ✖ Cancel
          </button>
          <button 
            onClick={handleSave} 
            className={`px-4 py-2 bg-[#C83C92] text-white rounded-lg flex items-center gap-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || !isFormValid()}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 2.5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V7.47072C17.5 6.80768 17.2366 6.17179 16.7678 5.70295L14.297 3.23223C13.8282 2.76339 13.1923 2.5 12.5293 2.5H5ZM12.5293 4.16667H12.5V5.83333C12.5 6.75381 11.7538 7.5 10.8333 7.5H7.5C6.57953 7.5 5.83333 6.75381 5.83333 5.83333V4.16667H5C4.53976 4.16667 4.16667 4.53976 4.16667 5V15C4.16667 15.4602 4.53976 15.8333 5 15.8333H5.83333V10.8333C5.83333 9.91286 6.57953 9.16667 7.5 9.16667H12.5C13.4205 9.16667 14.1667 9.91286 14.1667 10.8333V15.8333H15C15.4602 15.8333 15.8333 15.4602 15.8333 15V7.47072C15.8333 7.24971 15.7455 7.03774 15.5893 6.88146L13.1185 4.41074C12.9623 4.25446 12.7503 4.16667 12.5293 4.16667ZM12.5 15.8333V10.8333H7.5V15.8333H12.5ZM7.5 4.16667H10.8333V5.83333H7.5V4.16667Z" fill="white"/>
            </svg> 
            {isLoading ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>{error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full md:w-2/3">
          {/* General Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#333843] mb-4">General Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Course Title*</label>
              <input
                type="text"
                name="title"
                placeholder="Type course name here..."
                value={courseData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
                required
                maxLength={100}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Instructor name</label>
              <input
                type="text"
                name="instructor"
                placeholder="Type instructor name here..."
                value={courseData.instructor}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Price*</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  placeholder="Type base price here..."
                  value={courseData.price}
                  onChange={handleInputChange}
                  className="w-full border text-[#858D9D] bg-[#F9F9FC] border-gray-300 p-2 pl-6 rounded-md"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Course Description*</label>
              <textarea
                name="description"
                placeholder="Type course description here..."
                value={courseData.description}
                onChange={handleInputChange}
                className="w-full border text-[#858D9D] bg-[#F9F9FC] border-gray-300 p-2 rounded-md h-32"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Course Summary</label>
              <textarea
                name="summary"
                placeholder="Type a brief summary of the course (max 500 characters)..."
                value={courseData.summary}
                onChange={handleInputChange}
                className="w-full border text-[#858D9D] bg-[#F9F9FC] border-gray-300 p-2 rounded-md h-20"
                maxLength={500}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Course Duration</label>
              <input
                type="text"
                name="duration"
                placeholder="e.g., Self-paced, 6 weeks, etc."
                value={courseData.duration}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center text-sm font-medium text-[#1E437A]">
                <input
                  type="checkbox"
                  name="featured"
                  checked={courseData.featured}
                  onChange={handleCheckboxChange}
                  className="mr-2 h-4 w-4"
                />
                Feature this course
              </label>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Media</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-blue-800 mb-2">Upload Course Thumbnail*</label>
              <div 
                className={`border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center ${courseData.thumbnail ? 'bg-gray-50' : ''}`}
              >
                {courseData.thumbnail ? (
  <div className="relative w-full">
    <img
      src={courseData.thumbnail}
      alt="Thumbnail preview"
      className="max-h-48 mx-auto object-contain rounded-md"
    />
    <button 
      onClick={() => {
        setCourseData({ ...courseData, thumbnail: "" });
        setThumbnailFile(null);
      }}
      className="mt-2 text-red-600 hover:text-red-800"
      type="button"
    >
      Remove Image
    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="text-gray-500 text-sm mb-3">Drag and drop image here, or click add image</p>
                    <label className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                      Add Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Learning Objectives & Prerequisites</h2>
            
            {/* Prerequisites */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Prerequisites</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={prerequisite}
                  onChange={(e) => setPrerequisite(e.target.value)}
                  placeholder="Add a prerequisite"
                  className="flex-grow border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
                />
                <button
                  onClick={handleAddPrerequisite}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  type="button"
                >
                  Add
                </button>
              </div>
              
              {courseData.prerequisites.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {courseData.prerequisites.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemovePrerequisite(index)}
                        className="text-red-600"
                        type="button"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Objectives */}
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Learning Objectives</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Add a learning objective"
                  className="flex-grow border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
                />
                <button
                  onClick={handleAddObjective}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  type="button"
                >
                  Add
                </button>
              </div>
              
              {courseData.objectives.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {courseData.objectives.map((item, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemoveObjective(index)}
                        className="text-red-600"
                        type="button"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Video Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Course Videos</h2>
            
            {/* Video Upload Form */}
            <div className="mb-6 border-b pb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1E437A] mb-1">Video Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1E437A] mb-1">Video Duration (minutes)</label>
                <input
                  type="number"
                  value={videoDuration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoDuration(e.target.value)}
                  placeholder="Enter duration in minutes"
                  className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1E437A] mb-1">Video Description</label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Enter video description"
                  className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md h-20"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-[#1E437A]">
                  <input
                    type="checkbox"
                    checked={isPreview}
                    onChange={(e) => setIsPreview(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  Mark as preview video (available without enrollment)
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1E437A] mb-1">Upload Video</label>
                <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center">
                  <svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-gray-500 text-sm mb-3">
                    {videoFile ? videoFile.name : "Drag and drop video here, or click add video"}
                  </p>
                  <label className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                    {videoFile ? "Change Video" : "Add Video"}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleAddVideo}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                disabled={!videoFile || !videoTitle}
                type="button"
              >
                Add Video to Course
              </button>
            </div>
            
            {/* Video List */}
            <div>
  <h3 className="text-md font-medium text-[#333843] mb-2">Added Videos</h3>
  {courseData.videos.length === 0 ? (
    <p className="text-gray-500">No videos added yet</p>
  ) : (
    <ul className="space-y-2">
      {courseData.videos.map((video, index) => (
        <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
          <div>
            <p className="font-medium text-gray-800">{video.title}</p>
            <p className="text-sm text-gray-500">
              Duration: {video.duration} min
            </p>
            {video.isPreview && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                Preview
              </span>
            )}
            <div className="mt-1">
              <span className="text-xs text-gray-500 truncate block max-w-xs">
                URL: {video.url}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleRemoveVideo(index)}
            className="text-red-600 hover:text-red-800"
            type="button"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )}
</div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/3">
          {/* Category */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Category</h2>
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Course Category*</label>
              <div className="relative">
                <select
                  name="category"
                  value={courseData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded-md appearance-none text-[#858D9D] bg-[#F9F9FC] pr-8"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="therapy">Therapy</option>
                  <option value="mental health">Mental Health</option>
                  <option value="parenting">Parenting</option>
                  <option value="education">Education</option>
                  <option value="counseling">Counseling</option>
                  <option value="wellness">Wellness</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Level */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Course Level</h2>
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Difficulty Level</label>
              <div className="relative">
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded-md appearance-none text-[#858D9D] bg-[#F9F9FC] pr-8"
                >
                  <option value="all-levels">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Status</h2>
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Course Status</label>
              <div className="relative">
                <select
                  name="status"
                  value={courseData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded-md appearance-none text-[#858D9D] bg-[#F9F9FC] pr-8"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="active">Active</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Tags</h2>
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Course Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-grow border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  type="button"
                >
                  Add
                </button>
              </div>
              
              {courseData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {courseData.tags.map((item, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="ml-2 text-blue-600"
                        type="button"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Form Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-[#333843] mb-4">Form Status</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Required fields: </span>
                {!courseData.title || !courseData.price || !courseData.description || !courseData.category || !courseData.thumbnail ? (
                  <span className="text-red-500">Missing required fields</span>
                ) : (
                  <span className="text-green-500">All required fields complete</span>
                )}
              </p>
              <p className="text-sm">
                <span className="font-medium">Videos: </span>
                {courseData.videos.length} added
              </p>
              <p className="text-sm">
                <span className="font-medium">Prerequisites: </span>
                {courseData.prerequisites.length} added
              </p>
              <p className="text-sm">
                <span className="font-medium">Learning Objectives: </span>
                {courseData.objectives.length} added
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  * Fields marked with an asterisk are required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreationPage;