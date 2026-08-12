import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { fetchOutpass } from "@/app/actions/fetchOutpass";
import LoginPage from "@/components/authentication/LoginPage";
import GatekeeperDashboard from "@/components/dashboard/Gatekeeperdashboard";
import Hoddashboard from "@/components/dashboard/Hoddashboard";
import Mentordashboard from "@/components/dashboard/Mentordashboard";
import Parentdashboard from "@/components/dashboard/Parentdashboard";
import Principaldashboard from "@/components/dashboard/Principaldashboard";
import Studentdashboard from "@/components/dashboard/Studentdashboard";
import Wardendashboard from "@/components/dashboard/Wardendashboard";
import { IOutpass } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return <LoginPage />;
  }
  const actorname = await prisma.user.findUnique({where:{id: session.user.id},select:{name:true}});
  const outpasses = (await fetchOutpass()) as IOutpass[];
  const role = String(session.user.role).toUpperCase();

  switch (role) {
    case "STUDENT":
      return <Studentdashboard outpasses={outpasses} studentId={session.user.id} />;
    case "PARENT":
      return <Parentdashboard outpasses={outpasses} actorName={actorname?.name ?? "Guest"} />;
    case "MENTOR":
      return <Mentordashboard outpasses={outpasses} actorName={actorname?.name ?? "Guest"} />;
    case "HOD":
      return <Hoddashboard outpasses={outpasses} actorName={actorname?.name ?? "Guest"} />;
    case "WARDEN":
      return <Wardendashboard outpasses={outpasses} actorName={actorname?.name ?? "Guest"} />;
    case "PRINCIPAL":
      return <Principaldashboard outpasses={outpasses} actorName={actorname?.name ?? "Guest"} />;
    case "GATEKEEPER":
      return <GatekeeperDashboard outpasses={outpasses} actorName={actorname?.name ?? "Guest"} />;
    default:
      return <LoginPage />;
  }
}
