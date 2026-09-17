"use server";

import { LeaveType, LeaveStatus, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { parseDateTimeLocalAsIST } from "@/lib/dateTime";
import { rejectedLog } from "./rejectedLog";
import crypto from "crypto";

export async function requestLeave(
    studentId: string,
    fromDateString: string,
    toDateString: string,
    reason: string,
    type: LeaveType = LeaveType.OUTING
) {
    const fromDateValue = parseDateTimeLocalAsIST(fromDateString).valueOf();
    const toDateValue = parseDateTimeLocalAsIST(toDateString).valueOf();
    const now = new Date().valueOf();
    
    if (isNaN(fromDateValue) || isNaN(toDateValue)) {
        throw new Error("Invalid date format provided.");
    }

    if (fromDateValue < now)
        throw new Error("Cannot apply for an outpass for a time in the past");
    if (fromDateValue > toDateValue)
        throw new Error("You can't come before you go");

    const latestOutpass = await prisma.leaveRequest.findFirst({
        where: { studentId },
        orderBy: { createdAt: "desc" },
    });

    if (latestOutpass) {
        if (latestOutpass.status === LeaveStatus.PENDING || latestOutpass.status === LeaveStatus.APPROVED)
            throw new Error("Your previous outpass is already in process");

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

    // 💡 Generate low-literacy safety keys
    const parentSecretToken = crypto.randomBytes(32).toString("hex"); 
    const visualMatchCode = Math.floor(1000 + Math.random() * 9000); // Dynamic 4-digit token layout

    try {
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                reason,
                startDate: new Date(fromDateValue),
                endDate: new Date(toDateValue),
                type,
                studentId,
                status: LeaveStatus.PENDING,
                tier: WorkflowTier.PARENT_REVIEW,
                parentSecretToken,
                visualMatchCode
            }
        });

        // Return token to frontend so student can prompt the parent link safely
        return {
            success: true,
            id: leaveRequest.id,
            visualMatchCode: leaveRequest.visualMatchCode,
            magicUrl: `https://outpass-engine.vercel.app/{parentSecretToken}`
        };
    } catch (error) {
        throw new Error("Error occurred while generating outpass payload structure.");
    }
}
