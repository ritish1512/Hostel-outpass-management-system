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

export async function handleReviewAction(
    requestId: string,
    action: "APPROVED" | "REJECTED",
    remarks?: string,
    parentBypassToken?: string // 💡 Optional parameter for passwordless validation
) {
    let actorId: string;
    let actorRole: Role;

    // Check if handling the passwordless token route
    if (parentBypassToken) {
        const targetPass = await prisma.leaveRequest.findUnique({
            where: { id: requestId },
            include: { student: true }
        });
        
        if (!targetPass || targetPass.parentSecretToken !== parentBypassToken) {
            throw new Error("Invalid or compromised secure verification transaction link.");
        }
        
        // Find parent account explicitly linked via relation matrix
        const parentUser = await prisma.user.findUnique({
            where: { id: targetPass.student.parentId || "" }
        });
        
        if (!parentUser) {
            throw new Error("No secure parent identity linked to this student node.");
        }
        
        actorId = parentUser.id;
        actorRole = Role.PARENT;
    } else {
        // Fall back to standard next-auth session for Mentor/HOD/Warden/Gatekeeper
        const session = await auth();
        if (!session) throw new Error("Session not found");
        
        const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!dbUser || !dbUser.role) throw new Error("Unauthorized identity.");
        
        actorId = dbUser.id;
        actorRole = dbUser.role;
    }

    const outPass = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!outPass) throw new Error("There is a problem with fetching the outpass");

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

    const requiredRole = tierRoleMap[outPass.tier];
    if (requiredRole && actorRole !== requiredRole) {
        throw new Error(`Unauthorized action: only ${requiredRole.toLowerCase()} can process tier ${outPass.tier}.`);
    }

    const dbActionStatus = action === "APPROVED" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    if (outPass.status === LeaveStatus.COMPLETED || outPass.status === LeaveStatus.REJECTED || outPass.status === LeaveStatus.EXPIRED) {
        throw new Error("This outpass can no longer be processed.");
    }
    
    if (new Date(outPass.endDate).getTime() < Date.now() && outPass.tier !== WorkflowTier.WENT_OUT) {
        throw new Error("This outpass has expired and can no longer be processed.");
    }

    if (dbActionStatus === LeaveStatus.REJECTED) {
        return await prisma.$transaction([
            prisma.leaveRequest.update({
                where: { id: requestId },
                data: { status: LeaveStatus.REJECTED, tier: WorkflowTier.ARCHIEVED_REJECTED }
            }),
            prisma.workflowLog.create({
                data: { leaveRequestId: requestId, actorId, action: dbActionStatus, remarks: remarks || "Declined by Parent via secure verification block." }
            })
        ]);
    }

    const now = Date.now();
    const endTime = new Date(outPass.endDate).getTime();
    let nextTierValue = nextTier[outPass.tier];
    
    if (endTime < now && outPass.tier !== WorkflowTier.WENT_OUT) {
        nextTierValue = nextTier[WorkflowTier.ARCHIEVED_REJECTED];
    }
    
    if (!nextTierValue) throw new Error("Problem fetching the next execution step.");

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
    
    if (endTime < now && outPass.tier !== WorkflowTier.WENT_OUT) {
        newStatus = LeaveStatus.EXPIRED;
    }

    // Clean up temporary secret values on successful verification to ensure single-use finality
    const baseData = {
        status: newStatus,
        tier: nextTierValue,
        outTime: outPass.outTime,
        inTime: outPass.inTime,
        parentSecretToken: null,
        visualMatchCode: null
    };

    if (nextTierValue === "WENT_OUT") baseData.outTime = new Date();
    if (nextTierValue === "COMPLETED") baseData.inTime = new Date();

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
