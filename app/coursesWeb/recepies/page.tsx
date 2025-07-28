"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Users,
  Download,
  ChefHat,
  BookOpen,
  Utensils,
  Heart,
  Tag,
  X,
  Save,
  ArrowLeft,
  Wheat,
  Calculator,
  Upload,
} from "lucide-react";
import { getAdminToken } from "@/utils/storage";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Dessert" | "Snack";
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  downloads: number;
  isGlutenFree: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];

export default function RecipeAdminPanel() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit">(
    "list"
  );
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Breakfast" as Recipe["category"],
    image: "",
    prepTime: "",
    cookTime: "",
    servings: 1,
    ingredients: [""],
    instructions: [""],
    nutritionFacts: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
    isGlutenFree: true,
    tags: [""],
  });

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_unsigned_preset"); // Replace with your Cloudinary upload preset
    formData.append("cloud_name", "dlehbizfp"); // Replace with your Cloudinary cloud name

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dlehbizfp/image/upload`, // Replace with your cloud name
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Fetch all recipes
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recipes/all`,
        {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRecipes(data.data);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create recipe
  const createRecipe = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recipes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            ingredients: formData.ingredients.filter(
              (ing) => ing.trim() !== ""
            ),
            instructions: formData.instructions.filter(
              (inst) => inst.trim() !== ""
            ),
            tags: formData.tags.filter((tag) => tag.trim() !== ""),
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchRecipes();
        setCurrentView("list");
        resetForm();
        alert("Recipe created successfully!");
      } else {
        alert("Error creating recipe");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Error creating recipe");
    }
  };

  // Update recipe
  const updateRecipe = async () => {
    if (!selectedRecipe) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${selectedRecipe._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            ingredients: formData.ingredients.filter(
              (ing) => ing.trim() !== ""
            ),
            instructions: formData.instructions.filter(
              (inst) => inst.trim() !== ""
            ),
            tags: formData.tags.filter((tag) => tag.trim() !== ""),
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchRecipes();
        setCurrentView("list");
        resetForm();
        alert("Recipe updated successfully!");
      } else {
        alert("Error updating recipe");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Error updating recipe");
    }
  };

  // Delete recipe
  const deleteRecipe = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${id}`,
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
        await fetchRecipes();
        alert("Recipe deleted successfully!");
      } else {
        alert("Error deleting recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Error deleting recipe");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Breakfast",
      image: "",
      prepTime: "",
      cookTime: "",
      servings: 1,
      ingredients: [""],
      instructions: [""],
      nutritionFacts: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      },
      isGlutenFree: true,
      tags: [""],
    });
    setSelectedRecipe(null);
  };

  const handleEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setFormData({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      image: recipe.image,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [""],
      instructions: recipe.instructions.length > 0 ? recipe.instructions : [""],
      nutritionFacts: recipe.nutritionFacts,
      isGlutenFree: recipe.isGlutenFree,
      tags: recipe.tags.length > 0 ? recipe.tags : [""],
    });
    setCurrentView("edit");
  };

  const addArrayField = (field: "ingredients" | "instructions" | "tags") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "ingredients" | "instructions" | "tags",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayField = (
    field: "ingredients" | "instructions" | "tags",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl font-semibold text-gray-800">
            Loading recipes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br font-sans mt-10 pl-32 mt-14 from-slate-50 to-slate-100">
      {/* Simple Header with Navigation */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Recipe Management
              </h1>
              <p className="text-lg text-slate-600">
                Manage your delicious recipe collection
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
                <BookOpen className="w-4 h-4" />
                All Recipes ({recipes.length})
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
                Add New Recipe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {currentView === "list" && (
          <div>
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-slate-200">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Search Recipes
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      style={{ color: "black" }}
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="lg:w-64">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Filter by Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-5 py-4 text-lg text-black border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
                >
                  <div className="relative h-56">
                    <img
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg ${
                          recipe.category === "Breakfast"
                            ? "bg-amber-400 text-amber-900"
                            : recipe.category === "Lunch"
                            ? "bg-emerald-400 text-emerald-900"
                            : recipe.category === "Dinner"
                            ? "bg-indigo-400 text-indigo-900"
                            : recipe.category === "Dessert"
                            ? "bg-pink-400 text-pink-900"
                            : "bg-purple-400 text-purple-900"
                        }`}
                      >
                        {recipe.category}
                      </span>
                    </div>
                    {recipe.isGlutenFree && (
                      <div className="absolute top-4 left-4">
                        <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full bg-orange-400 text-orange-900 shadow-lg">
                          <Wheat className="w-3 h-3" />
                          Gluten Free
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <p className="text-slate-600 text-base mb-4 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-6 bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{recipe.prepTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{recipe.servings}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span className="font-medium">{recipe.downloads}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(recipe)}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRecipe(recipe._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-20">
                <ChefHat className="w-24 h-24 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  No recipes found
                </h3>
                <p className="text-lg text-slate-600">
                  Try adjusting your search or create a new recipe.
                </p>
              </div>
            )}
          </div>
        )}

        {(currentView === "create" || currentView === "edit") && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {currentView === "create" ? (
                  <ChefHat className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Edit3 className="w-6 h-6 text-indigo-600" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {currentView === "create"
                      ? "Create New Recipe"
                      : "Edit Recipe"}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {currentView === "create"
                      ? "Add a delicious new recipe to your collection"
                      : "Update your recipe details"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Utensils className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Basic Information
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Recipe Title
                    </label>
                    <input
                      type="text"
                      style={{ color: "black" }}
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter a delicious recipe title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Description
                    </label>
                    <textarea
                      style={{ color: "black" }}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none"
                      placeholder="Describe your amazing recipe"
                    />
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
                            category: e.target.value as Recipe["category"],
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Servings
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          style={{ color: "black" }}
                          type="number"
                          value={formData.servings}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              servings: Number.parseInt(e.target.value) || 1,
                            }))
                          }
                          min="1"
                          className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Prep Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          style={{ color: "black" }}
                          type="text"
                          value={formData.prepTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              prepTime: e.target.value,
                            }))
                          }
                          className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                          placeholder="e.g., 15 minutes"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Cook Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          style={{ color: "black" }}
                          type="text"
                          value={formData.cookTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cookTime: e.target.value,
                            }))
                          }
                          className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                          placeholder="e.g., 30 minutes"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Recipe Image
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-all duration-200 font-semibold">
                          <Upload className="w-4 h-4" />
                          {uploading ? "Uploading..." : "Upload Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                        {uploading && (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                        )}
                      </div>
                      {formData.image && (
                        <div className="relative w-full h-40 border-2 border-slate-200 rounded-xl overflow-hidden">
                          <img
                            src={formData.image}
                            alt="Recipe preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center bg-slate-50 p-4 rounded-xl">
                    <input
                      style={{ color: "black" }}
                      type="checkbox"
                      id="glutenFree"
                      checked={formData.isGlutenFree}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isGlutenFree: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-2 border-slate-300 rounded"
                    />
                    <label
                      htmlFor="glutenFree"
                      className="ml-3 flex items-center gap-2 text-lg font-semibold text-slate-900"
                    >
                      <Wheat className="w-5 h-5" />
                      Gluten Free Recipe
                    </label>
                  </div>
                </div>

                {/* Nutrition Facts */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Calculator className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Nutrition Facts
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Calories
                      </label>
                      <input
                        style={{ color: "black" }}
                        type="number"
                        value={formData.nutritionFacts.calories}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionFacts: {
                              ...prev.nutritionFacts,
                              calories: Number.parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Protein (g)
                      </label>
                      <input
                        style={{ color: "black" }}
                        type="number"
                        value={formData.nutritionFacts.protein}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionFacts: {
                              ...prev.nutritionFacts,
                              protein: Number.parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Carbs (g)
                      </label>
                      <input
                        style={{ color: "black" }}
                        type="number"
                        value={formData.nutritionFacts.carbs}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionFacts: {
                              ...prev.nutritionFacts,
                              carbs: Number.parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Fat (g)
                      </label>
                      <input
                        style={{ color: "black" }}
                        type="number"
                        value={formData.nutritionFacts.fat}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionFacts: {
                              ...prev.nutritionFacts,
                              fat: Number.parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Fiber (g)
                      </label>
                      <input
                        style={{ color: "black" }}
                        type="number"
                        value={formData.nutritionFacts.fiber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionFacts: {
                              ...prev.nutritionFacts,
                              fiber: Number.parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Ingredients
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField("ingredients")}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add Ingredient
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <input
                        style={{ color: "black" }}
                        type="text"
                        value={ingredient}
                        onChange={(e) =>
                          updateArrayField("ingredients", index, e.target.value)
                        }
                        className="flex-1 px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder={`Ingredient ${index + 1}`}
                      />
                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField("ingredients", index)}
                          className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Instructions
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField("instructions")}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-12 bg-indigo-100 text-indigo-800 rounded-xl flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <textarea
                        style={{ color: "black" }}
                        value={instruction}
                        onChange={(e) =>
                          updateArrayField(
                            "instructions",
                            index,
                            e.target.value
                          )
                        }
                        className="flex-1 px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none"
                        placeholder={`Step ${index + 1} instructions`}
                        rows={3}
                      />
                      {formData.instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayField("instructions", index)
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

              {/* Tags */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-900">Tags</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField("tags")}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tag
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        style={{ color: "black" }}
                        type="text"
                        value={tag}
                        onChange={(e) =>
                          updateArrayField("tags", index, e.target.value)
                        }
                        className="flex-1 px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                        placeholder={`Tag ${index + 1}`}
                      />
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField("tags", index)}
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
                    currentView === "create" ? createRecipe : updateRecipe
                  }
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {currentView === "create" ? "Create Recipe" : "Update Recipe"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
