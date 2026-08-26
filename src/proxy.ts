import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  const token = await getToken({ req,secret:process.env.NEXTAUTH_SECRET });

  if (!token) {
    url.pathname = "/";
    url.search = "unauthenticated";
    return NextResponse.redirect(url);
  }

  const userRole = token.role;

  if (url.pathname.startsWith('/leave') && userRole !== 'PRINCIPAL') {
    url.pathname = "/";
    url.search = "illegal";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith('/wildcard') && userRole !== 'HOD') {
    url.pathname = "/";
    url.search = "illegal";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/leave/:path*', '/wildcard/:path*'],
};
