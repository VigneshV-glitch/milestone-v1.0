/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";

interface CompanyFormState {
  name: string;
  dotNumber: string;
  taxId: string;
  operationsCenter: string;
  email: string;
  phone: string;
  regAuthority: string;
  activeFleetSize: string;
  address: string;
}

interface CompanySettingsProps {
  companyForm: CompanyFormState;
  setCompanyForm: React.Dispatch<React.SetStateAction<CompanyFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  companyForm,
  setCompanyForm,
  onSubmit,
  onReset,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-[18px] font-bold text-[#1f2937] dark:text-white mb-2 font-sans">
          Carrier Profile Credentials
        </h3>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-6 font-semibold">
          Primary corporate identifiers and registered dispatch configurations filed under DOT system logs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Registered Carrier Organization Name
            </label>
            <input
              type="text"
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              USDOT Administration Registration Number
            </label>
            <input
              type="text"
              value={companyForm.dotNumber}
              onChange={(e) => setCompanyForm({ ...companyForm, dotNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Federal Employer ID Number (FEIN / Tax ID)
            </label>
            <input
              type="text"
              value={companyForm.taxId}
              onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Active Operations Base & Depot Base Hub
            </label>
            <input
              type="text"
              value={companyForm.operationsCenter}
              onChange={(e) => setCompanyForm({ ...companyForm, operationsCenter: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Billing / Invoicing Contact Email Address
            </label>
            <input
              type="email"
              value={companyForm.email}
              onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              HQ Central Operations Phone
            </label>
            <input
              type="text"
              value={companyForm.phone}
              onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Registered HQ Commercial Base Postal Address
            </label>
            <input
              type="text"
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Regulatory Compliance Authority Code
            </label>
            <input
              type="text"
              value={companyForm.regAuthority}
              onChange={(e) => setCompanyForm({ ...companyForm, regAuthority: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#4b5563] dark:text-gray-400 mb-2 font-sans font-semibold">
              Registered Active Fleet Size Allocation
            </label>
            <input
              type="text"
              disabled
              value={companyForm.activeFleetSize}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-lg bg-[#f9fafb] dark:bg-[#121212] text-gray-500 text-[14px] font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 dark:border-[#1f1f1f] flex justify-end gap-3">
        <button
          id="btn-reset-company"
          type="button"
          onClick={onReset}
          className="px-4 py-2 border border-gray-300 dark:border-[#3d3d3d] rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer"
        >
          Reset
        </button>
        <button
          id="btn-save-company"
          type="submit"
          className="px-5 py-2 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-md text-sm font-bold transition-colors shadow cursor-pointer"
        >
          Sync DOT State Parameters
        </button>
      </div>
    </form>
  );
};
