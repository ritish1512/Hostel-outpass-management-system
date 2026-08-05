import { auth } from "@/auth";
import { fetchOutpass } from "@/app/actions/fetchOutpass";
import LoginPage from "@/components/LoginPage";
import GatekeeperDashboard from "@/components/dashboard/Gatekeeperdashboard";
import Hoddashboard from "@/components/dashboard/Hoddashboard";
import Mentordashboard from "@/components/dashboard/Mentordashboard";
import Parentdashboard from "@/components/dashboard/Parentdashboard";
import Principaldashboard from "@/components/dashboard/Principaldashboard";
import Studentdashboard from "@/components/dashboard/Studentdashboard";
import Wardendashboard from "@/components/dashboard/Wardendashboard";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return <LoginPage />;
  }

  const outpasses = await fetchOutpass();
  const role = String(session.user.role).toUpperCase();

  switch (role) {
    case "STUDENT":
      return <Studentdashboard outpasses={outpasses} studentId={session.user.id} />;
    case "PARENT":
      return <Parentdashboard outpasses={outpasses} actorId={session.user.id} />;
    case "MENTOR":
      return <Mentordashboard outpasses={outpasses} actorId={session.user.id} />;
    case "HOD":
      return <Hoddashboard outpasses={outpasses} actorId={session.user.id} />;
    case "WARDEN":
      return <Wardendashboard outpasses={outpasses} actorId={session.user.id} />;
    case "PRINCIPAL":
      return <Principaldashboard outpasses={outpasses} actorId={session.user.id} />;
    case "GATEKEEPER":
      return <GatekeeperDashboard outpasses={outpasses} actorId={session.user.id} />;
    default:
      return <LoginPage />;
  }
}
