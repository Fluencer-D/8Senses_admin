"use client"
import React, { useEffect, useState } from 'react';

const AddPlanPage = () => {
  // State variables for form fields
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planStatus, setPlanStatus] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [trialPeriod, setTrialPeriod] = useState("");
  const [gracePeriod, setGracePeriod] = useState("");
  const [accessToWebinars, setAccessToWebinars] = useState(false);
  const [accessToPremiumCourses, setAccessToPremiumCourses] = useState(false);
  const [exclusiveDiscounts, setExclusiveDiscounts] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [displayOnPricingPage, setDisplayOnPricingPage] = useState(false);
  const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

  // Handle cancel button click
  const handleCancel = () => {
    console.log("Cancelling plan creation");
    // Would typically navigate back in a real app
  };

  // Handle save button click
  const handleSave = () => {
    console.log("Saving plan:", {
      planName,
      planDescription,
      planStatus,
      price,
      billingCycle,
      trialPeriod,
      gracePeriod,
      accessToWebinars,
      accessToPremiumCourses,
      exclusiveDiscounts,
      autoRenewal,
      displayOnPricingPage
    });
  };

  return (
    <div className="p-6 max-w-[84%] mt-15 ml-70 mx-auto overflow-y-auto">
      {/* Header */}
      <h1 className="text-[#333843] text-3xl">Plans</h1>
      <div className="flex justify-between items-center mb-4">
        {/* Breadcrumbs */}
        <div className="text-gray-500 text-sm">
          <span className="text-blue-600 cursor-pointer">Subscription</span> &gt;{" "}
          <span className="text-blue-600 cursor-pointer">Plans</span> &gt;{" "}
          <span className="text-gray-800 font-semibold">Add Plan</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={handleCancel} className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 flex items-center gap-1">
            ✖ Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#C83C92] text-white rounded-lg flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 2.5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V7.47072C17.5 6.80768 17.2366 6.17179 16.7678 5.70295L14.297 3.23223C13.8282 2.76339 13.1923 2.5 12.5293 2.5H5ZM12.5293 4.16667H12.5V5.83333C12.5 6.75381 11.7538 7.5 10.8333 7.5H7.5C6.57953 7.5 5.83333 6.75381 5.83333 5.83333V4.16667H5C4.53976 4.16667 4.16667 4.53976 4.16667 5V15C4.16667 15.4602 4.53976 15.8333 5 15.8333H5.83333V10.8333C5.83333 9.91286 6.57953 9.16667 7.5 9.16667H12.5C13.4205 9.16667 14.1667 9.91286 14.1667 10.8333V15.8333H15C15.4602 15.8333 15.8333 15.4602 15.8333 15V7.47072C15.8333 7.24971 15.7455 7.03774 15.5893 6.88146L13.1185 4.41074C12.9623 4.25446 12.7503 4.16667 12.5293 4.16667ZM12.5 15.8333V10.8333H7.5V15.8333H12.5ZM7.5 4.16667H10.8333V5.83333H7.5V4.16667Z" fill="white"/>
            </svg> Save Plan
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Basic Plan Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-[#333843] mb-4">Basic Plan Details</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1E437A] mb-1">Plan Name</label>
            <input
              type="text"
              placeholder="Type plan name here..."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1E437A] mb-1">Plan Description</label>
            <textarea
              placeholder="Type plan description here..."
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              className="w-full border text-[#858D9D] bg-[#F9F9FC] border-gray-300 p-2 rounded-md h-32"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1E437A] mb-1">Plan Status</label>
            <div className="relative">
              <select
                value={planStatus}
                onChange={(e) => setPlanStatus(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md appearance-none text-[#858D9D] bg-[#F9F9FC] pr-8"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-[#333843] mb-4">Pricing & Duration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="text"
                  placeholder="Enter price here"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border text-[#858D9D] bg-[#F9F9FC] border-gray-300 p-2 pl-6 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1E437A] mb-1">Billing Cycle</label>
              <div className="relative">
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md appearance-none text-[#858D9D] bg-[#F9F9FC] pr-8"
                >
                  <option value="">Select billing cycle</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#1E437A] mb-1">Trial Period (optional)</label>
            <input
              type="text"
              placeholder="Enter trial period"
              value={trialPeriod}
              onChange={(e) => setTrialPeriod(e.target.value)}
              className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
            />
          </div>
        </div>

        {/* Plan Benefits & Access */}
        <div className="p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-[#1E437A] mb-4">Plan Benefits & Access</h2>

  <div className="grid grid-cols-2 gap-6">
    {/* Left Column */}
    <div className="space-y-4">
      {/* Access to Webinars */}
      <div className="items-center gap-3">
        <label className="text-sm font-medium text-[#1E437A]">Access to Webinars?</label>
        <label className="relative items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={accessToWebinars}
            onChange={() => setAccessToWebinars(!accessToWebinars)}
            className="sr-only peer" 
          />
          <div className={`w-11 h-6 bg-[#C83C92] peer-focus:outline-none rounded-full transition-colors ${accessToWebinars ? 'bg-[#C83C92]' : ''}`}>
            <div className={`absolute top-[22px] -left-[130px] h-5 w-5 bg-white border rounded-full transition-transform ${accessToWebinars ? 'translate-x-5' : ''}`}></div>
          </div>
        </label>
      </div>

      {/* Exclusive Discounts */}
      <div className=" items-center gap-3">
        <label className="text-sm font-medium text-[#1E437A]">Exclusive Discounts on Products?</label>
        <label className="relative items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={exclusiveDiscounts}
            onChange={() => setExclusiveDiscounts(!exclusiveDiscounts)}
            className="sr-only peer" 
          />
          <div className={`w-11 h-6 bg-[#C83C92] peer-focus:outline-none rounded-full transition-colors ${exclusiveDiscounts ? 'bg-[#C83C92]' : ''}`}>
            <div className={`absolute top-[22px] -left-[209px] h-5 w-5 bg-white border rounded-full transition-transform ${exclusiveDiscounts ? 'translate-x-5' : ''}`}></div>
          </div>
        </label>
      </div>
    </div>

    {/* Right Column */}
    <div className=" items-center gap-3">
      <label className="text-sm font-medium text-[#1E437A]">Access to Premium Courses?</label>
      <label className="relative items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={accessToPremiumCourses}
          onChange={() => setAccessToPremiumCourses(!accessToPremiumCourses)}
          className="sr-only peer" 
        />
        <div className={`w-11 h-6 bg-[#C83C92] peer-focus:outline-none rounded-full transition-colors ${accessToPremiumCourses ? 'bg-[#C83C92]' : ''}`}>
          <div className={`absolute top-[23px] -left-[182px] h-5 w-5 bg-white border rounded-full transition-transform ${accessToPremiumCourses ? 'translate-x-5' : ''}`}></div>
        </div>
      </label>
    </div>
  </div>
</div>


      {/* Renewal & Payment Options */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-[#333843] mb-4">Renewal & Payment Options</h2>
        
        <div className="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className=" items-center justify-between md:w-1/2">
            <label className="text-sm font-medium text-[#1E437A]">Auto-Renewal?</label>
            <label className="relative items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoRenewal}
                onChange={() => setAutoRenewal(!autoRenewal)}
                className="sr-only peer" 
              />
              <div className={`w-11 h-6 bg-[#C83C92] top-[22px] -left-[130px] peer-focus:outline-none rounded-full peer ${autoRenewal ? 'after:translate-x-full after:border-white bg-[#C83C92]' : ''} after:content-[''] after:absolute after:top-[22px] after:-left-[94px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
          
          <div className="md:w-1/2">
            <label className="block text-sm font-medium text-[#1E437A] mb-1">Grace Period for Expired Users?</label>
            <input
              type="text"
              placeholder="Enter grace period"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
              className="w-full border border-gray-300 text-[#858D9D] bg-[#F9F9FC] p-2 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-[#333843] mb-4">Admin Controls</h2>
        
        <div className=" items-center justify-between">
          <label className="text-sm font-medium text-[#1E437A]">Display on Pricing Page?</label>
          <label className="relative  items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={displayOnPricingPage}
              onChange={() => setDisplayOnPricingPage(!displayOnPricingPage)}
              className="sr-only peer" 
            />
            <div className={`w-11 h-6 bg-[#C83C92] peer-focus:outline-none rounded-full peer ${displayOnPricingPage ? 'after:translate-x-full after:border-white bg-[#C83C92]' : ''} after:content-[''] after:absolute after:top-[22px] after:-left-[154px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddPlanPage;