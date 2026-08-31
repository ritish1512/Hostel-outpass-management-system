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
    if(session?.user.email !== data.data.email){
        throw new Error("Illegal acitvity detected");
    }

    const passwordHash = await bcrypt.hash(data.data.password, 10);
    const activeToken = crypto.randomUUID().toString();
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 4);
    const expireAtUTC=(parseDateTimeLocalAsIST(expireAt.toString()))

    await prisma.passwordChange.updateMany({
        where: {
            userId: user.id,
            passwordStatus: 'PENDING'
        },
        data: {
            passwordStatus: 'EXPIRED'
        }
    })
    try {
        await prisma.passwordChange.create({
            data: {
                userId: user.id,
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