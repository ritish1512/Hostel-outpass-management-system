import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { success } from "zod";


export default async function CreateForgetPassword(email:string,password:string){
    const user = await prisma.user.findUnique({where:{email}});
    if(!user){
        return {error:"User not found"};
    }

    const passwordHash =await bcrypt.hash(password,10);
    const activeToken = crypto.randomUUID().toString();
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours()+4);

    await prisma.passwordChange.updateMany({
        where:{
            userId:user.id,
            passwordStatus:'PENDING'
        },
        data:{
            passwordStatus:'EXPIRED'
        }
    })
    try {
        await prisma.passwordChange.create({
            data:{
                userId:user.id,
                newPasswordHash:passwordHash,
                activeToken,
                expiryTime:expireAt
            }
        })
        return NextResponse.json({
            success:true,
            message:"Request submitted"
        })
    } catch (error) {
        return {error:"something went wrong"}
    }

}