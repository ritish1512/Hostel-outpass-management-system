"use client";
import { handleReviewAction } from "@/app/actions/leave";
import { useState } from "react";
import dashboardProps from "@/types/dashboard";
import { RemarksModel } from "../feature/RemarksModel";


export default function Parentdashboard({ outpasses, actorName }: dashboardProps) {
  const currentOutpass = outpasses[0];
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setloading] = useState<boolean>(false);
  const [openRemarks, setOpenRemarks] = useState<boolean>(false);

  const handleRespond = async (action: "APPROVED" | "REJECTED") => {
    setloading(true);
    if (action === "REJECTED" && !remarks) throw new Error("Pleave fill out the remarks");
    try {
      await handleReviewAction(currentOutpass.id, action, remarks);
      alert("You action is submitted.");
      window.location.reload();
    } catch {
      throw new Error("Problem occured");
    } finally {
      setloading(false);
    }
  }

  if (!currentOutpass) {
    return <div className="p-6 text-slate-500 text-center  font-black tracking-tight py-50">There is no OUTPASS</div>;
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-[calc(dvh-25%)] p-4 sm:p-6 bg-slate-50 gap-6 w-full max-w-4xl mx-auto">
      <div className="text-2xl font-bold text-slate-800 tracking-tight">Welcome {actorName}</div>
      {/* Container for Info Blocks */}
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-stretch">

        {/* Student Details Card */}
        <div className="flex flex-col gap-3 w-full md:w-1/2 p-5 sm:p-6 bg-white border border-slate-200 shadow-md ring-1 ring-slate-200 text-slate-800 rounded-xl">
          <h2 className="font-bold text-xl sm:text-2xl pb-2 border-b border-slate-100 text-slate-900">Your Offspring Details</h2>
          <div className="flex flex-col gap-2 mt-2 text-sm sm:text-base">
            <h3 className="font-medium text-slate-500">NAME: <span className="tracking-tight font-bold text-slate-900">{(currentOutpass.student.name).toUpperCase()}</span></h3>
            <h3 className="font-medium text-slate-500">SEMESTER: <span className="font-semibold text-slate-900">"{currentOutpass.student.semester}"</span></h3>
            <h3 className="font-medium text-slate-500">DEPARTMENT: <span className="font-semibold text-slate-900">"{currentOutpass.student.department.name}"</span></h3>
            <h3 className="font-medium text-slate-500">SECTION: <span className="font-semibold text-slate-900">"{currentOutpass.student.section}"</span></h3>
          </div>
        </div>

        {/* Outpass Details Card */}
        <div className="flex flex-col gap-3 w-full md:w-1/2 p-5 sm:p-6 bg-white border border-slate-200 shadow-md ring-1 ring-slate-200 text-slate-800 rounded-xl justify-between">
          <div>
            <h3 className="font-bold text-xl sm:text-2xl pb-2 border-b border-slate-100 text-slate-900">Current Outpass</h3>
            <div className="flex flex-col gap-1.5 mt-4 text-sm sm:text-base">
              <h3 suppressHydrationWarning className="font-medium text-slate-700"><span className="font-semibold text-slate-900">From:</span> {new Date(currentOutpass.startDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</h3>
              <h3 suppressHydrationWarning className="font-medium text-slate-700"><span className="font-semibold text-slate-900">To:</span> {new Date(currentOutpass.endDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</h3>
              <p className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 italic text-sm">"{currentOutpass.reason}"</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => { e.preventDefault(); handleRespond("APPROVED"); }}
              className="flex-1 cursor-pointer font-semibold text-center justify-center rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Grant
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => { e.preventDefault(); setOpenRemarks(true); }}
              className="flex-1 cursor-pointer font-semibold text-center justify-center rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>

      <RemarksModel
        isOpen={openRemarks}
        value={remarks}
        onChange={(newValue: string) => setRemarks(newValue)}
        onCancel={() => setOpenRemarks(false)}
        onConfirm={() => handleRespond("REJECTED")} />


    </div>
  );
}