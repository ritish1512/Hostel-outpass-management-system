import RegularLeave from "@/components/feature/RegularLeave";
import prisma from "@/lib/prisma";
import { StudentWithDepartment } from "@/components/feature/RegularLeave";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/user-role";
export default async function regularLeave() {

    const session = await auth();
    if (!session || !session.user) return redirect('/login');
    if (session.user.role !== ("PRINCIPAL" as UserRole)) return redirect('/');
    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: {
            id: true,
            name: true,
            section: true,
            semester: true,
            department: { select: { name: true } },
        },
    });
    return (
        <RegularLeave Students={students as StudentWithDepartment[]} />
    );
}