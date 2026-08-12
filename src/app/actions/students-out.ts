"use server";
import { auth } from "@/auth";
import { WorkflowTier, Role } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export async function Students_out() {
  const session = await auth();
   if (!session?.user?.id) {
    throw new Error("You must be logged in to view this data");
  }
  const currentUser = await prisma.user.findUnique({
    where: { id: session?.user.id },
    select: { role: true, HostelName: true },
  });

  if (currentUser?.role !== Role.WARDEN) {
    throw new Error("Role mismatch occured");
  }

  try {
    return await prisma.user.findMany({
      where: {
        HostelName: currentUser?.HostelName,
        submittedLeaves:{
            some:{
                tier:WorkflowTier.WENT_OUT
            }
        },
      },
      select: {
            name: true,
            HostelRoomNo: true,
      }
    });
  } catch (err) {
    console.error("Database Error:", err); 
    throw new Error("There is a problem in fetching details");
  }
}
