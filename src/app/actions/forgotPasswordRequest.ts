'use server';
import prisma from "@/lib/prisma";
import { authSchema } from "@/validations/login";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { parseDateTimeLocalAsIST } from "@/lib/dateTime";

export default async function CreateForgetPassword(email: string, password: string) {
    const session = await auth();

    const data = authSchema.safeParse({ email, password });
    if (!data.success) {
        throw new Error("Error occurs while validation");
    }
    const user = await prisma.user.findUnique({ where: { email: data.data.email } });
    if (!user) {
        throw new Error("User not found")
    }

    const passwordHash = await bcrypt.hash(data.data.password, 10);
    const activeToken = crypto.randomUUID().toString();
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 24);
    const expireAtUTC = (parseDateTimeLocalAsIST(expireAt.toISOString().slice(0, 16)))

    const recentRequest = await prisma.passwordChange.findFirst({
        where: {
            userId: user?.id,
            passwordStatus: 'PENDING'
        }, orderBy: {
            createdAt: 'desc'
        }
    });
    if (recentRequest?.expiryTime && (recentRequest?.expiryTime.getTime() + 5.5 * 60 * 60 * 1000 > Date.now())) {
        await prisma.passwordChange.update({
            where: {
                id:recentRequest.id,
            },
            data: {
                passwordStatus: 'EXPIRED',
            }
        }).catch(() => {
            throw new Error("Server failure");
        });
        throw new Error("You should wait for the previous one to be processed");
    }
    try {
        await prisma.passwordChange.create({
            data: {
                userId: user?.id,
                newPasswordHash: passwordHash,
                activeToken,
                expiryTime: expireAtUTC
            }
        })
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    } catch (error) {
        throw new Error("Server failure")
    }
}