"use client";

import { useState, FormEvent } from "react";
import { bulkRegisterRegularLeave } from "@/app/actions/regular_leave";
import { student } from "@/types/dashboard";


export type StudentWithDepartment = student & {
  department: { name: string } | null; 
};

export default function RegularLeave({ Students = [] }: { Students: StudentWithDepartment[] }) {
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Status States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  //extract unique values for dropdown menus
  const DepartmentList = [
    "All",
    ...Array.from(new Set(Students.map((dpmnt) => dpmnt.department?.name).filter(Boolean).sort())),
  ] as string[];

  const SectionList = [
    "All",
    ...Array.from(new Set(Students.map((sdnt) => sdnt.section).filter(Boolean).sort())),
  ] as string[];

  const SemesterList = [
    "All",
    ...Array.from(new Set(Students.map((sdnt) => sdnt.semester).filter((sem) => sem !== undefined).sort())),
  ] as (string | number)[];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setMessage("Start date and End date are required.");
      return;
    }
    setLoading(true);
    setMessage("");

    // "All" or empty strings back to undefined for the API backend action
    const result = await bulkRegisterRegularLeave({
      startDate,
      endDate,
      Department: department && department !== "All" ? department : undefined,
      Section: section && section !== "All" ? section : undefined,
      Semester: semester && semester !== "All" ? Number(semester) : undefined,
    });

    setLoading(false);
    setMessage(result.message);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Bulk Regular Leave Assignment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Department Dropdown Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {DepartmentList.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Section Dropdown Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {SectionList.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Dropdown Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {SemesterList.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
          <input
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
          <input
            type="datetime-local"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? "Processing..." : "Submit Leave Requests"}
        </button>
      </form>

      {/* Response Message Banner */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm text-center font-medium ${
            message.toLowerCase().includes("successfully")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
