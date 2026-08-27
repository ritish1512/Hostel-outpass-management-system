"use server"
import prisma from "@/lib/prisma";
export async function rejectedLog(outPassId: string) {
    return await prisma.workflowLog.findFirst({
        where: {
            leaveRequestId: outPassId,
            action:'REJECTED'
        },
        orderBy: {
            createdAt: "desc"
        },
        select: {
            createdAt: true,
            remarks: true
        }
    });
}