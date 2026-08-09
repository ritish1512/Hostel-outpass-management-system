"use server";

import { LeaveStatus, Role, WorkflowTier } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const nextTier: Record<WorkflowTier, WorkflowTier> = { 
    PARENT_REVIEW: WorkflowTier.MENTOR_REVIEW,
    MENTOR_REVIEW: WorkflowTier.HOD_REVIEW,
    HOD_REVIEW: WorkflowTier.PRINCIPAL_REVIEW,
    PRINCIPAL_REVIEW: WorkflowTier.WARDEN_REVIEW,
    WARDEN_REVIEW: WorkflowTier.GATEKEEPER_REVIEW,
    GATEKEEPER_REVIEW: WorkflowTier.WENT_OUT,
    WENT_OUT: WorkflowTier.COMPLETED,
    COMPLETED: WorkflowTier.COMPLETED,
    ARCHIEVED_REJECTED: WorkflowTier.ARCHIEVED_REJECTED,
    EXPIRED: WorkflowTier.EXPIRED
};

export async function handleReviewAction(
    requestId: string,
    action: "APPROVED" | "REJECTED", 
    remarks?: string
) {
    const session = await auth();
    if(!session){
        throw new Error("please login again");
    }
    const actorId = session.user.id;
    const [outPass, actor] = await Promise.all([
        prisma.leaveRequest.findUnique({ where: { id: requestId } }),
        prisma.user.findUnique({ where: { id: actorId } }),
    ]);
    if (!outPass) {
        console.log("Error happened in src/app/actions/leave.ts: Outpass not found");
        throw new Error("There is a problem with fetching the outpass");
    }

    if (!actor || !actor.role) {
        throw new Error("Unauthorized action: actor not found or role is missing.");
    }

    const tierRoleMap: Record<WorkflowTier, Role> = {
        PARENT_REVIEW: Role.PARENT,
        MENTOR_REVIEW: Role.MENTOR,
        HOD_REVIEW: Role.HOD,
        PRINCIPAL_REVIEW: Role.PRINCIPAL,
        WARDEN_REVIEW: Role.WARDEN,
        GATEKEEPER_REVIEW: Role.GATEKEEPER,
        WENT_OUT: Role.GATEKEEPER,
        COMPLETED: Role.GATEKEEPER,
        ARCHIEVED_REJECTED: Role.PARENT,
        EXPIRED: Role.PARENT,
    };

    const requiredRole = tierRoleMap[outPass.tier];
    if (requiredRole && actor.role !== requiredRole){
        throw new Error(`Unauthorized action: only ${requiredRole.toLowerCase()} can process tier ${outPass.tier}.`);
    }
    
    const dbActionStatus = action === "APPROVED" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

    if (dbActionStatus === LeaveStatus.REJECTED) {
        return await prisma.$transaction([
            prisma.leaveRequest.update({
                where: { id: requestId },
                data: { status: LeaveStatus.REJECTED, tier: WorkflowTier.ARCHIEVED_REJECTED }
            }),
            prisma.workflowLog.create({
                data: { leaveRequestId: requestId, actorId, action: dbActionStatus, remarks }
            })
        ]);
    }

    if (["COMPLETED", "ARCHIEVED_REJECTED", "EXPIRED"].includes(outPass.tier)) {
        throw new Error("This outpass can no longer be processed.");
    }

    const nextTierValue = nextTier[outPass.tier];
    if (!nextTierValue) {
        console.log("Error happened in src/app/actions/leave.ts: Invalid tier transformation");
        throw new Error("There is a problem with fetching the next tier");
    }

    let newStatus: LeaveStatus = LeaveStatus.PENDING;
    switch (nextTierValue) {
        case WorkflowTier.GATEKEEPER_REVIEW:
            newStatus = LeaveStatus.APPROVED;
            break;
        case WorkflowTier.COMPLETED:
            newStatus = LeaveStatus.COMPLETED;
            break;
        default:
            newStatus = LeaveStatus.PENDING;
    }

    const baseData: any = {
        status: newStatus,
        tier: nextTierValue,
        outTime: outPass.outTime,
        inTime: outPass.inTime
    };

    if (nextTierValue === "WENT_OUT") {
        baseData.outTime = new Date();
    }
    if (nextTierValue === "COMPLETED") {
        baseData.inTime = new Date();
    }

    return await prisma.$transaction([
        prisma.leaveRequest.update({
            where: { id: requestId },
            data: baseData
        }),
        prisma.workflowLog.create({
            data: { leaveRequestId: requestId, actorId, action: dbActionStatus }
        })
    ]);
}
