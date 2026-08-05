// A:\Projects by ritish\campus-outpass-system\Outpass\src\app\actions\fetchOutpass.ts
import prisma from "@/lib/prisma";
import { auth } from '@/auth';
import { WorkflowTier, Role, LeaveStatus } from "@/generated/prisma";

export async function fetchOutpass() {
    const session = await auth();
    
    const currentRole = session?.user?.role?.toUpperCase() as Role;

    if (!session || !session.user?.id || !currentRole) {
        throw new Error("You are not authorized to view this page");
    }

    if (currentRole === Role.STUDENT) {
        try {
            return await prisma.leaveRequest.findMany({
                where: { studentId: session.user.id },
                orderBy: { createdAt: "desc" }
            });
        } catch (error) {
            throw new Error("Error fetching student outpass requests");
        }
    }

    let currentTier: WorkflowTier = "PARENT_REVIEW";
    switch (currentRole) {
        case Role.PARENT:
            currentTier = "PARENT_REVIEW";
            break;
        case Role.MENTOR:
            currentTier = "MENTOR_REVIEW";
            break;
        case Role.HOD:
            currentTier = "HOD_REVIEW";
            break;
        case Role.PRINCIPAL:
            currentTier = "PRINCIPAL_REVIEW";
            break;
        case Role.WARDEN:
            currentTier = "WARDEN_REVIEW";
            break;
        case Role.GATEKEEPER:
            currentTier = "GATEKEEPER_REVIEW";
            break;
        default:
            throw new Error("You are not authorized to view this page");
    }

    const baseCondition = {
        where: currentRole === Role.GATEKEEPER
            ? {
                tier: { in: [WorkflowTier.GATEKEEPER_REVIEW, WorkflowTier.WENT_OUT] },
                status: LeaveStatus.APPROVED,
            }
            : {
                tier: currentTier,
                status: LeaveStatus.PENDING,
            },
        include: {
            student: {
                select: {
                    name: true,
                    semester: true,
                    section: true,
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "asc" as const
        }
    };

    try {
        const outPasses = await prisma.leaveRequest.findMany(baseCondition);
        return outPasses;
    } catch (error) {
        console.error("Error executing fetchOutpass query:", error);
        throw new Error("Error fetching outpass requests from database");
    }
}
