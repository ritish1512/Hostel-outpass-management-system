"use client";

import { useState,useRef, useEffect } from "react";
import requestLeave from "@/app/actions/leave_request";
import { LeaveStatus, LeaveType, WorkflowTier } from "@/generated/prisma";
import * as QRCode from "qrcode";

export interface outpass{
  id: string;
  studentId: string;
  startDate: Date|string;
  endDate: Date|string;
  reason: string;
  type: LeaveType;
  status: string;
  tier: string;
  createdAt: Date|string;
  outTime?: Date|string | null;
  inTime?: Date|string | null;
}
interface StudentDashboardProps {
  outpasses: outpass[];
  studentId: string;
}

export default function StudentDashboard({ outpasses, studentId }: StudentDashboardProps) {
  // Form State Configurations
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState<LeaveType>("OUTING");
  const [loading, setLoading] = useState(false);



  const latestOutpass = outpasses[0];
  const latestOutpassId = latestOutpass?.id;
  const onProcess = latestOutpass?.status === LeaveStatus.PENDING;
  const approved = latestOutpass?.status === LeaveStatus.APPROVED;
  
  const steps =[WorkflowTier.PARENT_REVIEW,WorkflowTier.MENTOR_REVIEW,WorkflowTier.HOD_REVIEW,WorkflowTier.PRINCIPAL_REVIEW,WorkflowTier.WARDEN_REVIEW,WorkflowTier.GATEKEEPER_REVIEW];
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
  const completedCustomLabels :Record<WorkflowTier,string> = {
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
    if (!reason || !fromDate || !toDate) return alert("Please supply all necessary outpass metrics.");

    setLoading(true);
    try {
      await requestLeave(studentId, fromDate, toDate, reason, type);
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
        <div>
          <h2 className="font-bold text-2xl p-4 ">Pass Process</h2>
          <span>{latestOutpass?.id}</span>
            <div className="flex flex-col gap-2 p-4 bg-slate-100 border-slate-400 shadow shadow-slate-200 ring-2 ring-slate-300  text-gray-800 rounded-md max-w-[95%] mx-auto">
              {steps.map((step, index) => {
                return (
                  <div key={index} className={`flex items-center gap-2 ${index=== currentStepIndex ? 'text-green-600' : 'text-gray-500'} ${index < currentStepIndex ? 'line-through' : ''}`}>
                    <span className={`w-4 h-4 rounded-full ${index=== currentStepIndex ? 'border-blue-700 border-4 animate-pulse' : 'bg-gray-400'} ${index<currentStepIndex ? 'bg-green-600' : ''}`}></span>
                    <span className={`${index=== currentStepIndex ? 'text-blue-600' : 'text-gray-500'}`}>{`${index<currentStepIndex ? completedCustomLabels[step] :stepCustomLabels[step]}`}</span>
                  </div>
                );
              })}
            </div>
        </div>
      </>
      ):approved ? (
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
              {latestOutpass?.tier===WorkflowTier.WENT_OUT ? " ENTER COLLEGE":" GO OUT"}
            </span>
            
          </div>
                ) : (
        <div className="flex flex-col gap-2 max-w-[90%] md:w-max mx-auto mt-8 p-4 bg-slate-100 border-slate-400 shadow shadow-slate-200 ring-2 ring-slate-300  text-gray-800 rounded-md">
          <h2 className="text-gray-950 font-bold text-tracking-tight">Apply for Outpass</h2>
          <form className="flex flex-col gap-5 p-2 relative" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="fromDate" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">From Date:</label>
                <input type="datetime-local" id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md" suppressHydrationWarning/>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="toDate" className="py-1 px-2  bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">To Date:</label>
                <input type="datetime-local" id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md" suppressHydrationWarning/>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="type" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">Type:</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value as LeaveType)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">
                  <option value={LeaveType.OUTING}>Outing</option>
                  <option value={LeaveType.EMERGENCY}>Emergency</option>
                  <option value={LeaveType.FUNCTION}>Function</option>
                  <option value = {LeaveType.PERSONAL_WORK}>Personal Work</option>
                </select>
              </div> 
          </div>
          <div className="flex flex-col gap-2 md:w-[80%]">
            <label htmlFor="reason" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">Reason:</label>
            <input type="text" maxLength={50} id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md" suppressHydrationWarning/>
          </div>
          <button type='submit' disabled={loading} className="md:absolute right-2 bottom-2 disabled:opacity-80 disabled:cursor-not-allowed bg-green-400 py-1 px-2 md:py-2 md:px-4 border border-green-500 shadow-green-500 rounded-lg md:w-max font-bold text-xl md:text-2xl">
            Apply
          </button>
        </form>
      </div>)}
    </div>
  );
}