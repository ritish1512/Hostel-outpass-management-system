"use client";

import { useState, useTransition } from "react";
import PasswordReset from "@/app/actions/adminPasswordReset"; // Path to your server action
import { ShieldAlert, CheckCircle2, XCircle, Clock, Loader2, User } from "lucide-react";

interface RequestActionCardProps {
  token: string;
  request: {
    id: string;
    status: string;
    expiryTime: string;
    isExpired: boolean;
    isPending: boolean;
  };
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export default function RequestActionCard({ token, request, user }: RequestActionCardProps) {
  const [isPendingTransition, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const handleAction = (action: "Approved" | "Rejected") => {
    setResult(null);
    
    startTransition(async () => {
      try {
        // Calling your original server action directly
        const res = await PasswordReset(token, action);
        
        if ('error' in res) {
          setResult({ error: String(res.error) });
        } else {
          setResult({ success: true, message: res.message });
        }
      } catch (err) {
        setResult({ error: "An unexpected network error occurred." });
      }
    });
  };

  // 1. Success or Error State handling post-submission
  if (result) {
    return (
      <div className="text-center py-6 animate-fade-in">
        {result.success ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Request Processed</h3>
            <p className="text-sm text-slate-600 mt-2 px-4">{result.message}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <XCircle className="h-14 w-14 text-rose-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Action Failed</h3>
            <p className="text-sm text-rose-600 mt-2 px-4">{result.error}</p>
          </div>
        )}
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-4"
        >
          Refresh Page Status
        </button>
      </div>
    );
  }

  // 2. Already processed/Expired State check prior to actions
  if (!request.isPending || request.isExpired) {
    return (
      <div className="text-center py-6">
        {request.isExpired || request.status === 'EXPIRED' ? (
          <div className="flex flex-col items-center">
            <Clock className="h-14 w-14 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Token Expired</h3>
            <p className="text-sm text-slate-500 mt-1"> This request expired on:</p>
            <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded mt-2 text-slate-700">
              {new Date(request.expiryTime).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ShieldAlert className="h-14 w-14 text-indigo-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Already Handled</h3>
            <p className="text-sm text-slate-500 mt-1">
              Current system status: <span className="font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{request.status}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // 3. Normal Execution View (Pending state workflow)
  return (
    <div className="space-y-6">
      
      {/* Target User Info Block */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center space-x-4">
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
            <User className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
      </div>

      <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100/70 text-amber-800 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900">Reviewing Password Override Request</p>
          <p className="mt-1 text-amber-700 leading-relaxed">
            Approving this action overwrites this identity profile with a pre-staged credential hash. Ensure validity before signing off.
          </p>
        </div>
      </div>

      {/* Primary Management Operations */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={() => handleAction("Rejected")}
          disabled={isPendingTransition}
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors"
        >
          {isPendingTransition ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Reject Request
        </button>

        <button
          onClick={() => handleAction("Approved")}
          disabled={isPendingTransition}
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm disabled:opacity-50 transition-colors"
        >
          {isPendingTransition ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Approve & Save
        </button>
      </div>

    </div>
  );
}
