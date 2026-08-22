"use client";
import { studentFromId } from "@/app/actions/studentFromId";
import { wildcard } from "@/app/actions/wildcard";
import { LeaveType } from "@/generated/prisma";
import { Html5QrcodeScanner } from "html5-qrcode"
import { useEffect, useState, useRef } from "react"

export const Wildcard = () => {
    const [isloading, setIsLoading] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [sdntId, setSdntId] = useState("");
    const [sdntName, setSdntName] = useState("");
    const [reason, setReason] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [Ltype,setLtype] = useState<LeaveType>(LeaveType.EMERGENCY);

    useEffect(() => {
        scannerRef.current = new Html5QrcodeScanner('reader', { fps: 30, qrbox: 200 }, false);
        const success = async (result: string) => {
            if (isloading) return;
            setIsLoading(true);
            try {
                if (scannerRef.current) {
                    scannerRef.current.clear();
                }
                setSdntId(result);
                const sdnt = await studentFromId(sdntId);

                setSdntName(sdnt?.name as string);
                setReason(sdnt?.submittedLeaves[0].reason as string);
                setFromDate(sdnt?.submittedLeaves[0].startDate.toLocaleString('en-IN',
                    { timeZone: "Asia/Kolkata" }) as string);
                setToDate(sdnt?.submittedLeaves[0].endDate.toLocaleString('en-IN',
                    { timeZone: "Asia/Kolkata" }) as string);
                setLtype(sdnt?.submittedLeaves[0].type as LeaveType);
            } catch (err) {
                console.log(err instanceof Error ? err.message : String(err))
            } finally {
                setIsLoading(false);
                window.location.reload();
            }

        }
        const error = () => {

        }
        scannerRef.current.render(success, error);
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err) => console.log(err instanceof Error ? err.message : String(err)));
            }
        }
    }, []);
    const giveWildCard= async()=>{
        try {
            await wildcard(sdntId,Ltype,reason,fromDate,toDate);
        } catch (error) {
            console.log('%s',error);
        }
    }
    return (
        <div>
            {!sdntId && <div id="reader" />}
            <div>
                {/*student form to edit(if needed) and give wildcard leave*/}
                
            </div>
        </div>
    )
}