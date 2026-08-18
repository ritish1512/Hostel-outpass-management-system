"use client";
import { signOut } from "next-auth/react";

export const Logout= ()=>{
    return(
        <div className="fixed right-2 bottom-2">
        <button className="py-1 px-2 text-white font-semibold cursor-pointer text-lg bg-red-600 rounded-sm font-poppins border-red-900" type="button" onClick={()=>signOut()} suppressHydrationWarning>
            Logout
        </button>
        </div>
    )
}