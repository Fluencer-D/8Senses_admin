"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Course {
  thumbnail:string,
  id: string;
  title: string;
  instructor: string;
  price: number;
  status: string;
  enrollmentsCount: number;
}


const CoursesManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
  
        const json = await response.json();
        console.log("zzzzzzz",json)
        const normalizedCourses = (json.data || []).map((course: any) => ({
          id: course._id,
          thumbnail:course.thumbnail,
          title: course.title ?? "Untitled",
          instructor: course.instructor ?? "N/A",
          price: course.price ?? 0,
          status: course.status ?? "inactive",
          enrollmentsCount: course.enrollmentsCount ?? 0,
        }));
  
        setCourses(normalizedCourses);
        setFilteredCourses(normalizedCourses);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, []);
  

  useEffect(() => {
    const results = courses.filter(course =>
      (course.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.status ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.price.toString().includes(searchTerm)
    );
    setFilteredCourses(results);
  }, [searchTerm, courses]);
  
 const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this course?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete course");
    }

    // ✅ Update local state
    setCourses((prev) => prev.filter((course) => course.id !== id));
    setFilteredCourses((prev) => prev.filter((course) => course.id !== id));

    alert("Course deleted successfully!");
  } catch (err: any) {
    console.error("❌ Error deleting course:", err);
    alert(err.message || "Something went wrong");
  }
};

  
  const getStatusBadgeClass = (status: string = "") => {
    switch (status) {
      case "Active":
        return "bg-[#E7F4EE] text-[#0D894F]";
      case "Upcoming":
        return "bg-[#FDF1E8] text-[#E46A11]";
      case "Inactive":
        return "bg-[#FEEDEC] text-[#F04438]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-6">Loading courses...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
                    
  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[#333843] font-inter font-medium text-2xl leading-8 tracking-[0.12px]">
            Courses
          </h2>
          <p className="text-sm text-gray-500 flex items-center">
            <span className="text-[#245BA7] font-inter font-medium text-sm leading-5 tracking-[0.07px]">
              E-commerce
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="mx-2"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.59467 3.96967C6.30178 4.26256 6.30178 4.73744 6.59467 5.03033L10.5643 9L6.59467 12.9697C6.30178 13.2626 6.30178 13.7374 6.59467 14.0303C6.88756 14.3232 7.36244 14.3232 7.65533 14.0303L12.4205 9.26516C12.5669 9.11872 12.5669 8.88128 12.4205 8.73484L7.65533 3.96967C7.36244 3.67678 6.88756 3.67678 6.59467 3.96967Z"
                fill="#A3A9B6"
              />
            </svg>
            <span className="text-[#667085]">Courses</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#C83C92] text-white px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="2 2 20 20"
              fill="none"
            >
              <g clipPath="url(#clip0_786_597)">
                <path
                  d="M15.7071 7.20706C15.3166 7.59758 14.6834 7.59758 14.2929 7.20706L13 5.91417V15.5C13 16.0522 12.5523 16.5 12 16.5C11.4477 16.5 11 16.0522 11 15.5V5.91417L9.70711 7.20706C9.31658 7.59758 8.68342 7.59758 8.29289 7.20706C7.90237 6.81654 7.90237 6.18337 8.29289 5.79285L11.6464 2.43929C11.8417 2.24403 12.1583 2.24403 12.3536 2.43929L15.7071 5.79285C16.0976 6.18337 16.0976 6.81654 15.7071 7.20706Z"
                  fill="white"
                />
                <path
                  d="M18 8.49996C20.2091 8.49996 22 10.2908 22 12.5V17.5C22 19.7091 20.2091 21.5 18 21.5H6C3.79086 21.5 2 19.7091 2 17.5V12.5C2 10.2908 3.79086 8.49996 6 8.49996H8C8.55229 8.49996 9 8.94767 9 9.49996C9 10.0522 8.55229 10.5 8 10.5H6C4.89543 10.5 4 11.3954 4 12.5V17.5C4 18.6045 4.89543 19.5 6 19.5H18C19.1046 19.5 20 18.6045 20 17.5V12.5C20 11.3954 19.1046 10.5 18 10.5H16C15.4477 10.5 15 10.0522 15 9.49996C15 8.94767 15.4477 8.49996 16 8.49996H18Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_786_597">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Export
          </button>
          <Link href={'/coursesWeb/courses/addCourse'}>
            <button className="px-4 py-2 bg-[#C83C92] text-white font-semibold rounded-md">
              + Add Course
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center border border-gray-300 bg-white px-4 py-2 w-80 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-400"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.7847 16.1988C11.6462 18.6414 7.10654 18.4202 4.22181 15.5355C1.09761 12.4113 1.09761 7.346 4.22181 4.22181C7.346 1.09761 12.4113 1.09761 15.5355 4.22181C18.4202 7.10653 18.6414 11.6462 16.1989 14.7846L20.4853 19.0711C20.8758 19.4616 20.8758 20.0948 20.4853 20.4853C20.0948 20.8758 19.4616 20.8758 19.0711 20.4853L14.7847 16.1988ZM5.63602 14.1213C7.97917 16.4644 11.7782 16.4644 14.1213 14.1213C16.4644 11.7782 16.4644 7.97917 14.1213 5.63602C11.7782 3.29288 7.97917 3.29288 5.63602 5.63602C3.29288 7.97917 3.29288 11.7782 5.63602 14.1213Z"
              fill="#667085"
            />
          </svg>
          <input
            type="text"
            placeholder="Search course..."
            className="ml-2 w-full bg-transparent focus:outline-none text-[#858D9D] placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-3">
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.5 2.49996C7.5 2.03972 7.1269 1.66663 6.66667 1.66663C6.20643 1.66663 5.83333 2.03972 5.83333 2.49996H5C3.61929 2.49996 2.5 3.61925 2.5 4.99996V15.8333C2.5 17.214 3.61929 18.3333 5 18.3333H15C16.3807 18.3333 17.5 17.214 17.5 15.8333V4.99996C17.5 3.61925 16.3807 2.49996 15 2.49996H14.1667C14.1667 2.03972 13.7936 1.66663 13.3333 1.66663C12.8731 1.66663 12.5 2.03972 12.5 2.49996H7.5ZM15.8333 5.83329V4.99996C15.8333 4.53972 15.4602 4.16663 15 4.16663H14.1667C14.1667 4.62686 13.7936 4.99996 13.3333 4.99996C12.8731 4.99996 12.5 4.62686 12.5 4.16663H7.5C7.5 4.62686 7.1269 4.99996 6.66667 4.99996C6.20643 4.99996 5.83333 4.62686 5.83333 4.16663H5C4.53976 4.16663 4.16667 4.53972 4.16667 4.99996V5.83329H15.8333ZM4.16667 7.49996V15.8333C4.16667 16.2935 4.53976 16.6666 5 16.6666H15C15.4602 16.6666 15.8333 16.2935 15.8333 15.8333V7.49996H4.16667Z"
                fill="#667085"
              />
            </svg>
            Select Dates
          </button>

          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10.8333 6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5C12.1269 7.5 12.5 7.1269 12.5 6.66667V5.83333H16.6667C17.1269 5.83333 17.5 5.46024 17.5 5C17.5 4.53976 17.1269 4.16667 16.6667 4.16667H12.5V3.33333C12.5 2.8731 12.1269 2.5 11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667Z"
                fill="#667085"
              />
              <path
                d="M2.5 10C2.5 9.53976 2.8731 9.16667 3.33333 9.16667H4.58333C4.81345 9.16667 5 9.35321 5 9.58333V10.4167C5 10.6468 4.81345 10.8333 4.58333 10.8333H3.33333C2.8731 10.8333 2.5 10.4602 2.5 10Z"
                fill="#667085"
              />
              <path
                d="M7.5 7.5C7.03976 7.5 6.66667 7.8731 6.66667 8.33333V11.6667C6.66667 12.1269 7.03976 12.5 7.5 12.5C7.96024 12.5 8.33333 12.1269 8.33333 11.6667V10.8333H16.6667C17.1269 10.8333 17.5 10.4602 17.5 10C17.5 9.53976 17.1269 9.16667 16.6667 9.16667H8.33333V8.33333C8.33333 7.8731 7.96024 7.5 7.5 7.5Z"
                fill="#667085"
              />
              <path
                d="M2.5 5C2.5 4.53976 2.8731 4.16667 3.33333 4.16667H8.75C8.98012 4.16667 9.16667 4.35321 9.16667 4.58333V5.41667C9.16667 5.64679 8.98012 5.83333 8.75 5.83333H3.33333C2.8731 5.83333 2.5 5.46024 2.5 5Z"
                fill="#667085"
              />
              <path
                d="M12.5 13.3333C12.5 12.8731 12.8731 12.5 13.3333 12.5C13.7936 12.5 14.1667 12.8731 14.1667 13.3333V14.1667H16.6667C17.1269 14.1667 17.5 14.5398 17.5 15C17.5 15.4602 17.1269 15.8333 16.6667 15.8333H14.1667V16.6667C14.1667 17.1269 13.7936 17.5 13.3333 17.5C12.8731 17.5 12.5 17.1269 12.5 16.6667V13.3333Z"
                fill="#667085"
              />
              <path
                d="M2.5 15C2.5 14.5398 2.8731 14.1667 3.33333 14.1667H10.4167C10.6468 14.1667 10.8333 14.3532 10.8333 14.5833V15.4167C10.8333 15.6468 10.6468 15.8333 10.4167 15.8333H3.33333C2.8731 15.8333 2.5 15.4602 2.5 15Z"
                fill="#667085"
              />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 py-4 px-6 font-medium text-[#1E437A]">
          <div className="col-span-1">Course Name</div>
          <div className="col-span-1">Instructor</div>
          <div className="col-span-1 ml-40">Price</div>
          <div className="col-span-1 ml-30">Status</div>
          <div className="col-span-1 ml-20 whitespace-nowrap">Total Enrolled</div>
          <div className="col-span-1 ml-15">Action</div>
        </div>

        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="grid grid-cols-6 py-4 px-6 border-t border-gray-200">
              <div className="col-span-1 flex items-center">
              <div className="h-12 w-12 bg-gray-100 rounded-md mr-3 flex-shrink-0 overflow-hidden">
  <img
    src={course.thumbnail}
    alt="Course thumbnail"
    className="h-full w-full"
  />
</div>
                <span className="text-[#1E437A] font-medium">{course.title}</span>
              </div>
              <div className="col-span-1 flex items-center text-[#1E437A] whitespace-nowrap ml-">{course.instructor}</div>
              <div className="col-span-1 flex items-center text-[#1E437A] ml-40">{course.price}</div>
              <div className="col-span-1 flex items-center ml-30">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(course.status)}`}>
                  {course.status}
                </span>
              </div>
              <div className="col-span-1 flex items-center text-[#1E437A] ml-30">{course.enrollmentsCount}</div>
              <div className="col-span-1 flex items-center space-x-3 ml-15">
                <button className="text-blue-600">View</button>
                <button className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(course.id)} className="text-blue-600">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            No courses found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesManagement;