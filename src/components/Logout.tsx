"use client";
import { signOut } from "next-auth/react";

export const Logout= ()=>{
    return(
        <div className="fixed right-2 bottom-2">
        <button className="py-2 px-4 text-2xl bg-red-600 rounded-2xl border-red-900" type="button" onClick={()=>signOut()}>
            Logout
        </button>
        </div>
    )
}