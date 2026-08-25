import { Wildcard } from "@/components/feature/Wildcard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/user-role";
export default async function wildCard() {
    const session = await auth();
    if (!session || !session.user) return redirect('/login');
    if (session.user.role !== ("HOD" as UserRole)) return redirect('/');
    
    return (
        <div>
            <Wildcard />
        </div>
    );
}