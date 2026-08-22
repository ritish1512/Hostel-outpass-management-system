"use client";
import { LeaveType } from "@/generated/prisma";
import { handleReviewAction } from "@/app/actions/handleReviewAction";
import dashboardProps from "@/types/dashboard";
import { useState } from "react";
import { RemarksModel } from "../feature/RemarksModel";
import RejectionString from "../feature/BulkRejectionConfirmation";

export default function Principaldashboard({ outpasses, actorName }: dashboardProps) {
  const [outPassIds, setOupassIds] = useState<string[]>([]);
  const [expandedId, SetExpandedId] = useState<string | null>("");

  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [loadingId, setLoadingId] = useState<string | null>("");
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const [bulkRejection, setBulkRejection] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | "ALL">("ALL");
  const [selectedSemester, setSelectedSemester] = useState<number | "ALL">("ALL")

  const departmentOptions = [
    "ALL",
    ...Array.from(new Set(outpasses.map((pass) => pass.student.department?.name ?? "Unknown")))
  ];

  const leaveTypeOptions = [
    "ALL",
    ...Array.from(new Set(outpasses.map((pass) => pass.type)))
  ] as Array<LeaveType | "ALL">;

  const semesterOptions = ["ALL", ...Array.from(new Set(outpasses.map((pass) => pass.student?.semester)))] as Array<number | "ALL">;

  const filteredOutpasses = outpasses.filter((pass) => {
    const departmentMatches = selectedDepartment === "ALL" || pass.student.department?.name === selectedDepartment;
    const leaveTypeMatches = selectedLeaveType === "ALL" || pass.type === selectedLeaveType;
    const semesterMatches = selectedSemester === "ALL" || pass.student.semester === selectedSemester;
    return departmentMatches && leaveTypeMatches && semesterMatches;
  });

  const filteredSelectedCount = filteredOutpasses.filter((pass) => outPassIds.includes(pass.id)).length;
  const allVisibleSelected = filteredOutpasses.length > 0 && filteredSelectedCount === filteredOutpasses.length;

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setOupassIds((prev) => prev.filter((id) => !filteredOutpasses.some((pass) => pass.id === id)));
    } else {
      setOupassIds((prev) => [...new Set([...prev, ...filteredOutpasses.map((pass) => pass.id)])]);
    }
  };

  const toggleSelectOutpass = (id: string) => {
    setOupassIds((prev) => prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]);
  };

  const handleDecision = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    const correspondingRemarks = remarks[requestId] || "";
    if (action === "REJECTED" && !correspondingRemarks.trim()) {
      return alert("Please supply rejection remarks before declining.");
    }
    setLoadingId(requestId);
    try {
      await handleReviewAction(requestId, action, correspondingRemarks);
      alert(`Request successfully marked as ${action}`);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingId("");
    }
  };
  const confirmationCheck = () => {
    if (!bulkRejection.toLowerCase().trim().includes("reject")) {
      setBulkRejection(""); alert("Please Type \"reject\" to Reject the outpasses");
    }
    else {
      setBulkRejection("");
      handleBulkDecision("REJECTED");
      setConfirmation(false);
    }
  }
  const handleBulkDecision = async (action: "APPROVED" | "REJECTED") => {
    if (outPassIds.length === 0) return alert("Please select at least one outpass");
    const confirmation = confirm("Are you sure about your decision?");
    if (!confirmation) return;
    setBulkLoading(true);
    try {
      for (const id of outPassIds) {
        const note = remarks[id] || "Bulk Rejected by HOD";
        await handleReviewAction(id, action, note);
      }
      alert(`Bulk execution complete: ${outPassIds.length} requests updated.`);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-2xl font-bold text-slate-800 tracking-tight">Welcome {actorName}</div>

        {/* DASHBOARD HEADER & BULK CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Outpass Applications</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review, approve or reject pending student outpass requests.
            </p>
          </div>
          {filteredOutpasses.length > 0 && (
            <button
              type="button"
              disabled={bulkLoading}
              onClick={handleSelectAllVisible}
              className="px-5 py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              {bulkLoading ? (
                "Processing..."
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  {allVisibleSelected ? "Deselect All" : "Select All"} ({filteredOutpasses.length})
                </>
              )}
            </button>
          )}
          {(filteredSelectedCount > 0) && (
            <div className="flex items-center duration-600 justify-evenly w-full">
              <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                {filteredSelectedCount} selected
              </span>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => handleBulkDecision("APPROVED")}
                className="px-4 py-2 w-20 sm:w-40 sm:h-10 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                {bulkLoading ? "Processing..." : "Bulk Approve"}
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => setConfirmation(true)}
                className="px-4 py-2 w-20 sm:w-40 sm:h-10 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                {bulkLoading ? "Processing..." : "Bulk Reject"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-600">Department</span>
              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-600">Leave Type</span>
              <select
                value={selectedLeaveType}
                onChange={(event) => setSelectedLeaveType(event.target.value as LeaveType | "ALL")}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {leaveTypeOptions.map((leaveType) => (
                  <option key={leaveType} value={leaveType}>
                    {leaveType === "ALL" ? "ALL" : leaveType.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-600">Semester</span>
              <select
                value={selectedSemester}
                onChange={(event) => { const value = event.target.value; setSelectedSemester(value === "ALL" ? "ALL" : Number(value)); }}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {semesterOptions.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester === "ALL" ? "ALL" : semester}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* OUTPASS CARDS LIST */}
        <div className="space-y-3">
          {filteredOutpasses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              No outpasses match the selected filters.
            </div>
          ) : (
            filteredOutpasses.map((pass, idx) => {
              const isSelected = outPassIds.includes(pass.id);
              const isExpanded = expandedId === pass.id;
              const isLoading = loadingId === pass.id;

              return (
                <div
                  key={pass.id}
                  className={`group bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${isSelected ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200"
                    }`}
                >
                  <div className="p-4 md:p-5 flex flex-col sm:flex-row items-start gap-4">

                    {/* Checkbox & Index Column */}
                    <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOutpass(pass.id)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold rounded-full h-6 w-6">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Main Content Details */}
                    <div
                      onClick={() => SetExpandedId(isExpanded ? null : pass.id)}
                      className="flex-1 cursor-pointer space-y-1.5"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {pass.student.name}
                        </h2>
                        <span className="text-sm text-slate-500 font-bold">Sec: {pass.student.section}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-1" suppressHydrationWarning>
                          <span className="text-slate-400 font-medium">From:</span>
                          <span className="font-semibold text-slate-700">{new Date(pass.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="hidden sm:inline text-slate-300">•</div>
                        <div className="flex items-center gap-1" suppressHydrationWarning>
                          <span className="text-slate-400 font-medium">To:</span>
                          <span className="font-semibold text-slate-700">{new Date(pass.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Reason (Collapsible / Dynamic View) */}
                      {pass.reason && (
                        <div className={`mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all ${isExpanded ? "" : "line-clamp-1 sm:line-clamp-none text-slate-500"}`}>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Reason for leave</p>
                          <p className="text-sm italic text-slate-700">"{pass.reason}"</p>
                        </div>
                      )}
                    </div>

                    {/* Individual Action Action Control Panel */}
                    <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDecision(pass.id, "APPROVED")}
                        className="flex-1 sm:flex-none justify-center w-full sm:w-28 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl font-semibold text-xs transition-colors shadow-sm cursor-pointer inline-flex items-center"
                      >
                        {isLoading ? "..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setActiveRejectId(pass.id)}
                        className="flex-1 sm:flex-none justify-center w-full sm:w-28 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 rounded-xl font-semibold text-xs transition-colors cursor-pointer inline-flex items-center"
                      >
                        Reject
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        <RemarksModel
          isOpen={activeRejectId !== null}
          value={activeRejectId ? (remarks[activeRejectId] ?? "") : ""}
          onChange={(newValue) => activeRejectId && setRemarks({ ...remarks, [activeRejectId]: newValue })}
          onCancel={() => setActiveRejectId(null)}
          onConfirm={() => activeRejectId && handleDecision(activeRejectId, "REJECTED")} />
      </div>
      <RejectionString
        isOpen={confirmation}
        value={bulkRejection}
        onChange={(newValue) => { setBulkRejection(newValue) }}
        onCancel={() => { setConfirmation(false); setBulkRejection(""); }}
        onConfirm={() => { confirmationCheck(); }} />

    </div>
  );
}