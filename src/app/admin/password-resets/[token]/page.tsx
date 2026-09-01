import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import RequestActionCard from "./RequestActionCard";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function PasswordResetAdminPage({ params }: PageProps) {
  const { token } = await params;
  
  // 1. Authenticate and authorize on the server side
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect("/login?callbackUrl=/admin/password-resets");
  }

  // 2. Fetch the request details to show contextual information in the UI
  const request = await prisma.passwordChange.findFirst({
    where: {
      activeToken: token,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  // If the token doesn't exist at all, return a 404 page
  if (!request) {
    notFound();
  }

  // 3. Evaluate client-side display states
  const isExpired = new Date() > new Date(request.expiryTime.getTime() + (5.5*60*60*1000));
  const isPending = request.passwordStatus === 'PENDING';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header branding */}
        <div className="bg-slate-900 px-6 py-8 text-center text-white">
          <h1 className="text-xl font-bold tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-slate-400 mt-1">Internal Security & Credentials Management</p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <RequestActionCard 
            token={token}
            request={{
              id: request.id,
              status: request.passwordStatus,
              expiryTime: request.expiryTime.toLocaleString("en-IN"),
              isExpired,
              isPending
            }}
            user={{
              name: request.user.name || "Unknown User",
              email: request.user.email,
            }}
          />
        </div>

      </div>
    </div>
  );
}