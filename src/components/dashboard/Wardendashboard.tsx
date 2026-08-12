"use client";
import { Suspense } from "react";
import dashboardProps from "@/types/dashboard";
import { useState } from "react";
import { handleReviewAction } from "@/app/actions/leave";
import { WentOutStudent } from "../feature/students-out";

export default function Wardendashboard({outpasses}:dashboardProps){
    const [outPassIds, setOupassIds] = useState<string[] >([]);
    const [loadingId, setLoadingId] = useState<string | null>("");
    const [bulkLoading, setBulkLoading] = useState<boolean>(false);
    const [showAbsent,setShowAbsent] = useState<Boolean>(false);

  
    const toggleSelectOutpass = (id: string) => {
      setOupassIds((prev) => prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]);
    };
  
    const handleDecision = async (requestId: string) => {
      setLoadingId(requestId);
      try {
        await handleReviewAction(requestId, "APPROVED");
        alert(`Request successfully marked as APPROVED`);
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingId("");
      }
    };
  
    const handleBulkDecision = async () => {
      if (outPassIds.length === 0) return alert("Please select at least one outpass");
      const confirmation = confirm("Are you sure about your decision?");
      if (!confirmation) return;
      setBulkLoading(true);
      try {
        for (const id of outPassIds) {
          await handleReviewAction(id, "APPROVED");
        }
        alert(`Bulk execution complete: ${outPassIds.length} requests updated.`);
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err));
      } finally {
        setBulkLoading(false);
      }
    };
  
  return(
  <div className="m-auto max-w-5xl">
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-700">
  <span className="text-sm font-medium">To see Went Out Students</span>
  <button 
    type="button" 
    onClick={() => setShowAbsent((prev) => !prev)} 
    className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors cursor-pointer"
  >
    Click here
  </button>
</div>
    {showAbsent && <WentOutStudent/>}
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
  (outPassIds.length > 0 && !showAbsent) ? 'max-h-20 opacity-100 my-2' : 'max-h-0 opacity-0 my-0'
  }`}>
  <div className="flex items-center justify-between w-[90%] mx-auto bg-slate-950 text-white p-3 rounded-xl shadow-lg border border-slate-800">
    
    {/* Left Section: Close and Count */}
    <div className="flex items-center gap-3">
      <button 
        type="button" 
        onClick={() => setOupassIds([])}
        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        aria-label="Clear selection"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          {outPassIds.length}
        </span>
        <span className="text-sm font-medium text-slate-300">Selected</span>
      </div>
    </div>

    {/* Right Section: Action Button */}
    <button 
      type="button"
      disabled={bulkLoading}
      onClick={handleBulkDecision}
      className="px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-none bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-colors"
    >
      Approve All
    </button>

  </div>
</div>

    <div>{!showAbsent && outpasses.map((pass)=>{
      const loading = pass.id === loadingId;
      const isSelected = outPassIds.includes(pass.id);
      return(
      <div key={pass.id} className="w-[90%] my-2 mx-auto flex items-center justify-between gap-4 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      
      {/* Left Section: Checkbox and Student Info */}
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectOutpass(pass.id)}
          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer transition-colors"
        />
        
        <div className="flex items-center gap-3">
          <h2 className="text-md font-semibold text-slate-800 tracking-tight">
            {pass.student.name}
          </h2>
          <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md">
            {pass.student.HostelRoomNo}
          </span>
        </div>
      </div>

      {/* Right Section: Action Button */}
      <button 
        type="button" 
        disabled={loading} 
        onClick={() => handleDecision(pass.id)}
        className="px-3 py-1.5 cursor-pointer text-md font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        {loading ? 'Approving...' : 'Approve'}
      </button>

    </div>

  )})}
    </div>
  </div>);
}