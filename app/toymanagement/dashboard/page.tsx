'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import search from "../../../public/search.png"
import toysavailable from '../../../public/toysavailable.png';
import toysborrowed from '../../../public/toysborrow.png';
import duesoon from '../../../public/duesoon.png';
import overdue from '../../../public/overdue.png';
import circleArrow from "../../../public/circlearrrow.png"
import bell from "../../../public/bell.png"


// Dummy helper functions
const getStockStatus = (quantity: number) => {
  if (quantity > 10) return { status: 'In Stock', color: 'text-green-600' };
  if (quantity > 0) return { status: 'Due Soon', color: 'text-yellow-500' };
  return { status: 'Over Due', color: 'text-red-600' };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-600';
    case 'discontinued': return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

const ToyManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toys, setToys] = useState<any[]>([]);

  // Simulate fetch
  useEffect(() => {
    setTimeout(() => {
      setToys([
        {
          _id: '1',
          name: 'Toy Car',
          category: { name: 'Vehicles' },
          quantity: 5,
          orderedby: "Satish",
          dueDate:"March 05, 2025",
          price: 19.99,
          discountedPrice: 14.99,
          discountType: 'percent',
          status: 'Over Due',
          createdAt: new Date().toISOString(),
          images: [{ url: 'https://res.cloudinary.com/dktkof8fo/image/upload/v1747834535/8senses/products/obzkyr7zbjph0dimm4e6.jpg', isMain: true }]
        },
        {
          _id: '2',
          name: 'Lego Set',
          category: { name: 'Building' },
          quantity: 0,
          price: 49.99,
          orderedby: "Satish",
          dueDate:"March 05, 2025",
          discountedPrice: 0,
          discountType: 'none',
          status: 'Due Soon',
          createdAt: new Date().toISOString(),
          images: [{ url: 'https://res.cloudinary.com/dktkof8fo/image/upload/v1747834535/8senses/products/obzkyr7zbjph0dimm4e6.jpg', isMain: true }]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-gray-50 w-[81%] ml-[300px] mt-20 p-6 overflow-hidden">

      <TopNavigator/>

      <SearchFiltersComponent/>


      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full p-4">
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <Image src={toysavailable} width={40} height={40} alt="Toys Available" />
          <p className="text-neutral-500 mt-5 text-md font-medium">Toys Available</p>
          <p className="text-black mt-5 text-xl font-semibold">24</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <Image src={toysborrowed} width={40} height={40} alt="Toys Borrowed" />
          <p className="text-neutral-500 mt-5 text-md font-medium">Toys Borrowed</p>
          <p className="text-black mt-5 text-xl font-semibold">14</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <Image src={duesoon} width={40} height={40} alt="Due Soon" />
          <p className="text-neutral-500 mt-5 text-md font-medium">Due Soon</p>
          <p className="text-black mt-5 text-xl font-semibold">5</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 h-44">
          <Image src={overdue} width={40} height={40} alt="Over Due" />
          <p className="text-neutral-500 mt-5 text-md font-medium">Over Due</p>
          <p className="text-black mt-5 text-xl font-semibold">2</p>
        </div>
      </div>

      {/* Toys Table */}
      <div className="max-h-[700px] overflow-y-auto mt-12">
        {loading ? (
          <div className="p-6 text-center">Loading products...</div>
        ) : toys.length === 0 ? (
          <div className="p-6 text-center">No products found</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F9F9FC] text-[#1E437A] bg-blue-50 text-md font-semibold sticky top-0">
              <tr>
                <th className="p-3">Toy Name</th>
                <th className="p-3">Borrowed By</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {toys.map((product) => {
                const stockInfo = getStockStatus(product.quantity);
                return (
                  <tr key={product._id} className="border-t">
                    <td className="p-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <Link href={`/ecommerce/products/viewProduct?id=${product._id}`}>
                        <span className="text-[#1E437A] font-semibold">{product.name}</span>
                      </Link>
                    </td>
                    <td className="p-3 font-semibold text-[#1E437A] align-middle">
                      {product?.orderedby}
                      <br />
                      <span className='font-medium text-[#7093c9]'>{product?._id}</span>
                    </td>
                    <td className="p-3 text-[#1E437A]">
                      {product?.dueDate}
                    </td>
                    <td className="p-3 text-[#456696]">
                      <span style={{color:"#F04438",backgroundColor:"#FDF1E8"}} className={`p-2 rounded-2xl text-sm  font-semibold `}>{stockInfo.status}</span>
                    </td>
                    <td className="p-3 text-[#456696] flex gap-5">
                      <Image
                        src={bell}
                        width={15}
                        height={15}
                      />
                      <Image
                        src={circleArrow}
                        width={15}
                        height={15}
                      />
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ToyManagementPage;




const TopNavigator = () => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#333843] font-medium text-2xl leading-8 tracking-wide">
            Products
          </h2>
          <p className="text-sm text-gray-500 flex items-center">
            <span className="text-[#245BA7] font-medium">E-commerce</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              className="mx-2"
              viewBox="0 0 18 18"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.59467 3.96967C6.30178 4.26256 6.30178 4.73744 6.59467 5.03033L10.5643 9L6.59467 12.9697C6.30178 13.2626 6.30178 13.7374 6.59467 14.0303C6.88756 14.3232 7.36244 14.3232 7.65533 14.0303L12.4205 9.26516C12.5669 9.11872 12.5669 8.88128 12.4205 8.73484L7.65533 3.96967C7.36244 3.67678 6.88756 3.67678 6.59467 3.96967Z"
                fill="#A3A9B6"
              />
            </svg>
            <span className="text-[#667085]">Products</span>
          </p>
        </div>
      </div>
    </div>
  )
}


const SearchFiltersComponent = ({ setSearchQuery, searchQuery }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center border border-gray-300 bg-white px-4 py-2 w-80 rounded-lg">
        <Image src={search} width={20} height={20} alt="Search icon" />
        <input
          type="text"
          placeholder="Seach for a toy or a member."
          className="ml-2 w-full bg-transparent focus:outline-none text-gray-600 placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex space-x-3">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#ffecf8] text-pink-400 px-4 font-semibold py-2 rounded-lg font-medium">
            <Image src={circleArrow} width={15} height={15} alt="Search icon" />
            Process
          </button>
          <Link href="/toymanagement/dashboard/issuenewtoy ">
            <button className="px-4 py-2 bg-[#C83C92] text-white font-semibold rounded-md">
              Issue a Toy
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}