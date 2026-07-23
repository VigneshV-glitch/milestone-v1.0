/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { Camera } from "lucide-react";

interface UserProfileSettingsProps {
  onSubmit: (e: React.FormEvent) => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center space-x-8 pb-10 border-b border-gray-100 dark:border-[#1f1f1f]">
        <div className="relative shrink-0" id="profile-avatar-container">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#1e1e1e] shadow-sm"
          />
          <button id="btn-change-avatar" type="button" className="absolute bottom-1 right-1 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-55 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <Camera className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Full Name
            </label>
            <input
              type="text"
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg bg-[#f9fafb] dark:bg-[#121212] text-gray-500 dark:text-gray-400 text-[14px] font-semibold"
              defaultValue="Admin User"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Email Address
            </label>
            <input
              type="email"
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg bg-[#f9fafb] dark:bg-[#121212] text-gray-500 dark:text-gray-400 text-[14px] font-semibold"
              defaultValue="admin@milestone.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Role Privilege
            </label>
            <input
              type="text"
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg bg-[#f9fafb] dark:bg-[#121212] text-gray-500 dark:text-gray-400 text-[14px] font-semibold"
              defaultValue="Admin"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-[18px] font-bold text-[#1f2937] dark:text-white mb-6 font-sans">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Address Line 1
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
              defaultValue="123 Industrial Way"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Address Line 2
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
              defaultValue="Suite 456"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              City
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
              defaultValue="Metropolis"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              State / Province
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
              defaultValue="USA"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Zip / Postal Code
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
              defaultValue="12345"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Country
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
              defaultValue="United States"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
              defaultValue="(555) 010-1234"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Date of Birth
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px] text-gray-500"
              defaultValue="1990-05-15"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="pt-8 border-t border-gray-100 dark:border-[#1f1f1f]">
        <h3 className="text-[18px] font-bold text-[#1f2937] dark:text-white mb-6 font-sans">
          Regional Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Language
            </label>
            <select className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Timezone
            </label>
            <select className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]">
              <option>(GMT-05:00) Eastern Time</option>
              <option>(GMT-08:00) Pacific Time</option>
              <option>(GMT+00:00) UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-8 border-t border-gray-100 dark:border-[#1f1f1f] flex justify-end gap-3">
        <button id="btn-cancel-profile" type="button" className="px-4 py-2 border border-gray-300 dark:border-[#3d3d3d] rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer">
          Cancel
        </button>
        <button id="btn-save-profile" type="submit" className="px-5 py-2 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-md text-sm font-bold transition-colors shadow cursor-pointer">
          Save Changes
        </button>
      </div>
    </form>
  );
};
