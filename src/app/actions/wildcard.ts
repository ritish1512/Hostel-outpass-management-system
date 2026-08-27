"use server"
import { LeaveStatus, LeaveType, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { parseDateTimeLocalAsIST } from "@/lib/dateTime";
export async function wildcard(passId: string, Wtype: LeaveType, Wreason: string, WstartDate: string, WendDate: string) {
    try {
        const startDate = parseDateTimeLocalAsIST(WstartDate);
        const endDate = parseDateTimeLocalAsIST(WendDate);
        if (startDate > endDate) {
            throw new Error("Start date cannot be after end date.");
        }

        return await prisma.leaveRequest.update({
            where: { id: passId },
            data: {
                type: Wtype,
                reason: `(WILDCARD)${Wreason}`,
                startDate,
                endDate,
                status: LeaveStatus.PENDING,
                tier: WorkflowTier.PRINCIPAL_REVIEW,
            }
        })
    } catch (err) {
        throw new Error("There is some problem in our system");
    }
}