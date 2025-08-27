"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Clock,
  FileText,
  Calendar,
  User,
  X,
  Save,
  ArrowLeft,
  Eye,
  List,
  Leaf,
  Sun,
  Apple,
} from "lucide-react";
import { getAdminToken } from "@/utils/storage";

interface Meal {
  day: string;
  mealPlan: string;
}

interface DetoxPlan {
  _id: string;
  title: string;
  description: string;
  duration: string;
  meals: Meal[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const DURATIONS = ["7 days", "14 days", "21 days", "30 days"];

export default function DetoxAdminPanel() {
  const [detoxPlans, setDetoxPlans] = useState<DetoxPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [selectedDetoxPlan, setSelectedDetoxPlan] = useState<DetoxPlan | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "7 days",
    meals: [{ day: "Day 1", mealPlan: "" }],
  });

  // Fetch all detox plans
  const fetchDetoxPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/detox/detox-plans`,
        {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setDetoxPlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching detox plans:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create detox plan
  const createDetoxPlan = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/detox/create-detox`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            meals: formData.meals.filter(
              (meal) => meal.day.trim() !== "" && meal.mealPlan.trim() !== ""
            ),
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchDetoxPlans();
        setCurrentView("list");
        resetForm();
        alert("Detox plan created successfully!");
      } else {
        alert("Error creating detox plan");
      }
    } catch (error) {
      console.error("Error creating detox plan:", error);
      alert("Error creating detox plan");
    }
  };

  // Update detox plan
  const updateDetoxPlan = async () => {
    if (!selectedDetoxPlan) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/detox/detox-plan/${selectedDetoxPlan._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            meals: formData.meals.filter(
              (meal) => meal.day.trim() !== "" && meal.mealPlan.trim() !== ""
            ),
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchDetoxPlans();
        setCurrentView("list");
        resetForm();
        alert("Detox plan updated successfully!");
      } else {
        alert("Error updating detox plan");
      }
    } catch (error) {
      console.error("Error updating detox plan:", error);
      alert("Error updating detox plan");
    }
  };

  // Delete detox plan
  const deleteDetoxPlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this detox plan?")) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/detox/detox-plan/${id}`,
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
        await fetchDetoxPlans();
        alert("Detox plan deleted successfully!");
      } else {
        alert("Error deleting detox plan");
      }
    } catch (error) {
      console.error("Error deleting detox plan:", error);
      alert("Error deleting detox plan");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "7 days",
      meals: [{ day: "Day 1", mealPlan: "" }],
    });
    setSelectedDetoxPlan(null);
  };

  const handleEdit = (plan: DetoxPlan) => {
    setSelectedDetoxPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      duration: plan.duration,
      meals:
        plan.meals.length > 0 ? plan.meals : [{ day: "Day 1", mealPlan: "" }],
    });
    setCurrentView("edit");
  };

  const handleView = (plan: DetoxPlan) => {
    setSelectedDetoxPlan(plan);
    setCurrentView("view");
  };

  const addMealField = () => {
    const nextDay = formData.meals.length + 1;
    setFormData((prev) => ({
      ...prev,
      meals: [...prev.meals, { day: `Day ${nextDay}`, mealPlan: "" }],
    }));
  };

  const removeMealField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
  };

  const updateMealField = (
    index: number,
    field: "day" | "mealPlan",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.map((meal, i) =>
        i === index ? { ...meal, [field]: value } : meal
      ),
    }));
  };

  useEffect(() => {
    fetchDetoxPlans();
  }, []);

  const filteredDetoxPlans = detoxPlans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDuration =
      selectedDuration === "" || plan.duration === selectedDuration;
    return matchesSearch && matchesDuration;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl font-semibold text-gray-800">
            Loading detox plans...
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
                Detox Plan Management
              </h1>
              <p className="text-lg text-slate-600">
                Curate and manage your healthy detox programs
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
                <List className="w-4 h-4" />
                All Plans ({detoxPlans.length})
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
                Add New Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {currentView === "list" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Detox Plans
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {detoxPlans.length}
                    </p>
                  </div>
                  <Leaf className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Shortest Duration
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {detoxPlans.length > 0
                        ? detoxPlans.reduce((min, p) => {
                            const minDays = Number.parseInt(min.split(" ")[0]);
                            const pDays = Number.parseInt(
                              p.duration.split(" ")[0]
                            );
                            return pDays < minDays ? p.duration : min;
                          }, "999 days")
                        : "N/A"}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Longest Duration
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {detoxPlans.length > 0
                        ? detoxPlans.reduce((max, p) => {
                            const maxDays = Number.parseInt(max.split(" ")[0]);
                            const pDays = Number.parseInt(
                              p.duration.split(" ")[0]
                            );
                            return pDays > maxDays ? p.duration : max;
                          }, "0 days")
                        : "N/A"}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-slate-200">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Search Plans
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="lg:w-64">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Filter by Duration
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full px-5 py-4 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">All Durations</option>
                    {DURATIONS.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detox Plan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredDetoxPlans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl text-slate-900 line-clamp-2">
                        {plan.title}
                      </h3>
                      <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">
                        <Clock className="w-3 h-3" />
                        {plan.duration}
                      </span>
                    </div>
                    <p className="text-slate-600 text-base mb-4 line-clamp-3 leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-6 bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          Created by: {plan.createdBy}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {new Date(plan.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(plan)}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(plan)}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDetoxPlan(plan._id)}
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

            {filteredDetoxPlans.length === 0 && (
              <div className="text-center py-20">
                <Leaf className="w-24 h-24 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  No detox plans found
                </h3>
                <p className="text-lg text-slate-600">
                  Try adjusting your search or create a new plan.
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === "view" && selectedDetoxPlan && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Detox Plan Details
                    </h2>
                    <p className="text-slate-600 mt-1">
                      Comprehensive view of the detox program
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
                    {selectedDetoxPlan.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedDetoxPlan.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Duration</p>
                      <p className="text-slate-600">
                        {selectedDetoxPlan.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Created By</p>
                      <p className="text-slate-600">
                        {selectedDetoxPlan.createdBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Created On</p>
                      <p className="text-slate-600">
                        {new Date(
                          selectedDetoxPlan.createdAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDetoxPlan.meals.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Apple className="w-5 h-5 text-slate-600" />
                    Daily Meal Plan
                  </h4>
                  <div className="space-y-6">
                    {selectedDetoxPlan.meals.map((meal, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 p-6 rounded-xl border border-slate-200"
                      >
                        <h5 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <Sun className="w-5 h-5 text-orange-500" />
                          {meal.day}
                        </h5>
                        <p className="text-slate-700 leading-relaxed">
                          {meal.mealPlan}
                        </p>
                      </div>
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
                      ? "Create New Detox Plan"
                      : "Edit Detox Plan"}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {currentView === "create"
                      ? "Design a new detox program for your users"
                      : "Update the details of this detox program"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Plan Details
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Plan Title
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
                      placeholder="e.g., 7-Day Green Smoothie Detox"
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
                      rows={6}
                      className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none"
                      placeholder="Provide a detailed description of the detox plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Duration
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    >
                      {DURATIONS.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Meal Plan */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Apple className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Daily Meal Plan
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {formData.meals.map((meal, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 p-5 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-bold text-slate-800">
                            Day {index + 1}
                          </label>
                          {formData.meals.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMealField(index)}
                              className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Day Label
                          </label>
                          <input
                            type="text"
                            value={meal.day}
                            onChange={(e) =>
                              updateMealField(index, "day", e.target.value)
                            }
                            className="w-full px-3 py-2 text-black border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                            placeholder={`e.g., Day ${index + 1}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Meal Plan for this Day
                          </label>
                          <textarea
                            value={meal.mealPlan}
                            onChange={(e) =>
                              updateMealField(index, "mealPlan", e.target.value)
                            }
                            rows={4}
                            className="w-full px-3 py-2 text-black border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none"
                            placeholder="Describe the meal plan for this day (e.g., Breakfast: Green smoothie, Lunch: Quinoa salad, Dinner: Steamed vegetables)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addMealField}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Day to Meal Plan
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
                    currentView === "create" ? createDetoxPlan : updateDetoxPlan
                  }
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {currentView === "create" ? "Create Plan" : "Update Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
