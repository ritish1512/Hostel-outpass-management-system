
"use server";
import prisma from "@/lib/prisma";
export async function studentFromId(sdntId: string) {
    try {
        if(!sdntId)throw new Error("Please try again");
        return await prisma.user.findUnique({
            where: {
                id: sdntId
            },
            include:{
                submittedLeaves:{
                    select:{
                        id:true,
                        type:true,
                        reason:true,
                        startDate:true,
                        endDate:true,
                        status:true,
                    },
                    orderBy:{
                        createdAt:'desc',
                    }
                }
            }
        })
    } catch (err) {
        throw new Error("Something happened in our system");
    }
}