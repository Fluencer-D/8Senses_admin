"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  X,
  Save,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { getAdminToken } from "@/utils/storage";
import { useRouter } from "next/navigation"


interface Workshop {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  memberDiscount: number;
  category: "cooking" | "fitness" | "wellness" | "mindfulness" | "nutrition";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  image: string;
  materials: string[];
  prerequisites: string[];
  registeredUsers: string[];
  availableSpots: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "cooking",
  "fitness",
  "wellness",
  "mindfulness",
  "nutrition",
];
const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];

export default function WorkshopAdminPanel() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    maxParticipants: 20,
    price: 0,
    memberDiscount: 20,
    category: "cooking" as Workshop["category"],
    status: "upcoming" as Workshop["status"],
    image: "",
    materials: [""],
    prerequisites: [""],
  });

  // Fetch all workshops
  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/workshops/all`,
        {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setWorkshops(data.data);
      }
    } catch (error) {
      console.error("Error fetching workshops:", error);
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

  // Create workshop
  const createWorkshop = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/workshops`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            materials: formData.materials.filter(
              (material) => material.trim() !== ""
            ),
            prerequisites: formData.prerequisites.filter(
              (prereq) => prereq.trim() !== ""
            ),
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchWorkshops();
        setCurrentView("list");
        resetForm();
        alert("Workshop created successfully!");
      } else {
        alert("Error creating workshop");
      }
    } catch (error) {
      console.error("Error creating workshop:", error);
      alert("Error creating workshop");
    }
  };

  // Update workshop
  const updateWorkshop = async () => {
    if (!selectedWorkshop) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/workshops/${selectedWorkshop._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            materials: formData.materials.filter(
              (material) => material.trim() !== ""
            ),
            prerequisites: formData.prerequisites.filter(
              (prereq) => prereq.trim() !== ""
            ),
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchWorkshops();
        setCurrentView("list");
        resetForm();
        alert("Workshop updated successfully!");
      } else {
        alert("Error updating workshop");
      }
    } catch (error) {
      console.error("Error updating workshop:", error);
      alert("Error updating workshop");
    }
  };

  // Delete workshop
  const deleteWorkshop = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workshop?")) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/workshops/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchWorkshops();
        alert("Workshop deleted successfully!");
      } else {
        alert("Error deleting workshop");
      }
    } catch (error) {
      console.error("Error deleting workshop:", error);
      alert("Error deleting workshop");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructor: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      maxParticipants: 20,
      price: 0,
      memberDiscount: 20,
      category: "cooking",
      status: "upcoming",
      image: "",
      materials: [""],
      prerequisites: [""],
    });
    setSelectedWorkshop(null);
  };

  const handleEdit = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      instructor: workshop.instructor,
      date: workshop.date.split("T")[0], // Format date for input
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location,
      maxParticipants: workshop.maxParticipants,
      price: workshop.price,
      memberDiscount: workshop.memberDiscount,
      category: workshop.category,
      status: workshop.status,
      image: workshop.image,
      materials: workshop.materials.length > 0 ? workshop.materials : [""],
      prerequisites:
        workshop.prerequisites.length > 0 ? workshop.prerequisites : [""],
    });
    setCurrentView("edit");
  };

  const handleView = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setCurrentView("view");
  };

  const addArrayField = (field: "materials" | "prerequisites") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "materials" | "prerequisites",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayField = (
    field: "materials" | "prerequisites",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="w-4 h-4" />;
      case "ongoing":
        return <PlayCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "cooking":
        return "bg-orange-100 text-orange-800";
      case "fitness":
        return "bg-green-100 text-green-800";
      case "wellness":
        return "bg-purple-100 text-purple-800";
      case "mindfulness":
        return "bg-indigo-100 text-indigo-800";
      case "nutrition":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || workshop.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "" || workshop.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl font-semibold text-gray-800">
            Loading workshops...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br font-sans mt-10 ml-[300px] from-slate-50 to-slate-100">
      {/* Header */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Workshop Management
              </h1>
              <p className="text-lg text-slate-600">
                Manage your workshop collection and registrations
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setCurrentView("list");
                  resetForm();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${currentView === "list"
                    ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-300"
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                All Workshops ({workshops.length})
              </button>
              <button
                onClick={() => {
                  setCurrentView("create");
                  resetForm();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${currentView === "create"
                    ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-300"
                  }`}
              >
                <Plus className="w-4 h-4" />
                Add New Workshop
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {currentView === "list" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Workshops
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {workshops.length}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Upcoming
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {workshops.filter((w) => w.status === "upcoming").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Participants
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {workshops.reduce(
                        (sum, w) => sum + w.currentParticipants,
                        0
                      )}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Revenue
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      ₹
                      {workshops
                        .reduce(
                          (sum, w) => sum + w.price * w.currentParticipants,
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  {/* <DollarSign className="w-8 h-8 text-emerald-600" /> */}
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-slate-200">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Search Workshops
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by title, instructor, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="lg:w-48">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-5 py-4 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:w-48">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-5 py-4 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">All Status</option>
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Workshop Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredWorkshops.map((workshop) => (
                <div
                  key={workshop._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
                >
                  <div className="relative h-48">
                    <Image
                      src={workshop.image || "/placeholder.svg"}
                      alt={workshop.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${getCategoryColor(
                          workshop.category
                        )}`}
                      >
                        {workshop.category}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(
                          workshop.status
                        )}`}
                      >
                        {getStatusIcon(workshop.status)}
                        {workshop.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-2">
                      {workshop.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {workshop.instructor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(workshop.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {workshop.startTime} - {workshop.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{workshop.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-6 bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">
                          {workshop.currentParticipants}/
                          {workshop.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* <DollarSign className="w-4 h-4" /> */}
                        <span className="font-medium">₹{workshop.price}</span>
                      </div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {workshop.memberDiscount}% off
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(workshop)}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(workshop)}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteWorkshop(workshop._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredWorkshops.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="w-24 h-24 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  No workshops found
                </h3>
                <p className="text-lg text-slate-600">
                  Try adjusting your search or create a new workshop.
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === "view" && selectedWorkshop && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Workshop Details
                    </h2>
                    <p className="text-slate-600 mt-1">
                      View workshop information and registrations
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView("list")}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Image
                    src={selectedWorkshop.image || "/placeholder.svg"}
                    alt={selectedWorkshop.title}
                    width={500}
                    height={300}
                    className="rounded-xl object-cover w-full h-64"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {selectedWorkshop.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedWorkshop.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 text-sm font-bold rounded-full ${getCategoryColor(
                        selectedWorkshop.category
                      )}`}
                    >
                      {selectedWorkshop.category}
                    </span>
                    <span
                      className={`flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(
                        selectedWorkshop.status
                      )}`}
                    >
                      {getStatusIcon(selectedWorkshop.status)}
                      {selectedWorkshop.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900">Instructor</p>
                        <p className="text-slate-600">
                          {selectedWorkshop.instructor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900">Date</p>
                        <p className="text-slate-600">
                          {new Date(selectedWorkshop.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900">Time</p>
                        <p className="text-slate-600">
                          {selectedWorkshop.startTime} -{" "}
                          {selectedWorkshop.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900">Location</p>
                        <p className="text-slate-600">
                          {selectedWorkshop.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900">
                          Participants
                        </p>
                        <p className="text-slate-600">
                          {selectedWorkshop.currentParticipants}/
                          {selectedWorkshop.maxParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <DollarSign className="w-4 h-4 text-slate-500" /> */}
                      <div>
                        <p className="font-medium text-slate-900">Price</p>
                        <p className="text-slate-600">
                          ₹{selectedWorkshop.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedWorkshop.materials.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">
                    Materials Needed
                  </h4>
                  <ul className="space-y-2">
                    {selectedWorkshop.materials.map((material, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-700">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedWorkshop.prerequisites.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">
                    Prerequisites
                  </h4>
                  <ul className="space-y-2">
                    {selectedWorkshop.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-700">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {(currentView === "create" || currentView === "edit") && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {currentView === "create" ? (
                  <Plus className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Edit3 className="w-6 h-6 text-indigo-600" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {currentView === "create"
                      ? "Create New Workshop"
                      : "Edit Workshop"}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {currentView === "create"
                      ? "Add a new workshop to your collection"
                      : "Update workshop details and information"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Basic Information
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Workshop Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter workshop title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none"
                      placeholder="Describe your workshop"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Instructor
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.instructor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            instructor: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Instructor name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as Workshop["category"],
                          }))
                        }
                        className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as Workshop["status"],
                          }))
                        }
                        className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          image: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>

                {/* Schedule & Pricing */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Schedule & Pricing
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                          className="w-full pl-12 pr-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          className="w-full pl-12 pr-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Workshop location"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Max Participants
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="number"
                          value={formData.maxParticipants}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxParticipants:
                                Number.parseInt(e.target.value) || 20,
                            }))
                          }
                          min="1"
                          className="w-full pl-12 pr-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Price (₹)
                      </label>
                      <div className="relative">
                        {/* <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" /> */}
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          min="0"
                          step="0.01"
                          className="w-full pl-12 pr-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Member Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.memberDiscount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          memberDiscount: Number.parseInt(e.target.value) || 20,
                        }))
                      }
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Materials Needed
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField("materials")}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add Material
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) =>
                          updateArrayField("materials", index, e.target.value)
                        }
                        className="flex-1 px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder={`Material ${index + 1}`}
                      />
                      {formData.materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField("materials", index)}
                          className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Prerequisites
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField("prerequisites")}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add Prerequisite
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-12 bg-indigo-100 text-indigo-800 rounded-xl flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={prereq}
                        onChange={(e) =>
                          updateArrayField(
                            "prerequisites",
                            index,
                            e.target.value
                          )
                        }
                        className="flex-1 px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder={`Prerequisite ${index + 1}`}
                      />
                      {formData.prerequisites.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayField("prerequisites", index)
                          }
                          className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView("list");
                    resetForm();
                  }}
                  className="flex items-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-700 font-bold text-lg rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={
                    currentView === "create" ? createWorkshop : updateWorkshop
                  }
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {currentView === "create"
                    ? "Create Workshop"
                    : "Update Workshop"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
