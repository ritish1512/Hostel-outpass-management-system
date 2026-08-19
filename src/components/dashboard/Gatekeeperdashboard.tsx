"use client";

import { handleReviewAction } from "@/app/actions/leave";
import { WorkflowTier } from "@/generated/prisma";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { Loading } from "../ui/Loader";

export default function GatekeeperDashboard() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isloading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "scanner",
      {
        fps: 30,
        qrbox: { width: 250, height: 250 }
      },
      /* verbose= */ false
    );

    const success = async (result: string) => {
      if (isloading) return;
      setIsLoading(true);
      try {
        if (scannerRef.current) {
          await scannerRef.current.clear();
        }
        const scan = await handleReviewAction(result, "APPROVED");
        if (scan[0].tier === WorkflowTier.COMPLETED) alert("Allowed inside.");
        else alert("Approved");
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
        window.location.reload();
      }
    };

    const fail = () => {};
    scannerRef.current.render(success, fail);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error(err instanceof Error ? err.message : String(err));
        });
      }
    };
  }, [isloading]);

  return (
    <div className="inset-0 bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4">
      {/* Dashboard Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gatekeeper Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Scan the QR code to verify entry approval</p>
        </div>

        {/* Scanner Body Wrap */}
        <div className="relative rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 min-h-75 flex items-center justify-center overflow-hidden">
          <div 
            id="scanner" 
            className="w-full h-full [&_video]:rounded-lg [&_video]:object-cover [&_button]:mt-4 [&_button]:px-4 [&_button]:py-2 [&_button]:bg-indigo-600 [&_button]:text-white [&_button]:font-medium [&_button]:rounded-lg [&_button]:shadow-sm [&_button]:hover:bg-indigo-700 [&_button]:transition-all [&_a]:text-indigo-600" 
          />
        </div>

        {/* Loading Overlay */}
        {isloading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Loading />
            <p className="text-sm font-medium text-slate-600 mt-3 animate-pulse">Verifying credentials...</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
