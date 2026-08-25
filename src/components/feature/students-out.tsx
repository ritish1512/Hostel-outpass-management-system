"use client";

import { useState, useEffect } from "react";
import { Students_out } from "@/app/actions/students-out";
import { student } from "@/types/dashboard";
import { Loading } from "../ui/Loader";
import { LogOut, User, Home, Search } from "lucide-react"; // Optional: Install lucide-react for icons

export const WentOutStudent = () => {
  const [students, setStudents] = useState<student[]>([]);
  const [isloading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const data = (await Students_out()) as student[];
        setStudents(data);
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students based on search input
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.HostelRoomNo as number).toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <LogOut className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Students Checked Out
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Current list of students outside the hostel premises.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Loading State */}
      {isloading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loading />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Fetching active logs...
          </p>
        </div>
      )}

      {/* Main Content Area */}
      {!isloading && (
        <>
          {filteredStudents.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl">
              <div className="inline-flex p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                <User className="w-6 h-6" />
              </div>
              <p className="text-slate-500 font-medium">No students found</p>
              <p className="text-xs text-slate-400 mt-1">
                Everyone is currently inside or matches your search filters.
              </p>
            </div>
          ) : (
            /* Student Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 font-semibold text-sm border border-white shadow-sm group-hover:scale-105 transition-transform">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                        {item.name}
                      </h2>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Home className="w-3 h-3 text-slate-400" />
                        <span>Room {item.HostelRoomNo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping absolute" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 relative" />
                    Out
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
