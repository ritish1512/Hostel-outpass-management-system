"use client";

import { handleReviewAction } from "@/app/actions/handleReviewAction";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dashboardProps from "@/types/dashboard";

export default function Parentdashboard({ outpasses, actorName }: dashboardProps) {
  const searchParams = useSearchParams();
  const linkToken = searchParams.get("token") || undefined;
  
  const currentOutpass = outpasses[0];
  const [loading, setLoading] = useState<boolean>(false);
  const [gridOptions, setGridOptions] = useState<number[]>([]);

  // Calculate random misleading options alongside correct matching matrix code
  useEffect(() => {
    if (currentOutpass?.visualMatchCode) {
      const correct = currentOutpass.visualMatchCode;
      const options = new Set<number>([correct]);
      while (options.size < 4) {
        options.add(Math.floor(1000 + Math.random() * 9000));
      }
      setGridOptions(Array.from(options).sort(() => Math.random() - 0.5));
    }
  }, [currentOutpass]);

  if (!currentOutpass) {
    return <div className="p-6 text-slate-500 text-center font-black tracking-tight py-40">No pending outpass permissions found.</div>;
  }

  // Native Web Speech Synthesis Engine API (Reads metrics out loud in local dialect framework)
  const handleVoiceAnnounce = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const messageText = `Outpass request from ${currentOutpass?.student?.name}. Reason: ${currentOutpass.reason}. Please listen to your child and select the four digit verification matching block number.`;
      const utterance = new SpeechSynthesisUtterance(messageText);
      utterance.lang = "en-IN"; // Set to "hi-IN", "ta-IN", etc., depending on parental demographic mapping
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Audio features are not supported on this device browser console.");
    }
  };

  const handleVisualMatchSelection = async (selectedNumber: number) => {
    if (selectedNumber !== currentOutpass.visualMatchCode) {
      alert("Verification Code mismatched. Outpass execution halted.");
      return;
    }
    
    setLoading(true);
    try {
      await handleReviewAction(currentOutpass.id, "APPROVED", undefined, linkToken);
      alert("Outpass verification validated successfully! Permission granted.");
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePass = async () => {
    const confirmation = confirm("Are you sure you want to decline this request?");
    if (!confirmation) return;
    
    setLoading(true);
    try {
      await handleReviewAction(currentOutpass.id, "REJECTED", "Declined via parent remote secure screen terminal dashboard.", linkToken);
      alert("Request revoked.");
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 w-full max-w-2xl mx-auto gap-6 justify-center">
      
      {/* Header Block with Audio Trigger */}
      <div className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Outpass Request Verification</h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tap the speaker icon below to hear application logs aloud</p>
        
        <button 
          type="button" 
          onClick={handleVoiceAnnounce}
          className="w-20 h-20 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto transition-transform active:scale-95 cursor-pointer shadow-inner"
        >
          🔊
        </button>
      </div>

      {/* Primary Visual Matrix Matching Grid Block */}
      <div className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="text-sm font-bold text-slate-700">Select the 4-digit code matching your child's screen to <span className="text-emerald-600">APPROVE</span>:</div>
        
        <div className="grid grid-cols-2 gap-4">
          {gridOptions.map((num) => (
            <button
              key={num}
              type="button"
              disabled={loading}
              onClick={() => handleVisualMatchSelection(num)}
              className="py-6 px-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 active:scale-98 transition-all border-2 border-slate-200 rounded-xl font-black text-2xl text-slate-800 tracking-wider disabled:opacity-40 cursor-pointer shadow-sm"
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Revocation Terminal Node Block */}
      <div className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
        <button
          type="button"
          disabled={loading}
          onClick={handleRevokePass}
          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-99 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md text-sm tracking-wide"
        >
          🚫 REJECT APPLICATION (REJECT)
        </button>
      </div>

    </div>
  );
}
