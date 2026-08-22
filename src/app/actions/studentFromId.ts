
"use server"
import prisma from "@/lib/prisma";
export async function studentFromId(sdntId: string) {
    try {
        if(!sdntId)throw new Error("Please try again");
        return await prisma.user.findFirst({
            where: {
                id: sdntId
            },
            include:{
                submittedLeaves:{
                    select:{
                        type:true,
                        reason:true,
                        startDate:true,
                        endDate:true,
                    },
                    orderBy:{
                        createdAt:"desc" as const,
                    }
                }
            }
        })
    } catch (err) {
        throw new Error("Something happened in our system");
    }
}