"use server"
import { LeaveStatus, LeaveType, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";
export async function wildcard(passId: string, Wtype: LeaveType, Wreason: string, WstartDate: string, WendDate: string) {
    try {
        return await prisma.leaveRequest.update({
            where: { id: passId },
            data: {
                type: Wtype,
                reason: `(WILDCARD)${Wreason}`,
                startDate: new Date(WstartDate),
                endDate: new Date(WendDate),
                status: LeaveStatus.PENDING,
                tier: WorkflowTier.PRINCIPAL_REVIEW,
            }
        })
    } catch (err) {
        throw new Error("There is some problem in our system");
    }
}