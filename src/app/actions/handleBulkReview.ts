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
};

const tierRoleMap: Record<WorkflowTier, Role> = {
        PARENT_REVIEW: Role.PARENT,
        MENTOR_REVIEW: Role.MENTOR,
        HOD_REVIEW: Role.HOD,
        PRINCIPAL_REVIEW: Role.PRINCIPAL,
        WARDEN_REVIEW: Role.WARDEN,
        GATEKEEPER_REVIEW: Role.GATEKEEPER,
        WENT_OUT: Role.GATEKEEPER,
        COMPLETED: Role.GATEKEEPER,
        ARCHIEVED_REJECTED: Role.PARENT
    };

export async function handleBulkReview(
    requestIds: string[],
    action: "APPROVED" | "REJECTED",
    remarks?: string
) {
    const session = await auth();
    if (!session) {
        throw new Error("Session not found");
    }
    const actorId = session.user.id;
    const [leaveRequests, actor] = await Promise.all([
        prisma.leaveRequest.findMany({ where: { id:{in:requestIds} } }),
        prisma.user.findUnique({ where: { id: actorId } }),
    ]);
    if (leaveRequests.length===0) {
        throw new Error("There is a problem with fetching the outpasses");
    }

    if (!actor || !actor.role) {
        throw new Error("Unauthorized action: actor not found or role is missing.");
    }

    const dbActionStatus = action === "APPROVED" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    const now = Date.now();

    const txOperations = leaveRequests.flatMap((outPass) => {
    const requiredRole = tierRoleMap[outPass.tier];
    if (requiredRole && actor.role !== requiredRole) {
        throw new Error(`Unauthorized action: only ${requiredRole.toLowerCase()} can process tier ${outPass.tier}.`);
    }

    const crntStatus = outPass.status;
    if (crntStatus === LeaveStatus.COMPLETED || crntStatus === LeaveStatus.REJECTED || crntStatus === LeaveStatus.EXPIRED) {
        throw new Error("This outpass can no longer be processed.");
    }
    if (new Date(outPass.endDate).getTime() < now && outPass.tier !== WorkflowTier.WENT_OUT) {
        throw new Error("This outpass has expired and can no longer be processed.");
    }

    if (dbActionStatus === LeaveStatus.REJECTED) {
        return [
            prisma.leaveRequest.update({
                where: { id: outPass.id },
                data: { status: LeaveStatus.REJECTED, tier: WorkflowTier.ARCHIEVED_REJECTED }
            }),
            prisma.workflowLog.create({
                data: { leaveRequestId: outPass.id, actorId, action: dbActionStatus, remarks }
            })
        ];
    }
    if(crntStatus=== LeaveStatus.PENDING && actor.role===Role.GATEKEEPER){
        throw new Error("Please get approved first");
    }
    
    const endTime = new Date(outPass.endDate).getTime();
    let nextTierValue = nextTier[outPass.tier];
    if(endTime<now && outPass.tier!==WorkflowTier.WENT_OUT){
        nextTierValue = nextTier[WorkflowTier.ARCHIEVED_REJECTED];
    }
    if (!nextTierValue) {
        throw new Error("There is a problem with fetching the next tier");
    }

    let newStatus: LeaveStatus = LeaveStatus.PENDING;
    switch (nextTierValue) {
        case WorkflowTier.GATEKEEPER_REVIEW:
        case WorkflowTier.WENT_OUT:
            newStatus = LeaveStatus.APPROVED;
            break;
        case WorkflowTier.COMPLETED:
            newStatus = LeaveStatus.COMPLETED;
            break;
        default:
            newStatus = LeaveStatus.PENDING;
    }
    if(endTime<now && outPass.tier!== WorkflowTier.WENT_OUT){
        newStatus= LeaveStatus.EXPIRED;
    }
    const baseData = {
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

    return[
        prisma.leaveRequest.update({
            where: { id: outPass.id },
            data: baseData
        }),
        prisma.workflowLog.create({
            data: { leaveRequestId: outPass.id, actorId, action: dbActionStatus }
        })
    ];
});
    return await prisma.$transaction(txOperations,{
    maxWait: 5000, // Time to wait for a database connection (Default: 2000)
    timeout: 20000 // Extended transaction run time limit (Set to 20 seconds)
  });
}
