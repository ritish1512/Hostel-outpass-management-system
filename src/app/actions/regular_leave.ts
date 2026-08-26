// @/app/actions/regular_leave.ts
"use server";

import prisma from "@/lib/prisma";
import { LeaveStatus, LeaveType, Role, WorkflowTier } from "@/generated/prisma";

interface IRegularLeaveParamType {
    startDate: string;
    endDate: string;
    Department?: string;
    Section?: string;
    Semester?: number;
}

export async function bulkRegisterRegularLeave({ Department, Section, Semester, startDate, endDate }: IRegularLeaveParamType) {
    try {

        // 1. Validate dates globally upfront
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return { success: false, message: "Invalid date format provided." };
        }
        if (fromDate > toDate) {
            return { success: false, message: "Start date cannot be after end date." };
        }

        // 2. Build dynamic filters to grab all target students
        const DeptF = Department? { department: { name: Department } } : undefined;
        const SecF = Section ? { section: Section } : undefined;
        const SemF = Semester ? { semester: Number(Semester) } : undefined;

        const students = await prisma.user.findMany({
            where: {
                role: Role.STUDENT,
                ...DeptF,//skips if undefined
                ...SecF,
                ...SemF,
            },
            select: { id: true },
        });

        if (students.length === 0) {
            return { success: false, message: "No students found matching these criteria." };
        }

        const studentIds = students.map((s) => s.id);

        // 3. Execution of transaction
        await prisma.$transaction(async (tx) => {
            //reject the on process outpass
            await tx.leaveRequest.updateMany({
                where: {
                    studentId: { in: studentIds },
                    status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] }
                },
                data: {
                    status: LeaveStatus.REJECTED,
                    tier: WorkflowTier.ARCHIEVED_REJECTED
                }
            });

            //array of data
            const leavePayloads = studentIds.map((id) => ({
                reason: "By Management",
                startDate: fromDate,
                endDate: toDate,
                type: 'REGULAR' as LeaveType,
                status: 'APPROVED' as LeaveStatus,
                tier: 'GATEKEEPER_REVIEW' as WorkflowTier,
                studentId: id,
            }));

            // Bulk insert all rows with a single command
            await tx.leaveRequest.createMany({
                data: leavePayloads
            });
        },{
    maxWait: 5000, // Time to wait for a database connection (Default: 2000)
    timeout: 20000 // Extended transaction run time limit (Set to 20 seconds)
  });

        return { 
            success: true, 
            message: `Successfully registered regular leave for ${students.length} students.` 
        };

    } catch (error) {
        console.error("Bulk leave processing breakdown:", error);
        return { success: false, message: "A critical database error occurred while batching requests." };
    }
}
