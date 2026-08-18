"use server";

import { LeaveType, LeaveRequest, LeaveStatus, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export async function requestLeave(
    studentId: string,
    fromDateString: string,
    toDateString: string,
    reason: string,
    type: LeaveType = LeaveType.OUTING 
) {
    const fromDate = new Date(fromDateString);
    const toDate = new Date(toDateString);
    const outPasses = await prisma.leaveRequest.findMany({
        where: {
            studentId,
        },
        orderBy:{
            createdAt:"desc" as const,
        }
    });
    //check for outpass that is already in process
    if(outPasses[0].status=== LeaveStatus.PENDING || outPasses[0].status=== LeaveStatus.APPROVED)
        throw new Error("Your Previous outpass is on process");

    //check for the from and to date integrity and consitency
    const now = new Date();
    if(fromDate<now)
        throw new Error("Cannot apply for an outpass for a time in the past");
    if(fromDate>toDate)
        throw new Error("you can't come before you go");

    //Process for the rejected outpass
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
        const allowedTime = new Date(rejectedTime?.createdAt.getTime() as number + cooldownTime).toLocaleString('en-US');

        throw new Error("Try at " + allowedTime as unknown as string);
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
