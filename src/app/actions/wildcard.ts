"use server"
import { LeaveStatus, LeaveType, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";
export async function wildcard(sdntId: string, Wtype: LeaveType, Wreason: string, WstartDate: string, WendDate: string) {
    try {
        const passId = await prisma.leaveRequest.findFirst({
            where: {
                studentId: sdntId
            }
        });
        const formattedReason = "(WILDCARD)" + Wreason;
        return await prisma.leaveRequest.update({
            where: {
                id: passId?.id
            },
            data: {
                type: Wtype,
                reason: formattedReason,
                startDate: WstartDate,
                endDate: WendDate,
                status: LeaveStatus.PENDING,
                tier: WorkflowTier.PRINCIPAL_REVIEW
            }
        });

    } catch (err) {
        throw new Error("There is some problem in our system");
    }
}