"use server";

import { LeaveType, LeaveRequest, LeaveStatus, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export async function requestLeave(
    studentId: string,
    fromDate: Date | string|number,
    toDate: Date | string |number,
    reason: string,
    type: LeaveType = LeaveType.OUTING 
): Promise<LeaveRequest> {
    const onProcess = await prisma.leaveRequest.findMany({
        where: {
            studentId,
            status: {
                in: [LeaveStatus.PENDING, LeaveStatus.APPROVED]
            }
        }
    });
    if(onProcess.length>0)throw new Error("Your Previous outpass is on process");
    const now= new Date();
    if(fromDate<now || toDate<fromDate)throw new Error("Please enter the proper date and time");
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
