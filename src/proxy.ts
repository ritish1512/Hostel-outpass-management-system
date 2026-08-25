import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req:NextRequest){
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    
    return NextResponse.redirect(url);
}

export const config  = {
    matcher: '/testing/:path*',
}