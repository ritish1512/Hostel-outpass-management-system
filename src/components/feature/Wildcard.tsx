"use client";
import { Html5QrcodeScanner } from "html5-qrcode"
import { useEffect, useState, useRef } from "react"

export const Wildcard=()=>{
    const [isloading,setIsLoading] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(()=>{
        scannerRef.current = new Html5QrcodeScanner('reader',{fps:30,qrbox:200},false);
        const success= async(result:string)=>{
            if(isloading)return;
            setIsLoading(true);
            try {
                if(scannerRef.current){
                    scannerRef.current.clear();
                }
                //execution part
                
            } catch (err) {
                console.log(err instanceof Error ? err.message : String(err))
            } finally {
                setIsLoading(false);
                window.location.reload();
            }
             
        }
        const error = ()=>{

        }
        scannerRef.current.render(success,error);
        return()=>{
            if(scannerRef.current){
                scannerRef.current.clear().catch((err)=> console.log(err instanceof Error ? err.message : String(err)));
            }
        }
    },[])
    return(
        <div>
            <div id="reader"/>
        </div>
    )
}