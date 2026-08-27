"use client";
import { studentFromId } from "@/app/actions/studentFromId";
import { wildcard } from "@/app/actions/wildcard";
import { LeaveStatus, LeaveType } from "@/generated/prisma";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { formatDateTimeLocalInIST } from "@/lib/dateTime";

export const Wildcard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passId, setPassId] = useState<string>("");
  const [sdntName, setSdntName] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [lType, setLType] = useState<LeaveType>(LeaveType.EMERGENCY);

  // Use a ref to access the latest isLoading state inside the scanner callback
  const isLoadingRef = useRef(isLoading);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 30, qrbox: { width: 700, height: 700 } },
      false
    );

    const success = async (result: string) => {
      // Prevent double scanning using the ref
      if (isLoadingRef.current) return;
      setIsLoading(true);

      try {
        //fetching student details
        const sdnt = await studentFromId(result);
        //security check
        if (!sdnt || !sdnt.submittedLeaves || sdnt.submittedLeaves.length === 0) {
          alert("No student or active leaves found.");
          setIsLoading(false);
          return;
        }
        //rejected outpass
        const leave = sdnt.submittedLeaves[0];
        if(leave.status !== LeaveStatus.REJECTED){
            alert("The recent outpass is NOT REJECTED");
            window.location.reload();
            return;
        }

        //the main purpose of this
        setPassId(leave.id);
        setSdntName(sdnt.name || "");
        setReason(leave.reason || "");
        setFromDate(formatDateTimeLocalInIST(leave.startDate));
        setToDate(formatDateTimeLocalInIST(leave.endDate));
        setLType(leave.type as LeaveType);
        //clear component
        await scanner.clear();
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    const error = () => {};
    scanner.render(success, error);

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error("Cleanup error:", err));
      }
    };
  }, []);

  const giveWildCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await wildcard(passId, lType, reason, fromDate, toDate);
      alert("Wildcard leave submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit wildcard leave");
    } finally {
      setIsLoading(false);
      setPassId("");
    }
  };

  return (
    <div>
      {!passId && (
        <div className="max-w-2xl w-[90%] border-3 rounded-md mx-auto mt-2">
          <div
            id="reader"
            className="[&_button]:p-2 [&_button]:bg-blue-400 rounded-md [&_button]:rounded-2xl [&_button]:cursor-pointer [&_button]:hover:shadow-sm font-bold [&_video]:rounded-sm text-gray-800"
          />
        </div>
      )}

      {passId && (
        <div>
          <div className="text-center font-semibold mt-4 text-gray-700">
            Student: {sdntName} ({passId})
          </div>
          <div className="flex flex-col gap-2 max-w-[90%] md:w-max mx-auto mt-8 p-4 bg-slate-100 border-slate-400 shadow shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md">
            <h2 className="text-gray-950 font-bold text-tracking-tight text-xl">
              Wildcard
            </h2>
            <form className="flex flex-col gap-5 p-2 relative" onSubmit={giveWildCard}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="fromDateString"
                    className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                  >
                    From Date:
                  </label>
                  <input
                    type="datetime-local"
                    id="fromDateString"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="toDateString"
                    className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                  >
                    To Date:
                  </label>
                  <input
                    type="datetime-local"
                    id="toDateString"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="type"
                    className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                  >
                    Type:
                  </label>
                  <select
                    id="type"
                    value={lType}
                    onChange={(e) => setLType(e.target.value as LeaveType)}
                    className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                  >
                    <option value={LeaveType.OUTING}>Outing</option>
                    <option value={LeaveType.EMERGENCY}>Emergency</option>
                    <option value={LeaveType.FUNCTION}>Function</option>
                    <option value={LeaveType.PERSONAL_WORK}>Personal Work</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:w-[80%]">
                <label
                  htmlFor="reason"
                  className="py-1 px-2 bg-slate-300 border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                >
                  Reason:
                </label>
                <input
                  type="text"
                  maxLength={50}
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="p-2 outline-none border border-slate-400 shadow-slate-200 ring-2 ring-slate-300 text-gray-800 rounded-md"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="md:absolute right-2 bottom-2 disabled:opacity-80 disabled:cursor-not-allowed bg-green-400 py-1 px-2 md:py-2 md:px-4 border border-green-500 shadow-green-500 rounded-lg md:w-max font-bold text-xl md:text-2xl"
              >
                Allow
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
