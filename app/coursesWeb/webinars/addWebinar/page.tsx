"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getAdminToken } from "@/utils/storage";

interface WebinarFormData {
  title: string;
  speaker: string;
  date: string;
  startTime: string;
  duration: string;
  maxRegistrations: string;
  description: string;
  status: "upcoming" | "live" | "completed" | "cancelled";
  url: string;
  thumbnail: string | null;
}

interface ApiError {
  success?: boolean;
  message?: string;
  errors?: Array<{
    type: string;
    path: string;
    msg: string;
    location: string;
  }>;
}

interface WebinarSchedulingPageProps {
  params?: {
    id?: string;
  };
}

const WebinarSchedulingPage: React.FC<WebinarSchedulingPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<WebinarFormData>({
    title: "",
    speaker: "",
    date: "",
    startTime: "",
    duration: "",
    maxRegistrations: "",
    description: "",
    status: "upcoming",
    url: "",
    thumbnail: null,
  });

  useEffect(() => {
    if (params?.id) {
      setIsEditMode(true);
      fetchWebinar(params.id);
    }
  }, [params?.id]);

  const fetchWebinar = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/webinars/${id}`
      );
      const webinar = response.data.data;

      const webinarDate = new Date(webinar.date);
      const formattedDate = webinarDate.toISOString().split("T")[0];

      setFormData({
        title: webinar.title,
        speaker: webinar.speaker,
        date: formattedDate,
        startTime: webinar.startTime,
        duration: webinar.duration.toString(),
        maxRegistrations: webinar.maxRegistrations.toString(),
        description: webinar.description,
        status: webinar.status,
        url: webinar.url,
        thumbnail: webinar.thumbnail,
      });

      // Set thumbnail preview if exists
      if (webinar.thumbnail) {
        setThumbnailPreview(webinar.thumbnail);
      }
    } catch (error) {
      toast.error("Failed to load webinar data");
      console.error("Error fetching webinar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      // ✅ If token is missing, redirect to login page
      router.replace("/admin");

    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    try {
      setUploadingThumbnail(true);

      const thumbnailFormData = new FormData();
      thumbnailFormData.append("thumbnail", file);

      const token = getAdminToken();
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/webinar/thumbnail`,
        thumbnailFormData,
        { headers }
      );
      console.log("Thumbnail upload response:", response);

      // Check if the response has the expected structure
      if (response.data.success) {
        const thumbnailUrl = response.data.data.url;
        console.log("Thumbnail URL extracted:", thumbnailUrl);
        return thumbnailUrl;
      } else {
        throw new Error(response.data.message || "Failed to upload thumbnail");
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      const axiosError = error as AxiosError<ApiError>;
      const errorMsg =
        axiosError.response?.data?.message || "Failed to upload thumbnail";
      toast.error(errorMsg);
      throw error;
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear thumbnail error if it exists
      if (errors.thumbnail) {
        setErrors((prev) => ({ ...prev, thumbnail: "" }));
      }

      // Upload the thumbnail immediately
      try {
        const thumbnailUrl = await handleThumbnailUpload(file);
        console.log(
          "Thumbnail URL returned to handleFileChange:",
          thumbnailUrl
        );

        // Make sure formData is updated with the URL (redundant but failsafe)
        if (thumbnailUrl) {
          setFormData((prev) => ({
            ...prev,
            thumbnail: thumbnailUrl,
          }));
        }
      } catch (error) {
        // Error is already handled in handleThumbnailUpload
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Failed to upload thumbnail",
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Webinar title is required";
    if (!formData.speaker.trim())
      newErrors.speaker = "Speaker name is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Time is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    // if (!formData.maxRegistrations)
    //   newErrors.maxRegistrations = "Max registrations is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.url.trim()) newErrors.url = "Webinar URL is required";
    if (!formData.thumbnail && !isEditMode)
      newErrors.thumbnail = "Thumbnail is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    try {
      setLoading(true);

      // Prepare webinar data for submission
      const webinarData = {
        title: formData.title,
        speaker: formData.speaker,
        date: formData.date,
        startTime: formData.startTime,
        duration: Number(formData.duration),
        // maxRegistrations: Number(formData.maxRegistrations),
        description: formData.description,
        status: formData.status,
        url: formData.url,
        thumbnail: formData.thumbnail, // This should already contain the uploaded URL
      };

      if (!webinarData.thumbnail) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Please upload a webinar thumbnail",
        }));
        setLoading(false);
        return;
      }

      const token = getAdminToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      };

      if (isEditMode && params?.id) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/webinars/${params.id}`,
          webinarData,
          { headers }
        );
        toast.success("Webinar updated successfully!");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/webinars`,
          webinarData,
          { headers }
        );
        toast.success("Webinar created successfully!");
      }

      //Navigate to Webinars list
      router.push("/coursesWeb/webinars");
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error("Error saving webinar:", axiosError);

      const errorMessage =
        axiosError.response?.data?.message || "Failed to save webinar";
      toast.error(errorMessage);

      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors.reduce(
          (acc, err) => {
            acc[err.path] = err.msg;
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(validationErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/webinars");
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        {isEditMode ? "Edit Webinar" : "Schedule New Webinar"}
      </h1>

      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600 text-sm">
          <span className="text-[#245BA7] cursor-pointer">
            Courses & Webinars
          </span>{" "}
          &gt; <span className="text-[#245BA7] cursor-pointer">Webinars</span>{" "}
          &gt;{" "}
          <span className="text-[#667085]">
            {isEditMode ? "Edit" : "Schedule"}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 flex items-center gap-1"
            disabled={loading || uploadingThumbnail}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg flex items-center gap-1"
            disabled={loading || uploadingThumbnail}
          >
            {loading || uploadingThumbnail
              ? uploadingThumbnail
                ? "Uploading..."
                : "Saving..."
              : isEditMode
                ? "Update Webinar"
                : "Save Webinar"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="w-full lg:w-2/3">
            {/* General Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                General Information
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Webinar Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Type webinar title here..."
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full border text-gray-700 ${errors.title ? "border-red-500" : "border-gray-300"
                    } bg-[#F9F9FC] p-2 rounded-md`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Speaker Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="speaker"
                  placeholder="Type speaker name here..."
                  value={formData.speaker}
                  onChange={handleChange}
                  className={`w-full border text-gray-700 ${errors.speaker ? "border-red-500" : "border-gray-300"
                    } bg-[#F9F9FC] p-2 rounded-md`}
                />
                {errors.speaker && (
                  <p className="text-red-500 text-xs mt-1">{errors.speaker}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full border text-gray-700 ${errors.date ? "border-red-500" : "border-gray-300"
                        } bg-[#F9F9FC] p-2 rounded-md pr-8`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full border text-gray-700 ${errors.startTime ? "border-red-500" : "border-gray-300"
                        } bg-[#F9F9FC] p-2 rounded-md pr-8`}
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`w-full border text-gray-700 ${errors.duration ? "border-red-500" : "border-gray-300"
                      } bg-[#F9F9FC] p-2 rounded-md`}
                  >
                    <option value="">Select webinar duration</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">2 hours</option>
                  </select>
                  {errors.duration && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Maximum Registrations <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="maxRegistrations"
                    value={formData.maxRegistrations}
                    onChange={handleChange}
                    className={`w-full border text-gray-700 ${errors.maxRegistrations ? 'border-red-500' : 'border-gray-300'} bg-[#F9F9FC] p-2 rounded-md`}
                  >
                    <option value="">Select maximum registrations</option>
                    <option value="50">50 attendees</option>
                    <option value="100">100 attendees</option>
                    <option value="200">200 attendees</option>
                    <option value="500">500 attendees</option>
                    <option value="1000">1000 attendees</option>
                  </select>
                  {errors.maxRegistrations && <p className="text-red-500 text-xs mt-1">{errors.maxRegistrations}</p>}
                </div> */}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Webinar Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Type webinar description here..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full border text-gray-700 ${errors.description ? "border-red-500" : "border-gray-300"
                    } bg-[#F9F9FC] p-2 rounded-md h-32`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Media */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Media</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Webinar URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="url"
                  placeholder="Enter webinar URL here..."
                  value={formData.url}
                  onChange={handleChange}
                  className={`w-full border text-gray-700 ${errors.url ? "border-red-500" : "border-gray-300"
                    } bg-[#F9F9FC] p-2 rounded-md`}
                />
                {errors.url && (
                  <p className="text-red-500 text-xs mt-1">{errors.url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Webinar Thumbnail
                  <span className="text-red-500 ml-1">
                    {!isEditMode && "*"}
                  </span>
                  {(formData.thumbnail || thumbnailPreview) && (
                    <span className="text-green-600 text-xs ml-2">
                      {thumbnailFile
                        ? "(New thumbnail selected)"
                        : "(Current thumbnail exists)"}
                    </span>
                  )}
                </label>
                <label className="border border-dashed bg-[#F9F9FC] text-[#858D9D] border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />

                  {thumbnailPreview ? (
                    <div className="mb-2 flex flex-col items-center">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-40 h-32 object-cover rounded-md mb-3"
                      />
                      <p className="text-sm text-green-600">
                        {thumbnailFile
                          ? `Selected: ${thumbnailFile.name}`
                          : "Current thumbnail"}
                      </p>
                    </div>
                  ) : formData.thumbnail ? (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Current thumbnail will be kept
                      </p>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-10 h-10 text-blue-500 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <p className="text-sm mb-3 text-[#858D9D]">
                        Drag and drop image here, or click to browse
                      </p>
                    </>
                  )}

                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                    {thumbnailPreview || formData.thumbnail
                      ? "Change Image"
                      : "Add Image"}
                  </span>
                </label>
                {errors.thumbnail && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.thumbnail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3">
            {/* Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Status</h2>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Webinar Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border text-gray-700 border-gray-300 bg-[#F9F9FC] p-2 rounded-md appearance-none pr-8"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WebinarSchedulingPage;
