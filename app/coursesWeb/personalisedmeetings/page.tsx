"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  User,
  Link,
  X,
  Save,
  ArrowLeft,
  Eye,
  Users,
  Tag,
  CheckCircle,
  Hourglass,
  XCircle,
} from "lucide-react";

interface Meeting {
  _id: string;
  title: string;
  meetLink: string;
  date: string; // ISO date string
  startTime: string; // e.g., "10:00 AM"
  endTime: string; // e.g., "11:00 AM"
  approxDuration: string; // e.g., "60 minutes"
  hostDoctor: string;
  associatedPlans: string[]; // e.g., ["prime", "basic"]
  createdAt: string;
  updatedAt: string;
}

const PLAN_OPTIONS = ["basic", "premium", "both"]; // Example plans

export default function MeetingAdminPanel() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    meetLink: "",
    date: "",
    startTime: "",
    endTime: "",
    approxDuration: "",
    hostDoctor: "",
    associatedPlans: [] as string[],
  });

  // API Base URL (adjust if your Express server is on a different port/domain)
  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/meetings`; // Assuming Express server runs on port 5000

  // Fetch all meetings
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      if (data.success) {
        setMeetings(data.data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      alert("Error fetching meetings");
    } finally {
      setLoading(false);
    }
  };

  // Create meeting
  const createMeeting = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          associatedPlans: formData.associatedPlans.filter(
            (plan) => plan.trim() !== ""
          ),
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchMeetings();
        setCurrentView("list");
        resetForm();
        alert("Meeting created successfully!");
      } else {
        alert(`Error creating meeting: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Error creating meeting");
    }
  };

  // Update meeting
  const updateMeeting = async () => {
    if (!selectedMeeting) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${selectedMeeting._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          associatedPlans: formData.associatedPlans.filter(
            (plan) => plan.trim() !== ""
          ),
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchMeetings();
        setCurrentView("list");
        resetForm();
        alert("Meeting updated successfully!");
      } else {
        alert(`Error updating meeting: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert("Error updating meeting");
    }
  };

  // Delete meeting
  const deleteMeeting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await fetchMeetings();
        alert("Meeting deleted successfully!");
      } else {
        alert(`Error deleting meeting: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Error deleting meeting");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      meetLink: "",
      date: "",
      startTime: "",
      endTime: "",
      approxDuration: "",
      hostDoctor: "",
      associatedPlans: [],
    });
    setSelectedMeeting(null);
  };

  const handleEdit = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title || "",
      meetLink: meeting.meetLink,
      date: meeting.date.split("T")[0], // Format date for input
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      approxDuration: meeting.approxDuration,
      hostDoctor: meeting.hostDoctor,
      associatedPlans:
        meeting.associatedPlans.length > 0 ? meeting.associatedPlans : [],
    });
    setCurrentView("edit");
  };

  const handleView = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCurrentView("view");
  };

  const addAssociatedPlanField = () => {
    setFormData((prev) => ({
      ...prev,
      associatedPlans: [...prev.associatedPlans, ""],
    }));
  };

  const removeAssociatedPlanField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      associatedPlans: prev.associatedPlans.filter((_, i) => i !== index),
    }));
  };

  const updateAssociatedPlanField = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      associatedPlans: prev.associatedPlans.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const meetingDate = new Date(meeting.date);
    const [startHour, startMinute] = meeting.startTime.split(":").map(Number);
    const [endHour, endMinute] = meeting.endTime.split(":").map(Number);

    const meetingStart = new Date(meetingDate);
    meetingStart.setHours(startHour, startMinute, 0, 0);

    const meetingEnd = new Date(meetingDate);
    meetingEnd.setHours(endHour, endMinute, 0, 0);

    if (now < meetingStart) {
      return {
        status: "Upcoming",
        icon: <Hourglass className="w-3 h-3" />,
        color: "bg-blue-100 text-blue-800",
      };
    } else if (now >= meetingStart && now <= meetingEnd) {
      return {
        status: "Ongoing",
        icon: <CheckCircle className="w-3 h-3" />,
        color: "bg-green-100 text-green-800",
      };
    } else {
      return {
        status: "Completed",
        icon: <XCircle className="w-3 h-3" />,
        color: "bg-gray-100 text-gray-800",
      };
    }
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.hostDoctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.meetLink.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlan =
        selectedPlanFilter === "" ||
        meeting.associatedPlans.includes(selectedPlanFilter);

      const { status: meetingStatus } = getMeetingStatus(meeting);
      const matchesStatus =
        selectedStatusFilter === "" || meetingStatus === selectedStatusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [meetings, searchTerm, selectedPlanFilter, selectedStatusFilter]);

  const totalMeetings = meetings.length;
  const upcomingMeetings = meetings.filter(
    (m) => getMeetingStatus(m).status === "Upcoming"
  ).length;
  const ongoingMeetings = meetings.filter(
    (m) => getMeetingStatus(m).status === "Ongoing"
  ).length;
  const completedMeetings = meetings.filter(
    (m) => getMeetingStatus(m).status === "Completed"
  ).length;
  const uniqueDoctors = new Set(meetings.map((m) => m.hostDoctor)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 font-sans mt-12 ml-[300px] to-slate-100">
      {/* Header */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Meeting Management
              </h1>
              <p className="text-lg text-slate-600">
                Schedule and oversee your virtual consultations
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setCurrentView("list");
                  resetForm();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  currentView === "list"
                    ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-300"
                }`}
              >
                <Calendar className="w-4 h-4" />
                All Meetings ({meetings.length})
              </button>
              <button
                onClick={() => {
                  setCurrentView("create");
                  resetForm();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  currentView === "create"
                    ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-300"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add New Meeting
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
                      Total Meetings
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {totalMeetings}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Upcoming
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {upcomingMeetings}
                    </p>
                  </div>
                  <Hourglass className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Ongoing
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {ongoingMeetings}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Unique Doctors
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {uniqueDoctors}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-slate-200">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Search Meetings
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by title, doctor, or link..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="lg:w-48">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Filter by Plan
                  </label>
                  <select
                    value={selectedPlanFilter}
                    onChange={(e) => setSelectedPlanFilter(e.target.value)}
                    className="w-full px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">All Plans</option>
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:w-48">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Filter by Status
                  </label>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    {["Upcoming", "Ongoing", "Completed"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Meeting Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredMeetings.map((meeting) => {
                const { status, icon, color } = getMeetingStatus(meeting);
                return (
                  <div
                    key={meeting._id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-xl text-slate-900 line-clamp-2">
                          {meeting.title || "Untitled Meeting"}
                        </h3>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${color}`}
                        >
                          {icon}
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {meeting.hostDoctor}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(meeting.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {meeting.startTime} - {meeting.endTime} (
                          {meeting.approxDuration})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-4">
                        <Link className="w-4 h-4" />
                        <a
                          href={meeting.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline truncate"
                        >
                          {meeting.meetLink}
                        </a>
                      </div>
                      {meeting.associatedPlans.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {meeting.associatedPlans.map((plan) => (
                            <span
                              key={plan}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"
                            >
                              <Tag className="w-3 h-3" />
                              {plan.charAt(0).toUpperCase() + plan.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(meeting)}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(meeting)}
                          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMeeting(meeting._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMeetings.length === 0 && (
              <div className="text-center py-20">
                <Calendar className="w-24 h-24 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  No meetings found
                </h3>
                <p className="text-lg text-slate-600">
                  Try adjusting your search or create a new meeting.
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === "view" && selectedMeeting && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Meeting Details
                    </h2>
                    <p className="text-slate-600 mt-1">
                      Comprehensive view of the meeting information
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">
                    {selectedMeeting.title || "Untitled Meeting"}
                  </h3>
                  {/* <p className="text-slate-600 leading-relaxed">
                    {selectedMeeting.description || "No description provided."}
                  </p> */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Host Doctor</p>
                      <p className="text-slate-600">
                        {selectedMeeting.hostDoctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Date</p>
                      <p className="text-slate-600">
                        {new Date(selectedMeeting.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Time</p>
                      <p className="text-slate-600">
                        {selectedMeeting.startTime} - {selectedMeeting.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">
                        Approx. Duration
                      </p>
                      <p className="text-slate-600">
                        {selectedMeeting.approxDuration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Link className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Meeting Link</p>
                      <a
                        href={selectedMeeting.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {selectedMeeting.meetLink}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {selectedMeeting.associatedPlans.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    Associated Plans
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedMeeting.associatedPlans.map((plan) => (
                      <span
                        key={plan}
                        className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800"
                      >
                        <Tag className="w-4 h-4" />
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </span>
                    ))}
                  </div>
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
                      ? "Create New Meeting"
                      : "Edit Meeting"}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {currentView === "create"
                      ? "Add a new meeting to your schedule"
                      : "Update meeting details and information"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Meeting Details
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Meeting Title
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder="e.g., Monthly Case Review"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Meeting Link
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.meetLink}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            meetLink: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder="e.g., https://meet.google.com/abc-xyz"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Host Doctor
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.hostDoctor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hostDoctor: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder="e.g., Dr. Emily White"
                      />
                    </div>
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
                        className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
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
                          className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
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
                          className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Approx. Duration
                    </label>
                    <div className="relative">
                      <Hourglass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.approxDuration}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            approxDuration: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder="e.g., 60 minutes, 1 hour"
                      />
                    </div>
                  </div>
                </div>

                {/* Associated Plans */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Users className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Associated Plans
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Select which user plans this meeting is available for. Leave
                    empty for all plans.
                  </p>
                  <div className="space-y-3">
                    {formData.associatedPlans.map((plan, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <select
                          value={plan}
                          onChange={(e) =>
                            updateAssociatedPlanField(index, e.target.value)
                          }
                          className="flex-1 px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        >
                          <option value="">Select Plan</option>
                          {PLAN_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                        {formData.associatedPlans.length > 0 && (
                          <button
                            type="button"
                            onClick={() => removeAssociatedPlanField(index)}
                            className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addAssociatedPlanField}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Plan
                  </button>
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
                    currentView === "create" ? createMeeting : updateMeeting
                  }
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {currentView === "create"
                    ? "Create Meeting"
                    : "Update Meeting"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
