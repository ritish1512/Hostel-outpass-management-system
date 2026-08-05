"use server";

import { LeaveType, LeaveRequest, LeaveStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export async function requestLeave(
    studentId: string,
    fromDate: Date | string,
    toDate: Date | string,
    reason: string,
    type: LeaveType = LeaveType.OUTING 
): Promise<LeaveRequest> {
    const onProcess = await prisma.leaveRequest.findMany({
        where:{studentId,status:LeaveStatus.PENDING || LeaveStatus.APPROVED}
    });
    if(onProcess)throw new Error("Your Previous outpass is on process");
    try {
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                reason,
                startDate: new Date(fromDate),
                endDate: new Date(toDate),    
                type,
                studentId,
                status: "PENDING",             
                tier: "PARENT_REVIEW"         
            }
        });
        
        return leaveRequest;
    } catch (error) {
        console.error("Critical breakdown inside requestLeave server action:", error);
        throw new Error("Failed to initialize gate outpass workflow sequence.");
    }
}

export default requestLeave;
