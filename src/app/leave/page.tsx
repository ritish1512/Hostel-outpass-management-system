import RegularLeave from "@/components/feature/RegularLeave";
import prisma from "@/lib/prisma";
import { StudentWithDepartment } from "@/components/feature/RegularLeave";
export default async function regularLeave(){
    const students = await prisma.user.findMany({where:{role:'STUDENT'},include:{department:{select:{name:true}}}});
    return(
        <RegularLeave Students={students as StudentWithDepartment[]}/>
    );
}