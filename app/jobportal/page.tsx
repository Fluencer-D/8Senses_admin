"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash2, Plus, Briefcase, Edit } from "lucide-react"

interface Job {
  _id: string
  title: string
  department: string
  type: string
  location: string
  description: string
  requirements: string[]
  salary: {
    min?: number
    max?: number
    currency: string
    isVisible: boolean
  }
  applicationDeadline: string
  isActive: boolean
  applicationCount: number
  createdAt: string
}

interface JobApplication {
  _id: string
  jobId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  resume?: string
  status: string
  createdAt: string
}

interface Toast {
  id: string
  title: string
  description: string
  variant?: "default" | "destructive"
}

export default function JobPortal() {
  const [activeTab, setActiveTab] = useState("jobs")
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [showJobForm, setShowJobForm] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    type: "",
    location: "",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
    showSalary: false,
    applicationDeadline: "",
  })

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    resume: null as File | null,
  })

  const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, title, description, variant }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`)
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      })
    }
  }

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.split("\n").filter((req) => req.trim()),
        salary: {
          min: jobForm.salaryMin ? Number.parseInt(jobForm.salaryMin) : undefined,
          max: jobForm.salaryMax ? Number.parseInt(jobForm.salaryMax) : undefined,
          currency: "USD",
          isVisible: jobForm.showSalary,
        },
      }

      const url = editingJob ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${editingJob._id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`
      const method = editingJob ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Job ${editingJob ? "updated" : "created"} successfully`,
        })
        resetJobForm()
        fetchJobs()
      } else {
        throw new Error("Failed to save job")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("jobId", selectedJob._id)
      formData.append("jobTitle", selectedJob.title)
      formData.append("firstName", applicationForm.firstName)
      formData.append("lastName", applicationForm.lastName)
      formData.append("email", applicationForm.email)
      formData.append("phone", applicationForm.phone)
      if (applicationForm.resume) {
        formData.append("resume", applicationForm.resume)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Application submitted successfully! We'll get back to you soon.",
        })
        resetApplicationForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit application")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}`, { method: "DELETE" })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Job deleted successfully",
        })
        fetchJobs()
      } else {
        throw new Error("Failed to delete job")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    }
  }

  const resetJobForm = () => {
    setJobForm({
      title: "",
      department: "",
      type: "",
      location: "",
      description: "",
      requirements: "",
      salaryMin: "",
      salaryMax: "",
      showSalary: false,
      applicationDeadline: "",
    })
    setEditingJob(null)
    setShowJobForm(false)
  }

  const resetApplicationForm = () => {
    setApplicationForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      resume: null,
    })
    setShowApplicationForm(false)
    setSelectedJob(null)
  }

  const editJob = (job: Job) => {
    setJobForm({
      title: job.title,
      department: job.department,
      type: job.type,
      location: job.location,
      description: job.description,
      requirements: job.requirements.join("\n"),
      salaryMin: job.salary.min?.toString() || "",
      salaryMax: job.salary.max?.toString() || "",
      showSalary: job.salary.isVisible,
      applicationDeadline: job.applicationDeadline.split("T")[0],
    })
    setEditingJob(job)
    setShowJobForm(true)
  }

  return (
    <div className="min-h-screen mt-10 ml-[300px] bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">Job Portal</h1>
          <p className="text-gray-600 text-center">Manage jobs and applications</p>
        </div>

        <div className="w-full">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "jobs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "admin"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Plus className="h-4 w-4" />
              Admin Panel
            </button>
          </div>

          {/* Jobs Tab - User View */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs
                  .filter((job) => job.isActive)
                  .map((job) => (
                    <div
                      key={job._id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <p className="text-sm text-gray-600">
                            {job.department} • {job.type} • {job.location}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                          {job.salary.isVisible && (job.salary.min || job.salary.max) && (
                            <div className="text-sm font-medium text-gray-900">
                              ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {job.applicationCount} applications
                            </span>
                            <button
                              onClick={() => {
                                setSelectedJob(job)
                                setShowApplicationForm(true)
                              }}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Manage Jobs</h2>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Job
                </button>
              </div>

              <div className="grid gap-4">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600">
                            {job.department} • {job.type} • {job.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {job.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => editJob(job)}
                            className="p-2 text-blue-400 hover:text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit Job"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteJob(job._id)}
                            className="p-2 text-red-400 hover:text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                        <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {jobs.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first job posting.</p>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Job
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{editingJob ? "Edit Job" : "Add New Job"}</h2>
                <p className="text-sm text-gray-600 mt-1">Fill in the job details below</p>
              </div>
              <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      style={{color:"black"}}
                      id="title"
                      type="text"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      style={{color:"black"}}
                      value={jobForm.department}
                      onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <select
                      style={{color:"black"}}
                      value={jobForm.type}
                      onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      style={{color:"black"}}
                      id="location"
                      type="text"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    style={{color:"black"}}
                    id="description"
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements (one per line)
                  </label>
                  <textarea
                    style={{color:"black"}}
                    id="requirements"
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    rows={3}
                    placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Knowledge of React"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">
                      Min Salary
                    </label>
                    <input
                      style={{color:"black"}}
                      id="salaryMin"
                      type="number"
                      value={jobForm.salaryMin}
                      onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Salary
                    </label>
                    <input
                      style={{color:"black"}}
                      id="salaryMax"
                      type="number"
                      value={jobForm.salaryMax}
                      onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        style={{color:"black"}}
                        type="checkbox"
                        checked={jobForm.showSalary}
                        onChange={(e) => setJobForm({ ...jobForm, showSalary: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show salary</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    style={{color:"black"}}
                    id="deadline"
                    type="date"
                    value={jobForm.applicationDeadline}
                    onChange={(e) => setJobForm({ ...jobForm, applicationDeadline: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={resetJobForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Saving..." : editingJob ? "Update Job" : "Create Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Apply for {selectedJob?.title}</h2>
                <p className="text-sm text-gray-600 mt-1">Fill in your details to apply for this position</p>
              </div>
              <form onSubmit={handleApplicationSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      style={{color:"black"}}
                      id="firstName"
                      type="text"
                      value={applicationForm.firstName}
                      onChange={(e) => setApplicationForm({ ...applicationForm, firstName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      style={{color:"black"}}
                      id="lastName"
                      type="text"
                      value={applicationForm.lastName}
                      onChange={(e) => setApplicationForm({ ...applicationForm, lastName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    style={{color:"black"}}
                    id="email"
                    type="email"
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    style={{color:"black"}}
                    id="phone"
                    type="tel"
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                    Resume (PDF)
                  </label>
                  <input
                    style={{color:"black"}}
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setApplicationForm({ ...applicationForm, resume: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={resetApplicationForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-lg max-w-sm ${
              toast.variant === "destructive"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-green-50 border border-green-200 text-green-800"
            }`}
          >
            <div className="font-medium">{toast.title}</div>
            <div className="text-sm mt-1">{toast.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
