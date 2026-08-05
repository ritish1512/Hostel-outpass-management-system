"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import requestLeave from "@/app/actions/leave_request";
import onProcess from "@/app/actions/leave_request";
import { LeaveStatus, LeaveType, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";

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

  const onProcess = outpasses.filter(p=>p.status ===LeaveStatus.PENDING || p.status === LeaveStatus.APPROVED)
  
  const steps =[WorkflowTier.PARENT_REVIEW,WorkflowTier.MENTOR_REVIEW,WorkflowTier.HOD_REVIEW,WorkflowTier.PRINCIPAL_REVIEW,WorkflowTier.WARDEN_REVIEW,WorkflowTier.GATEKEEPER_REVIEW,WorkflowTier.WENT_OUT,WorkflowTier.COMPLETED];
  const currentStepIndex = onProcess.length > 0 ? steps.findIndex(step => step === onProcess[0].tier) : -1;
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
      ) : (
        <div className="flex flex-col gap-2 max-w-[90%] md:w-max mx-auto mt-8 p-4 bg-slate-100 border-slate-400 shadow shadow-slate-200 ring-2 ring-slate-300  text-gray-800 rounded-md">
          <h2 className="text-gray-950 font-bold text-tracking-tight">Apply for Outpass</h2>
          <form className="flex flex-col gap-5 p-2 relative" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2">
            <label htmlFor="fromDate" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">From Date:</label>
            <input type="datetime-local" id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"/>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="toDate" className="py-1 px-2  bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">To Date:</label>
            <input type="datetime-local" id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"/>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">Type:</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as LeaveType)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">
              <option value={LeaveType.OUTING}>Outing</option>
              <option value={LeaveType.EMERGENCY}>Emergency</option>
              <option value={LeaveType.FUNCTION}>Special</option>
              <option value = {LeaveType.PERSONAL_WORK}>Personal Work</option>
            </select>
          </div> 
          </div>
          <div className="flex flex-col gap-2 md:w-[80%]">
            <label htmlFor="reason" className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">Reason:</label>
            <input type="text" maxLength={50} id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"/>
          </div>
          <button type='submit' disabled={loading} className="md:absolute right-2 bottom-2 disabled:opacity-80 disabled:cursor-not-allowed bg-green-400 py-1 px-2 md:py-2 md:px-4 border border-green-500 shadow-green-500 rounded-lg md:w-max font-bold text-xl md:text-2xl">
            Apply
          </button>
        </form>
      </div>)}
    </div>
  );
}