"use client";

import { useState, useEffect } from "react";
import { requestLeave } from "@/app/actions/leave_request";
import { LeaveStatus, LeaveType, WorkflowTier } from "@/generated/prisma";
import { formatDateTimeInIST } from "@/lib/dateTime";

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
  visualMatchCode: number;
}
interface rejectedLog {
  createdAt: Date;
  remarks: string | null;
}
interface StudentDashboardProps {
  outpasses: outpass[];
  studentId: string;
  rejectedLog: rejectedLog|null;
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
  const isExpired = latestOutpass?.status === LeaveStatus.EXPIRED;
  const onProcess = latestOutpass?.status === LeaveStatus.PENDING && !isExpired;
  const approved = latestOutpass?.status === LeaveStatus.APPROVED && !isExpired;

  useEffect(() => {
    if (rejectedLog) {
      setRejectReason(rejectedLog.remarks as string);

      const dbDate = new Date(rejectedLog.createdAt).getTime();

      setAllowedTime(dbDate + 24 * 60 * 60 * 1000);
    }
  }, [rejectedLog]);


  const showWildcard = latestOutpass?.status === LeaveStatus.REJECTED &&
    latestOutpass?.tier === WorkflowTier.ARCHIEVED_REJECTED &&
    (Date.now() < allowedTime) && !isExpired;


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
  };
  // 💡 Locate your submission trigger block and update it like this:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!reason || !fromDateString || !toDateString) return alert("Please supply all metrics.");

  setLoading(true);
  try {
    const response = await requestLeave(studentId, fromDateString, toDateString, reason, type);
    
    if (response?.success) {
      // 💡 Alert the student with their dynamic knowledge tokens immediately!
      alert(`Outpass Routed! Please tell your parents your code is: ${response.visualMatchCode}`);
      
      // OPTIONAL: Copy link to clipboard automatically so they can WhatsApp it
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(response.magicUrl);
        alert("Parent magic approval link copied to your clipboard automatically!");
      }
    }
    
    window.location.reload();
  } catch (err: any) {
    alert(err?.message || err);
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
            <div className="flex relative flex-col gap-2 p-4 bg-slate-100 border-slate-400 shadow shadow-slate-200 ring-2 ring-slate-300  text-gray-800 rounded-md max-w-[95%] mx-auto">
              <div className="w-0.5 bg-gray-500 h-[80%] absolute mt-1.5 z-1 ml-1.75"></div>
              {steps.map((step, index) => {
                return (
                  <div key={index} className={`flex items-center gap-2 `}>
                    <span className={`w-4 h-4 z-2 rounded-full ${index === currentStepIndex ? 'border-blue-700 border-4 animate-pulse bg-slate-100' : 'bg-gray-400'} ${index < currentStepIndex ? 'bg-green-600' : ''}`}></span>
                    <span className={`font-semibold ${index === currentStepIndex ? 'text-blue-600' : index < currentStepIndex ? 'text-green-500' : 'text-gray-500'}`}>{`${index < currentStepIndex ? completedCustomLabels[step] : stepCustomLabels[step]}`}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-2 group">Expiry timing: {formatDateTimeInIST(latestOutpass.endDate)}</div>
          </div>
          {/* 💡 Drop this alert box into your student view right inside your pending outpass dashboard view */}
{onProcess && latestOutpass?.tier === "PARENT_REVIEW" && latestOutpass?.visualMatchCode && (
  <div className="mt-6 p-6 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl text-center max-w-md mx-auto space-y-2 animate-pulse">
    <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Parent Approval Lock Active</h3>
    <p className="text-xs text-slate-500 font-medium">Call your parents and ask them to choose this number on their dashboard link:</p>
    <div className="text-4xl font-black text-amber-700 tracking-widest bg-white py-3 px-6 rounded-xl border border-amber-200 inline-block shadow-inner">
      {latestOutpass.visualMatchCode}
    </div>
  </div>
)}

        </>
      ) : approved ? (

        <div className="flex flex-col items-center justify-center p-6 my-10 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm mx-auto text-center transition-all duration-300 hover:shadow-2xl">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight ">
            Now you should be
            {latestOutpass?.tier === WorkflowTier.WENT_OUT ? " OUTSIDE " : " INSIDE "} the campus
          </span>
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
        <div>
          {isExpired && (
            <>
              <div className="px-2 py-1 border rounded-md bg-rose-100/50 text-red-700 font-semibold max-w-xl w-[90%] mx-auto mt-2">
                <div>Sorry your Outpass has been expired</div>
              </div>
            </>
          )}
          <div className="w-full max-w-2xl mx-auto mt-6 p-6 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-800">
  <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5">
    Apply for Outpass
  </h2>
  
  <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
    {/* Form Inputs Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fromDateString" className="text-sm font-medium text-slate-700">
          From Date
        </label>
        <input 
          type="datetime-local" 
          id="fromDateString" 
          value={fromDateString} 
          onChange={(e) => setfromDateString(e.target.value)} 
          className="p-2.5 outline-none border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800" 
          suppressHydrationWarning 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="toDateString" className="text-sm font-medium text-slate-700">
          To Date
        </label>
        <input 
          type="datetime-local" 
          id="toDateString" 
          value={toDateString} 
          onChange={(e) => settoDateString(e.target.value)} 
          className="p-2.5 outline-none border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800" 
          suppressHydrationWarning 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className="text-sm font-medium text-slate-700">
          Type
        </label>
        <select 
          id="type" 
          value={type} 
          onChange={(e) => setType(e.target.value as LeaveType)} 
          className="p-2.5 outline-none border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800" 
          suppressHydrationWarning
        >
          <option value={LeaveType.OUTING}>Outing</option>
          <option value={LeaveType.EMERGENCY}>Emergency</option>
          <option value={LeaveType.FUNCTION}>Function</option>
          <option value={LeaveType.PERSONAL_WORK}>Personal Work</option>
        </select>
      </div>
    </div>

    {/* Reason Input */}
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor="reason" className="text-sm font-medium text-slate-700">
          Reason
        </label>
        <span className="text-xs text-slate-400">
          {reason.length}/50
        </span>
      </div>
      <input 
        type="text" 
        maxLength={50} 
        id="reason" 
        value={reason} 
        onChange={(e) => setReason(e.target.value)} 
        placeholder="Briefly describe your reason..."
        className="p-2.5 outline-none border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder:text-slate-400" 
        suppressHydrationWarning 
      />
    </div>

    {/* Form Actions */}
    <div className="flex justify-end pt-2">
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
        suppressHydrationWarning
      >
        {loading ? 'Applying...' : 'Apply for Outpass'}
      </button>
    </div>
  </form>
</div>

        </div>)}
        
    </div>
    
  );
}