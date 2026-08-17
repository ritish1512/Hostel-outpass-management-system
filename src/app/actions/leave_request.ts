"use server";

import { LeaveType, LeaveRequest, LeaveStatus, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export async function requestLeave(
    studentId: string,
    fromDate: Date | string|number,
    toDate: Date | string |number,
    reason: string,
    type: LeaveType = LeaveType.OUTING 
) {
    const outPasses = await prisma.leaveRequest.findMany({
        where: {
            studentId,
        },
        orderBy:{
            createdAt:"desc" as const,
        }
    });
    if(outPasses[0].status=== LeaveStatus.PENDING || outPasses[0].status=== LeaveStatus.APPROVED)
        throw new Error("Your Previous outpass is on process");

    const now = new Date();
    if(fromDate<now || toDate<fromDate)
        throw new Error("Please enter the proper date and time");

    if(outPasses[0].status===LeaveStatus.REJECTED){
        const rejectedTime = await prisma.workflowLog.findFirst({
            where:{
                leaveRequestId:outPasses[0].id,
            },
            select:{
                createdAt:true,
            }
        });
        const cooldownTime = 24*60*60*1000;
    }
    
    try {
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                reason,
                startDate: new Date(fromDate),
                endDate: new Date(toDate), 
                type,
                studentId,
                status: LeaveStatus.PENDING,             
                tier: WorkflowTier.PARENT_REVIEW         
            }
        });
        
        return leaveRequest;
    } catch (error) {
        console.error("Critical breakdown inside requestLeave server action:", error);
        throw new Error("Failed to initialize gate outpass workflow sequence.");
    }
}

export default requestLeave;
