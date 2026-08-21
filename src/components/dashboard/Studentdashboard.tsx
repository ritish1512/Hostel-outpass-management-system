"use client";

import { useState, useRef, useEffect } from "react";
import requestLeave from "@/app/actions/leave_request";
import { LeaveStatus, LeaveType, WorkflowTier } from "@/generated/prisma";

export interface outpass {
  id: string;
  studentId: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
  type: LeaveType;
  status: string;
  tier: string;
  createdAt: Date | string;
  outTime?: Date | string | null;
  inTime?: Date | string | null;
}
interface rejectedLog {
  createdAt: Date;
  remarks: string | null;
}
interface StudentDashboardProps {
  outpasses: outpass[];
  studentId: string;
  rejectedLog: rejectedLog;
}

export default function StudentDashboard({ outpasses, studentId, rejectedLog }: StudentDashboardProps) {
  // Form State Configurations
  const [reason, setReason] = useState("");
  const [fromDateString, setfromDateString] = useState("");
  const [toDateString, settoDateString] = useState("");
  const [type, setType] = useState<LeaveType>("OUTING");
  const [loading, setLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const [allowedTime, setAllowedTime] = useState<number>(0);
  const [rejectReason, setRejectReason] = useState("");

  const latestOutpass = outpasses[0];
  const latestOutpassId = latestOutpass?.id;
  const onProcess = latestOutpass?.status === LeaveStatus.PENDING;
  const approved = latestOutpass?.status === LeaveStatus.APPROVED;

  useEffect(() => {
    if (rejectedLog) {
      setRejectReason(rejectedLog.remarks as string);

      const dbDate = new Date(rejectedLog.createdAt).getTime();

      setAllowedTime(dbDate + 24 * 60 * 60 * 1000);
    }
  }, [rejectedLog]);


  const showWildcard = latestOutpass?.status === LeaveStatus.REJECTED &&
    latestOutpass?.tier === WorkflowTier.ARCHIEVED_REJECTED &&
    (Date.now() < allowedTime);


  const steps = [WorkflowTier.PARENT_REVIEW, WorkflowTier.MENTOR_REVIEW, WorkflowTier.HOD_REVIEW, WorkflowTier.PRINCIPAL_REVIEW, WorkflowTier.WARDEN_REVIEW, WorkflowTier.GATEKEEPER_REVIEW];
  const currentStepIndex = onProcess ? steps.findIndex(step => step === latestOutpass.tier) : -1;
  const stepCustomLabels: Record<WorkflowTier, string> = {
    PARENT_REVIEW: "WAITING FOR PARENT APPROVAL",
    MENTOR_REVIEW: "WAITING FOR MENTOR APPROVAL",
    HOD_REVIEW: "WAITING FOR HOD APPROVAL",
    PRINCIPAL_REVIEW: "WAITING FOR PRINCIPAL APPROVAL",
    WARDEN_REVIEW: "WAITING FOR WARDEN APPROVAL",
    GATEKEEPER_REVIEW: "SCAN QR CODE FROM GATEKEEPER",
    WENT_OUT: "SCAN AGAIN TO GET INSIDE",
    COMPLETED: "COMPLETED",
    ARCHIEVED_REJECTED: "Archived Rejected",
    EXPIRED: "Expired",
  };
  const completedCustomLabels: Record<WorkflowTier, string> = {
    PARENT_REVIEW: "PARENT APPROVED",
    MENTOR_REVIEW: "MENTOR APPROVED",
    HOD_REVIEW: "HOD APPROVED",
    PRINCIPAL_REVIEW: "PRINCIPAL APPROVED",
    WARDEN_REVIEW: "WARDEN APPROVED",
    GATEKEEPER_REVIEW: "GATEKEEPER APPROVED",
    WENT_OUT: "RETURNED",
    COMPLETED: "COMPLETED",
    ARCHIEVED_REJECTED: "Archived Rejected",
    EXPIRED: "Expired",
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !fromDateString || !toDateString) return alert("Please supply all necessary outpass metrics.");

    setLoading(true);
    try {
      await requestLeave(studentId, fromDateString, toDateString, reason, type);
      alert("Outpass request successfully created and routed to tracking nodes!");
      window.location.reload();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {onProcess ? (
        <>
          <div className="max-w-6xl mx-auto">
            <h2 className="font-bold text-2xl p-4 ">Pass Process</h2>
            <span>{latestOutpass?.id}</span>
            <div className="flex flex-col gap-2 p-4 bg-slate-100 border-slate-400 shadow shadow-slate-200 ring-2 ring-slate-300  text-gray-800 rounded-md max-w-[95%] mx-auto">
              {steps.map((step, index) => {
                return (
                  <div key={index} className={`flex items-center gap-2 ${index === currentStepIndex ? 'text-green-600' : 'text-gray-500'} ${index < currentStepIndex ? 'line-through' : ''}`}>
                    <span className={`w-4 h-4 rounded-full ${index === currentStepIndex ? 'border-blue-700 border-4 animate-pulse' : 'bg-gray-400'} ${index < currentStepIndex ? 'bg-green-600' : ''}`}></span>
                    <span className={`${index === currentStepIndex ? 'text-blue-600' : 'text-gray-500'}`}>{`${index < currentStepIndex ? completedCustomLabels[step] : stepCustomLabels[step]}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : approved ? (
        <div className="flex flex-col items-center justify-center p-6 my-10 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm mx-auto text-center transition-all duration-300 hover:shadow-2xl">

          {/* QR Code Container */}
          <div className="relative p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner mb-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(latestOutpassId)}`}
              alt="Outpass QR code"
              className="w-55 h-55 rounded-lg object-contain bg-white"
            />
          </div>

          {/* Instruction Text */}
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Security Outpass
          </span>
          <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
            GET SCANNED BY GATEKEEPER TO
            {latestOutpass?.tier === WorkflowTier.WENT_OUT ? " ENTER COLLEGE" : " GO OUT"}
          </span>

        </div>
      ) : showWildcard ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 p-6 text-center antialiased">
          {/* Card Container */}
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">

            {/* Alert Header */}
            <div className="mb-6 flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Application Restricted</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600">
                You are not allowed to apply for an outpass until{" "}
                <span className="inline-block mt-1 font-semibold text-amber-700 bg-amber-50/50 px-2 py-1 rounded-md ">
                  {new Date(allowedTime).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </p>
            </div>

            {/* Rejection Reason Section */}
            <div className="mb-6 rounded-xl bg-rose-50/40 p-4 border border-rose-100 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Reason: </span>
              <p className="mt-1 text-sm font-medium text-gray-700">{rejectReason || "No reason specified by administration."}</p>
            </div>

            {/* QR Code Display Logic */}
            {showQr ? (
              <div className="flex flex-col items-center justify-center border-t border-gray-100 pt-6 animate-fade-in">
                <div className="relative rounded-2xl border-4 border-gray-100 bg-white p-4 shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(studentId)}`}
                    alt="student id qr"
                    className="h-36 w-36 rounded-lg"
                  />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Student ID QR</p>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-5 text-sm text-gray-500">
                <p className="inline leading-normal">If you need an outpass urgently within this time frame, please reach out to your HOD and ask them to scan your </p>
                <button
                  type="button"
                  onClick={() => setShowQr(true)}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 underline decoration-2 underline-offset-4 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
                >
                  QR Code
                </button>
              </div>
            )}
          </div>
        </div>

      ) : (
        <div className="flex flex-col gap-2 max-w-[90%] md:w-max mx-auto mt-8 p-4 bg-slate-100 border-slate-400 shadow shadow-slate-200 ring-2 ring-slate-300  text-gray-800 rounded-md">
          <h2 className="text-gray-950 font-bold text-tracking-tight">Apply for Outpass</h2>
          <form className="flex flex-col gap-5 p-2 relative" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="fromDateString" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">From Date:</label>
                <input type="datetime-local" id="fromDateString" value={fromDateString} onChange={(e) => setfromDateString(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md" suppressHydrationWarning />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="toDateString" className="py-1 px-2  bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">To Date:</label>
                <input type="datetime-local" id="toDateString" value={toDateString} onChange={(e) => settoDateString(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md" suppressHydrationWarning />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="type" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">Type:</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value as LeaveType)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md" suppressHydrationWarning>
                  <option value={LeaveType.OUTING}>Outing</option>
                  <option value={LeaveType.EMERGENCY}>Emergency</option>
                  <option value={LeaveType.FUNCTION}>Function</option>
                  <option value={LeaveType.PERSONAL_WORK}>Personal Work</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:w-[80%]">
              <label htmlFor="reason" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">Reason:</label>
              <input type="text" maxLength={50} id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md" suppressHydrationWarning />
            </div>
            <button type='submit' disabled={loading} className="md:absolute right-2 bottom-2 disabled:opacity-80 disabled:cursor-not-allowed bg-green-400 py-1 px-2 md:py-2 md:px-4 border border-green-500 shadow-green-500 rounded-lg md:w-max font-bold text-xl md:text-2xl" suppressHydrationWarning>
              Apply
            </button>
          </form>
        </div>)}
    </div>
  );
}