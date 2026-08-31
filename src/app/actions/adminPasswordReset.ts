"use server";
import { auth } from "@/auth";
import { LeaveStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";
export default async function PasswordReset(token: string, action: "Approved" | "Rejected") {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return { error: "Access denied" }
        }
        const request = await prisma.passwordChange.findFirst({
            where: {
                activeToken: token,
                passwordStatus: 'PENDING'
            },
            include: {
                user: {  //included user to use it in updating his/her record
                    select: {
                        id: true,
                        email: true,
                    }
                }
            }
        })
        if (!request) {
            return { error: "Invalid request" }
        }
        if (new Date() > request.expiryTime) {
            await prisma.passwordChange.update({
                where: { id: request.id },
                data: { passwordStatus: 'EXPIRED' }
            });
            return { error: "Token has expired" };
        }
        const decision = action === 'Approved' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
        if (decision === 'APPROVED') {
            await prisma.$transaction([
                prisma.user.update({
                    where: {
                        id: request.user.id
                    },
                    data: {
                        passwordHash: request.newPasswordHash
                    }
                }),
                prisma.passwordChange.update({
                    where: {
                        id: request.id
                    },
                    data: {
                        passwordStatus: decision,
                    }
                }),
            ])
        } else {
            await prisma.passwordChange.update({
                where: {
                    id: request.id
                },
                data: {
                    passwordStatus: decision,
                }
            })
        }
        return { success: true, message: `PasswordChange request for ${request.user.email} is updated to status: ${decision}` };
    } catch (err) {
        return { error: err }
    }
}