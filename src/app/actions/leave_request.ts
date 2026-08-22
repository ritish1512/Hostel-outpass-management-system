"use server";

import { LeaveType, LeaveRequest, LeaveStatus, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { rejectedLog } from "./rejectedLog";

export async function requestLeave(
    studentId: string,
    fromDateString: string,
    toDateString: string,
    reason: string,
    type: LeaveType = LeaveType.OUTING
) {
    const fromDate = new Date(fromDateString).valueOf();
    const toDate = new Date(toDateString).valueOf();
    const now = new Date().valueOf();
    
    if (isNaN(fromDate) || isNaN(toDate)) {
        throw new Error("Invalid date format provided.");
    }

    if (fromDate < now)
        throw new Error("Cannot apply for an outpass for a time in the past");
    if (fromDate > toDate)
        throw new Error("You can't come before you go");

    const latestOutpass = await prisma.leaveRequest.findFirst({
        where: { studentId },
        orderBy: { createdAt: "desc" },
    });

    if (latestOutpass) {
        // Check for outpass that is already in process
        if (latestOutpass.status === LeaveStatus.PENDING || latestOutpass.status === LeaveStatus.APPROVED)
            throw new Error("Your previous outpass is already in process");

        // Process for the rejected outpass
        if (latestOutpass.status === LeaveStatus.REJECTED) {
            const rejectedLogData = await rejectedLog(latestOutpass.id);
            if (rejectedLogData) {
                const cooldownTime = 24 * 60 * 60 * 1000;
                const rejectedTime = rejectedLogData.createdAt.getTime();
                const allowedTime = rejectedTime + cooldownTime;
                
                if (now < allowedTime) {
                    const allowedTimeString = new Date(allowedTime).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short"
                    });
                    throw new Error(`Try after ${allowedTimeString}`);
                }
            }
        }
    }

    try {
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                reason,
                startDate: new Date(fromDateString), 
                endDate: new Date(toDateString),
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
